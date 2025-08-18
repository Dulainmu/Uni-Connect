const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTicketsByRole,
  getTicket,
  updateTicket,
  addComment,
  getAvailableLecturers,
  getTicketStats
} = require('../controllers/ticketController');
const { protect, authorizeStudent, authorizeLecturer, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create new ticket (Students, Lecturers, Admins)
router.post('/', createTicket);

// Get single ticket
router.get('/ticket/:id', getTicket);

// Update ticket (Lecturers, Admins)
router.put('/:id', authorizeLecturer, updateTicket);

// Add comment to ticket
router.post('/:id/comments', addComment);

// Get available lecturers for assignment (Admins, Lecturers)
router.get('/lecturers', getAvailableLecturers);

// Get ticket statistics
router.get('/stats/:role', getTicketStats);

// Get tickets by role (must be last to avoid shadowing other routes)
router.get('/:role', getTicketsByRole);

module.exports = router; 