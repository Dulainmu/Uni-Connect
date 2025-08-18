const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Lecturer/Admin only)
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      isPinned,
      attachments,
      expiresAt
    } = req.body;

    // Create announcement
    const announcement = await Announcement.create({
      title,
      content,
      author: req.user.id,
      category,
      priority,
      targetAudience,
      isPinned,
      attachments,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    // Populate author details
    await announcement.populate('author', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

// @desc    Get all announcements (with filtering)
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      priority,
      isPinned,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Add priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Add pinned filter
    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Add target audience filter based on user role
    if (req.user.role !== 'admin') {
      filter.targetAudience = { $in: [req.user.role, 'all'] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get announcements with pagination
    const announcements = await Announcement.find(filter)
      .populate('author', 'firstName lastName email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Announcement.countDocuments(filter);

    // Check if each announcement is read by current user
    const announcementsWithReadStatus = announcements.map(announcement => {
      const announcementObj = announcement.toObject();
      announcementObj.isReadByCurrentUser = announcement.isReadByUser(req.user.id);
      return announcementObj;
    });

    res.status(200).json({
      success: true,
      data: announcementsWithReadStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'firstName lastName email role')
      .populate('readBy.user', 'firstName lastName email role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if announcement is active and not expired
    if (!announcement.isActive || announcement.isExpired) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found or expired'
      });
    }

    // Check target audience
    if (req.user.role !== 'admin' && !announcement.targetAudience.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read by current user
    await announcement.markAsRead(req.user.id);

    const announcementObj = announcement.toObject();
    announcementObj.isReadByCurrentUser = true;

    res.status(200).json({
      success: true,
      data: announcementObj
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Author/Admin only)
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this announcement'
      });
    }

    const {
      title,
      content,
      category,
      priority,
      targetAudience,
      isPinned,
      attachments,
      expiresAt,
      isActive
    } = req.body;

    // Update fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (category !== undefined) updateFields.category = category;
    if (priority !== undefined) updateFields.priority = priority;
    if (targetAudience !== undefined) updateFields.targetAudience = targetAudience;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;
    if (attachments !== undefined) updateFields.attachments = attachments;
    if (expiresAt !== undefined) updateFields.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined && req.user.role === 'admin') updateFields.isActive = isActive;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName email role');

    res.status(200).json({
      success: true,
      data: updatedAnnouncement
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Author/Admin only)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if user is author or admin
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};

// @desc    Mark announcement as read
// @route   POST /api/announcements/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if announcement is active and not expired
    if (!announcement.isActive || announcement.isExpired) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found or expired'
      });
    }

    // Mark as read
    await announcement.markAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Announcement marked as read'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error marking announcement as read',
      error: error.message
    });
  }
};

// @desc    Get pinned announcements
// @route   GET /api/announcements/pinned
// @access  Private
const getPinnedAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findPinned()
      .populate('author', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    // Check if each announcement is read by current user
    const announcementsWithReadStatus = announcements.map(announcement => {
      const announcementObj = announcement.toObject();
      announcementObj.isReadByCurrentUser = announcement.isReadByUser(req.user.id);
      return announcementObj;
    });

    res.status(200).json({
      success: true,
      data: announcementsWithReadStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pinned announcements',
      error: error.message
    });
  }
};

// @desc    Get announcement statistics
// @route   GET /api/announcements/stats
// @access  Private (Admin only)
const getAnnouncementStats = async (req, res) => {
  try {
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
    const pinnedAnnouncements = await Announcement.countDocuments({ isPinned: true, isActive: true });
    const expiredAnnouncements = await Announcement.countDocuments({
      expiresAt: { $lt: new Date() }
    });

    // Get category distribution
    const categoryStats = await Announcement.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get priority distribution
    const priorityStats = await Announcement.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalAnnouncements,
        active: activeAnnouncements,
        pinned: pinnedAnnouncements,
        expired: expiredAnnouncements,
        categories: categoryStats,
        priorities: priorityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement statistics',
      error: error.message
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
  getPinnedAnnouncements,
  getAnnouncementStats
};