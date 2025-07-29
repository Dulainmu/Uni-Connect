const Appointment = require('../models/Appointment');
const User = require('../models/User');

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

    // Define business hours (9 AM to 5 PM)
    const businessHours = [];
    for (let hour = 9; hour <= 16; hour++) {
      const time = `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`;
      businessHours.push(time);
    }

    // Find available time slots
    const availableSlots = [];
    for (let i = 0; i < businessHours.length - 1; i++) {
      const startTime = businessHours[i];
      const endTime = businessHours[i + 1];
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = appointments.some(appointment => {
        const appointmentStart = appointment.convertTo24Hour(appointment.startTime);
        const appointmentEnd = appointment.convertTo24Hour(appointment.endTime);
        const slotStart = appointment.convertTo24Hour(startTime);
        const slotEnd = appointment.convertTo24Hour(endTime);
        
        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });

      if (!hasConflict) {
        availableSlots.push({
          startTime,
          endTime,
          available: true
        });
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
  getStaffAvailability
};