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

// Get tickets by role
router.get('/:role', getTicketsByRole);

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

module.exports = router; 