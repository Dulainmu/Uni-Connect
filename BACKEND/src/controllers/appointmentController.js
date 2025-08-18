const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Slot = require('../models/Slot');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Students, Lecturers, Admins)
const createAppointment = async (req, res) => {
  console.log('=== CREATE APPOINTMENT ENDPOINT CALLED ===');
  try {
    console.log('Create appointment request body:', req.body);
    console.log('User from request:', req.user);
    
    const { 
      staffId, 
      date, 
      startTime, 
      endTime, 
      location, 
      purpose, 
      description 
    } = req.body;

    // Validate required fields
    if (!staffId || !date || !startTime || !endTime || !location || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Staff, date, start time, end time, location, and purpose are required'
      });
    }

    // Validate that the staff member exists and is a lecturer
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'lecturer') {
      return res.status(400).json({
        success: false,
        message: 'Selected staff member must be a lecturer'
      });
    }

    // Check for time conflicts
    const hasConflict = await Appointment.checkTimeConflict(staffId, date, startTime, endTime);
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot conflicts with an existing appointment'
      });
    }

    // If lecturer-defined slots exist for this date, ensure requested time fits within a slot
    const existingSlots = await Slot.find({ staff: staffId, date: date, isActive: true });
    if (existingSlots.length > 0) {
      const toMinutes = (time) => {
        const [t, mod] = time.split(' ');
        let [h, m] = t.split(':');
        h = parseInt(h);
        if (mod === 'PM' && h !== 12) h += 12; else if (mod === 'AM' && h === 12) h = 0;
        return h * 60 + parseInt(m);
      };
      const reqStart = toMinutes(startTime);
      const reqEnd = toMinutes(endTime);
      const fitsAnySlot = existingSlots.some(slot => {
        const slotStart = toMinutes(slot.startTime);
        const slotEnd = toMinutes(slot.endTime);
        return reqStart >= slotStart && reqEnd <= slotEnd;
      });
      if (!fitsAnySlot) {
        return res.status(400).json({
          success: false,
          message: 'Selected time does not match any available slot for this lecturer on the chosen date'
        });
      }
    }

    console.log('Creating appointment with data:', {
      student: req.user._id,
      staff: staffId,
      date,
      startTime,
      endTime,
      location,
      purpose,
      description
    });

    // Create appointment
    const appointment = await Appointment.create({
      student: req.user._id,
      staff: staffId,
      date,
      startTime,
      endTime,
      location,
      purpose,
      description
    });

    console.log('Appointment created successfully:', appointment);

    // Populate user information
    await appointment.populate('student', 'firstName lastName email role studentId');
    await appointment.populate('staff', 'firstName lastName email role department');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

// @desc    Get appointments by role
// @route   GET /api/appointments/:role
// @access  Private
const getAppointmentsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Validate role parameter
    if (!['student', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role parameter'
      });
    }

    // Check if user has permission to view appointments for this role
    if (userRole === 'student' && role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students can only view their own appointments'
      });
    }

    let appointments;
    if (role === 'student') {
      // Students can only see their own appointments
      appointments = await Appointment.find({ student: userId })
        .populate('student', 'firstName lastName email role studentId')
        .populate('staff', 'firstName lastName email role department')
        .sort({ date: 1, startTime: 1 });
    } else if (role === 'lecturer') {
      // Lecturers can see appointments assigned to them
      if (userRole === 'lecturer') {
        appointments = await Appointment.find({ staff: userId })
          .populate('student', 'firstName lastName email role studentId')
          .populate('staff', 'firstName lastName email role department')
          .sort({ date: 1, startTime: 1 });
      } else if (userRole === 'admin') {
        // Admins can see all lecturer appointments
        appointments = await Appointment.find({})
          .populate('student', 'firstName lastName email role studentId')
          .populate('staff', 'firstName lastName email role department')
          .sort({ date: 1, startTime: 1 });
      }
    } else if (role === 'admin' && userRole === 'admin') {
      // Only admins can see all appointments
      appointments = await Appointment.find({})
        .populate('student', 'firstName lastName email role studentId')
        .populate('staff', 'firstName lastName email role department')
        .sort({ date: 1, startTime: 1 });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: {
        appointments
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/ticket/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department')
      .populate('cancelledBy', 'firstName lastName email role');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to view this appointment
    const canView = 
      req.user.role === 'admin' ||
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.staff._id.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { 
      date, 
      startTime, 
      endTime, 
      location, 
      purpose, 
      description, 
      notes, 
      status 
    } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to update this appointment
    const canUpdate = 
      req.user.role === 'admin' ||
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.staff._id.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this appointment'
      });
    }

    // Check for time conflicts if time is being updated
    if ((date || startTime || endTime) && appointment.status !== 'cancelled') {
      const checkDate = date || appointment.date;
      const checkStartTime = startTime || appointment.startTime;
      const checkEndTime = endTime || appointment.endTime;
      const staffId = appointment.staff._id;

      const hasConflict = await Appointment.checkTimeConflict(
        staffId, 
        checkDate, 
        checkStartTime, 
        checkEndTime, 
        appointmentId
      );
      
      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'This time slot conflicts with an existing appointment'
        });
      }
    }

    // Update fields
    if (date) appointment.date = date;
    if (startTime) appointment.startTime = startTime;
    if (endTime) appointment.endTime = endTime;
    if (location) appointment.location = location;
    if (purpose) appointment.purpose = purpose;
    if (description !== undefined) appointment.description = description;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;

    await appointment.save();

    // Populate updated appointment
    await appointment.populate('student', 'firstName lastName email role studentId');
    await appointment.populate('staff', 'firstName lastName email role department');
    await appointment.populate('cancelledBy', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   POST /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to cancel this appointment
    const canCancel = 
      req.user.role === 'admin' ||
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.staff._id.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this appointment'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    // Cancel appointment
    await appointment.cancelAppointment(req.user._id, reason);

    // Populate updated appointment
    await appointment.populate('student', 'firstName lastName email role studentId');
    await appointment.populate('staff', 'firstName lastName email role department');
    await appointment.populate('cancelledBy', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// @desc    Confirm appointment
// @route   POST /api/appointments/:id/confirm
// @access  Private (Staff only)
const confirmAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to confirm this appointment
    const canConfirm = 
      req.user.role === 'admin' ||
      appointment.staff._id.toString() === req.user._id.toString();

    if (!canConfirm) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to confirm this appointment'
      });
    }

    // Check if appointment can be confirmed
    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending appointments can be confirmed'
      });
    }

    // Confirm appointment
    await appointment.confirmAppointment();

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming appointment',
      error: error.message
    });
  }
};

// @desc    Complete appointment
// @route   POST /api/appointments/:id/complete
// @access  Private (Staff only)
const completeAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('student', 'firstName lastName email role studentId')
      .populate('staff', 'firstName lastName email role department');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to complete this appointment
    const canComplete = 
      req.user.role === 'admin' ||
      appointment.staff._id.toString() === req.user._id.toString();

    if (!canComplete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to complete this appointment'
      });
    }

    // Check if appointment can be completed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed appointments can be completed'
      });
    }

    // Complete appointment
    await appointment.completeAppointment();

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
};

// @desc    Get available staff for appointments
// @route   GET /api/appointments/staff
// @access  Private
const getAvailableStaff = async (req, res) => {
  try {
    const staff = await User.find({ 
      role: 'lecturer', 
      isActive: true 
    })
      .select('firstName lastName email department')
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: {
        staff
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats/:role
// @access  Private
const getAppointmentStats = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchQuery = {};

    if (role === 'student') {
      matchQuery = { student: userId };
    } else if (role === 'lecturer') {
      if (userRole === 'lecturer') {
        matchQuery = { staff: userId };
      }
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments(matchQuery);
    const pendingAppointments = await Appointment.countDocuments({ ...matchQuery, status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ ...matchQuery, status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ ...matchQuery, status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ ...matchQuery, status: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment statistics',
      error: error.message
    });
  }
};

// @desc    Get staff availability for a specific date
// @route   GET /api/appointments/availability/:staffId/:date
// @access  Private
const getStaffAvailability = async (req, res) => {
  try {
    const { staffId, date } = req.params;

    // Validate staff exists
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'lecturer') {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Get appointments for the specified date
    const appointments = await Appointment.find({
      staff: staffId,
      date: date,
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ startTime: 1 });

    // Prefer lecturer-defined slots if present
    const slots = await Slot.find({ staff: staffId, date: date, isActive: true }).sort({ startTime: 1 });

    let availableSlots = [];
    if (slots.length > 0) {
      // Remove parts of slots that are occupied by appointments; return remaining slot ranges
      const toMinutes = (time) => {
        const [t, mod] = time.split(' ');
        let [h, m] = t.split(':');
        h = parseInt(h);
        if (mod === 'PM' && h !== 12) h += 12; else if (mod === 'AM' && h === 12) h = 0;
        return h * 60 + parseInt(m);
      };

      // Build occupied intervals from appointments
      const occupied = appointments.map(a => ({ start: toMinutes(a.startTime), end: toMinutes(a.endTime) }));

      for (const slot of slots) {
        const sStart = toMinutes(slot.startTime);
        const sEnd = toMinutes(slot.endTime);
        // Start with the full slot, subtract occupied intervals
        let fragments = [{ start: sStart, end: sEnd }];
        for (const occ of occupied) {
          const nextFragments = [];
          for (const frag of fragments) {
            // no overlap
            if (occ.end <= frag.start || occ.start >= frag.end) {
              nextFragments.push(frag);
            } else {
              // overlap: keep left part
              if (occ.start > frag.start) {
                nextFragments.push({ start: frag.start, end: Math.max(frag.start, occ.start) });
              }
              // keep right part
              if (occ.end < frag.end) {
                nextFragments.push({ start: Math.min(occ.end, frag.end), end: frag.end });
              }
            }
          }
          fragments = nextFragments;
        }
        // Convert fragments back to HH:MM AM/PM boundaries rounded to hour marks
        const toLabel = (mins) => {
          let h = Math.floor(mins / 60);
          const m = mins % 60;
          const mod = h >= 12 ? 'PM' : 'AM';
          if (h === 0) h = 12; else if (h > 12) h = h - 12;
          const mm = m.toString().padStart(2, '0');
          return `${h}:${mm} ${mod}`;
        };
        for (const f of fragments) {
          if (f.end - f.start >= 30) { // expose fragments of at least 30 minutes
            availableSlots.push({ startTime: toLabel(f.start), endTime: toLabel(f.end), available: true });
          }
        }
      }
    } else {
      // Fallback to business hours (9-5) in 1-hour blocks if no slots defined
      const businessHours = [];
      for (let hour = 9; hour <= 16; hour++) {
        const time = `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`;
        businessHours.push(time);
      }
      for (let i = 0; i < businessHours.length - 1; i++) {
        const startTime = businessHours[i];
        const endTime = businessHours[i + 1];
        const hasConflict = appointments.some(appointment => {
          const appointmentStart = appointment.convertTo24Hour(appointment.startTime);
          const appointmentEnd = appointment.convertTo24Hour(appointment.endTime);
          const slotStart = appointment.convertTo24Hour(startTime);
          const slotEnd = appointment.convertTo24Hour(endTime);
          return (slotStart < appointmentEnd && slotEnd > appointmentStart);
        });
        if (!hasConflict) {
          availableSlots.push({ startTime, endTime, available: true });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        staff: {
          id: staff._id,
          name: `${staff.firstName} ${staff.lastName}`,
          department: staff.department
        },
        date: date,
        appointments: appointments,
        availableSlots: availableSlots
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff availability',
      error: error.message
    });
  }
};

// @desc    Create lecturer-defined slot
// @route   POST /api/appointments/slots
// @access  Private (Lecturers, Admins)
const createSlot = async (req, res) => {
  try {
    const userRole = req.user.role;
    const staffId = userRole === 'lecturer' ? req.user._id : (req.body.staffId || req.user._id);
    const { date, startTime, endTime, location, notes } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Date, start time and end time are required' });
    }

    // Validate staff exists and is lecturer
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'lecturer') {
      return res.status(400).json({ success: false, message: 'Staff must be a lecturer' });
    }

    // Ensure slot does not overlap existing active slots
    const toMinutes = (time) => {
      const [t, mod] = time.split(' ');
      let [h, m] = t.split(':');
      h = parseInt(h);
      if (mod === 'PM' && h !== 12) h += 12; else if (mod === 'AM' && h === 12) h = 0;
      return h * 60 + parseInt(m);
    };

    const newStart = toMinutes(startTime);
    const newEnd = toMinutes(endTime);

    const sameDaySlots = await Slot.find({ staff: staffId, date: date, isActive: true });
    const overlaps = sameDaySlots.some(s => {
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return newStart < sEnd && newEnd > sStart;
    });
    if (overlaps) {
      return res.status(400).json({ success: false, message: 'Slot overlaps an existing slot' });
    }

    const slot = await Slot.create({ staff: staffId, date, startTime, endTime, location, notes, isActive: true });

    res.status(201).json({ success: true, message: 'Slot created', data: { slot } });
  } catch (error) {
    console.error('Create slot error:', error);
    res.status(500).json({ success: false, message: 'Error creating slot', error: error.message });
  }
};

// @desc    Get slots for a staff and date
// @route   GET /api/appointments/slots/:staffId/:date
// @access  Private
const getSlotsByDate = async (req, res) => {
  try {
    const { staffId, date } = req.params;
    const slots = await Slot.find({ staff: staffId, date: date, isActive: true }).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: { slots } });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ success: false, message: 'Error fetching slots', error: error.message });
  }
};

// @desc    Deactivate a slot
// @route   DELETE /api/appointments/slots/:id
// @access  Private (Lecturers, Admins)
const deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    // Permission: lecturer owns the slot or admin
    const isOwner = slot.staff.toString() === req.user._id.toString();
    if (!(req.user.role === 'admin' || isOwner)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this slot' });
    }

    slot.isActive = false;
    await slot.save();
    res.status(200).json({ success: true, message: 'Slot deactivated', data: { slot } });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({ success: false, message: 'Error deleting slot', error: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointmentsByRole,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  getAvailableStaff,
  getAppointmentStats,
  getStaffAvailability,
  createSlot,
  getSlotsByDate,
  deleteSlot
};