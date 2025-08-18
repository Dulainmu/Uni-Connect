const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/appointmentController');
const { protect, authorizeStudent, authorizeLecturer, authorizeAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create new appointment (Students, Lecturers, Admins)
router.post('/', createAppointment);

// Get available staff for appointments (must come before /:role)
router.get('/staff', getAvailableStaff);

// Get appointment statistics (must come before /:role)
router.get('/stats/:role', getAppointmentStats);

// Get staff availability for a specific date (must come before /:role)
router.get('/availability/:staffId/:date', getStaffAvailability);

// Lecturer-defined slots
router.post('/slots', authorizeLecturer, createSlot);
router.get('/slots/:staffId/:date', getSlotsByDate);
router.delete('/slots/:id', authorizeLecturer, deleteSlot);

// Get single appointment (must come before /:role)
router.get('/ticket/:id', getAppointment);

// Get appointments by role
router.get('/:role', getAppointmentsByRole);

// Update appointment
router.put('/:id', updateAppointment);

// Cancel appointment
router.post('/:id/cancel', cancelAppointment);

// Confirm appointment (Staff only)
router.post('/:id/confirm', authorizeLecturer, confirmAppointment);

// Complete appointment (Staff only)
router.post('/:id/complete', authorizeLecturer, completeAppointment);

module.exports = router;