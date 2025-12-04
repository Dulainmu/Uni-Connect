const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Announcement = require('../models/Announcement');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorizeAdmin);

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Get ticket statistics
        const totalTickets = await Ticket.countDocuments();
        const openTickets = await Ticket.countDocuments({ status: 'open' });
        const inProgressTickets = await Ticket.countDocuments({ status: 'in_progress' });
        const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
        const unassignedTickets = await Ticket.countDocuments({ assignedTo: null });

        // Get announcement statistics
        const totalAnnouncements = await Announcement.countDocuments();
        const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
        const pinnedAnnouncements = await Announcement.countDocuments({ isPinned: true, isActive: true });

        // Calculate response time (mock for now)
        const averageResponseTime = 2.3; // hours

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    newThisWeek: newUsersThisWeek,
                    growthRate: totalUsers > 0 ? ((newUsersThisWeek / totalUsers) * 100).toFixed(1) : 0
                },
                tickets: {
                    total: totalTickets,
                    open: openTickets,
                    inProgress: inProgressTickets,
                    resolved: resolvedTickets,
                    unassigned: unassignedTickets,
                    resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0
                },
                announcements: {
                    total: totalAnnouncements,
                    active: activeAnnouncements,
                    pinned: pinnedAnnouncements
                },
                performance: {
                    averageResponseTime,
                    systemUptime: 99.8,
                    errorRate: 0.2
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admin statistics',
            error: error.message
        });
    }
};

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        // Calculate date range
        let startDate;
        switch (range) {
            case '7d':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get user registration trends
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Get user role distribution
        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get department distribution for lecturers
        const departmentDistribution = await User.aggregate([
            {
                $match: { role: 'lecturer' }
            },
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                userGrowth,
                roleDistribution,
                departmentDistribution
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user analytics',
            error: error.message
        });
    }
};

// @desc    Get communication analytics
// @route   GET /api/admin/analytics/communication
// @access  Private/Admin
const getCommunicationAnalytics = async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        // Calculate date range
        let startDate;
        switch (range) {
            case '7d':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get ticket trends
        const ticketTrends = await Ticket.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        // Get ticket category distribution
        const categoryDistribution = await Ticket.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get ticket priority distribution
        const priorityDistribution = await Ticket.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate average response time (mock for now)
        const averageResponseTime = 2.3;

        res.status(200).json({
            success: true,
            data: {
                ticketTrends,
                categoryDistribution,
                priorityDistribution,
                averageResponseTime
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching communication analytics',
            error: error.message
        });
    }
};

// @desc    Get system health
// @route   GET /api/admin/system/health
// @access  Private/Admin
const getSystemHealth = async (req, res) => {
    try {
        // Mock system health data - in production, this would check actual system metrics
        const systemHealth = {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected', // if using Redis
                storage: 'available'
            }
        };

        res.status(200).json({
            success: true,
            data: systemHealth
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching system health',
            error: error.message
        });
    }
};

// @desc    Bulk update users
// @route   PUT /api/admin/users/bulk
// @access  Private/Admin
const bulkUpdateUsers = async (req, res) => {
    try {
        const { userIds, updates } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array is required'
            });
        }

        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Updates object is required'
            });
        }

        // Perform bulk update
        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: updates }
        );

        res.status(200).json({
            success: true,
            message: `Updated ${result.modifiedCount} users`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error performing bulk update',
            error: error.message
        });
    }
};

// Routes
router.get('/stats', getAdminStats);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/communication', getCommunicationAnalytics);
router.get('/system/health', getSystemHealth);
router.put('/users/bulk', bulkUpdateUsers);

module.exports = router;