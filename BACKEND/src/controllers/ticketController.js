const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private (Students, Lecturers, Admins)
const createTicket = async (req, res) => {
  console.log('=== CREATE TICKET ENDPOINT CALLED ===');
  try {
    console.log('Create ticket request body:', req.body);
    console.log('User from request:', req.user);
    console.log('User ID:', req.user?._id);
    console.log('User role:', req.user?.role);
    
    const { title, description, category, priority, department } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    // Auto-assign logic (auto-routing)
    // Assumption: Only 'academic' tickets are auto-assigned to lecturers.
    // Strategy: pick the active lecturer with the lowest number of open/in_progress tickets.
    let autoAssignedLecturerId = null;
    if (category === 'academic') {
      try {
        const activeLecturers = await User.find({ role: 'lecturer', isActive: true })
          .select('_id firstName lastName email');

        if (activeLecturers && activeLecturers.length > 0) {
          const workloads = await Ticket.aggregate([
            {
              $match: {
                assignedTo: { $ne: null },
                status: { $in: ['open', 'in_progress'] }
              }
            },
            { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
          ]);

          const lecturerIdToCount = new Map(
            workloads.map(w => [String(w._id), w.count])
          );

          let chosenLecturerId = null;
          let minCount = Number.POSITIVE_INFINITY;
          for (const lecturer of activeLecturers) {
            const currentCount = lecturerIdToCount.get(String(lecturer._id)) || 0;
            if (currentCount < minCount) {
              minCount = currentCount;
              chosenLecturerId = lecturer._id;
            }
          }

          autoAssignedLecturerId = chosenLecturerId;
          console.log('Auto-assignment selected lecturer:', {
            lecturerId: autoAssignedLecturerId,
            workload: minCount
          });
        } else {
          console.log('No active lecturers available for auto-assignment.');
        }
      } catch (assignmentError) {
        console.error('Auto-assignment error (proceeding without assignment):', assignmentError);
      }
    }

    console.log('Creating ticket with data:', {
      title,
      description,
      category,
      priority: priority || 'medium',
      department,
      submittedBy: req.user._id,
      ...(autoAssignedLecturerId && { assignedTo: autoAssignedLecturerId })
    });

    // Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      department,
      submittedBy: req.user._id,
      ...(autoAssignedLecturerId && { assignedTo: autoAssignedLecturerId })
    });

    console.log('Ticket created successfully:', ticket);

    // Populate user information
    await ticket.populate('submittedBy', 'firstName lastName email role');
    if (ticket.assignedTo) {
      await ticket.populate('assignedTo', 'firstName lastName email role');
    }

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: {
        ticket
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// @desc    Get tickets by role
// @route   GET /api/tickets/:role
// @access  Private
const getTicketsByRole = async (req, res) => {
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

    // Check if user has permission to view tickets for this role
    if (userRole === 'student' && role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Students can only view their own tickets'
      });
    }

    let tickets;
    if (role === 'student') {
      // Students can only see their own tickets
      tickets = await Ticket.find({ submittedBy: userId })
        .populate('submittedBy', 'firstName lastName email role')
        .populate('assignedTo', 'firstName lastName email role')
        .sort({ createdAt: -1 });
    } else if (role === 'lecturer') {
      // Lecturers can see tickets assigned to them or academic tickets
      if (userRole === 'lecturer') {
        tickets = await Ticket.find({
          $or: [
            { assignedTo: userId },
            { category: 'academic', status: { $in: ['open', 'in_progress'] } }
          ]
        })
          .populate('submittedBy', 'firstName lastName email role studentId')
          .populate('assignedTo', 'firstName lastName email role')
          .sort({ createdAt: -1 });
      } else if (userRole === 'admin') {
        // Admins can see all lecturer tickets
        tickets = await Ticket.find({})
          .populate('submittedBy', 'firstName lastName email role studentId')
          .populate('assignedTo', 'firstName lastName email role')
          .sort({ createdAt: -1 });
      }
    } else if (role === 'admin' && userRole === 'admin') {
      // Only admins can see all tickets
      tickets = await Ticket.find({})
        .populate('submittedBy', 'firstName lastName email role studentId')
        .populate('assignedTo', 'firstName lastName email role')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: {
        tickets
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email role studentId')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('comments.user', 'firstName lastName email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to view this ticket
    const canView = 
      req.user.role === 'admin' ||
      ticket.submittedBy._id.toString() === req.user._id.toString() ||
      (req.user.role === 'lecturer' && ticket.assignedTo && ticket.assignedTo._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'lecturer' && ticket.category === 'academic');

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ticket
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (Lecturers, Admins)
const updateTicket = async (req, res) => {
  try {
    const { status, assignedTo, priority, comments } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to update this ticket
    const canUpdate = 
      req.user.role === 'admin' ||
      (req.user.role === 'lecturer' && ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString()) ||
      (req.user.role === 'lecturer' && ticket.category === 'academic');

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this ticket'
      });
    }

    // Update fields
    if (status) {
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (status === 'closed') {
        ticket.closedAt = new Date();
      }
    }

    if (assignedTo) {
      // Verify the assigned user exists and is a lecturer
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'lecturer') {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a lecturer'
        });
      }
      ticket.assignedTo = assignedTo;
    }

    if (priority) {
      ticket.priority = priority;
    }

    if (comments) {
      ticket.comments.push({
        user: req.user._id,
        content: comments
      });
    }

    await ticket.save();

    // Populate updated ticket
    await ticket.populate('submittedBy', 'firstName lastName email role studentId');
    await ticket.populate('assignedTo', 'firstName lastName email role');
    await ticket.populate('comments.user', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        ticket
      }
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const ticketId = req.params.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to comment on this ticket
    const canComment = 
      req.user.role === 'admin' ||
      ticket.submittedBy.toString() === req.user._id.toString() ||
      (req.user.role === 'lecturer' && ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString()) ||
      (req.user.role === 'lecturer' && ticket.category === 'academic');

    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this ticket'
      });
    }

    // Add comment
    ticket.comments.push({
      user: req.user._id,
      content: content
    });

    await ticket.save();

    // Populate updated ticket
    await ticket.populate('submittedBy', 'firstName lastName email role studentId');
    await ticket.populate('assignedTo', 'firstName lastName email role');
    await ticket.populate('comments.user', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        ticket
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// @desc    Get available lecturers for assignment
// @route   GET /api/tickets/lecturers
// @access  Private (Admins, Lecturers)
const getAvailableLecturers = async (req, res) => {
  try {
    const lecturers = await User.find({ 
      role: 'lecturer', 
      isActive: true 
    })
      .select('firstName lastName email department')
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      count: lecturers.length,
      data: {
        lecturers
      }
    });
  } catch (error) {
    console.error('Get lecturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lecturers',
      error: error.message
    });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats/:role
// @access  Private
const getTicketStats = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchQuery = {};

    if (role === 'student') {
      matchQuery = { submittedBy: userId };
    } else if (role === 'lecturer') {
      if (userRole === 'lecturer') {
        matchQuery = {
          $or: [
            { assignedTo: userId },
            { category: 'academic', status: { $in: ['open', 'in_progress'] } }
          ]
        };
      }
    }

    const stats = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTickets = await Ticket.countDocuments(matchQuery);
    const openTickets = await Ticket.countDocuments({ ...matchQuery, status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ ...matchQuery, status: 'in_progress' });
    const resolvedTickets = await Ticket.countDocuments({ ...matchQuery, status: 'resolved' });

    res.status(200).json({
      success: true,
      data: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statistics',
      error: error.message
    });
  }
};

module.exports = {
  createTicket,
  getTicketsByRole,
  getTicket,
  updateTicket,
  addComment,
  getAvailableLecturers,
  getTicketStats
}; 