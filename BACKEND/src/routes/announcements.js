const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Public routes (for authenticated users)
router.get('/', announcementController.getAnnouncements);
router.get('/pinned', announcementController.getPinnedAnnouncements);
router.get('/:id', announcementController.getAnnouncement);
router.post('/:id/read', announcementController.markAsRead);

// Lecturer and Admin only routes
router.post('/', authorize('lecturer', 'admin'), announcementController.createAnnouncement);
router.put('/:id', authorize('lecturer', 'admin'), announcementController.updateAnnouncement);
router.delete('/:id', authorize('lecturer', 'admin'), announcementController.deleteAnnouncement);

// Admin only routes
router.get('/stats', authorize('admin'), announcementController.getAnnouncementStats);

module.exports = router;