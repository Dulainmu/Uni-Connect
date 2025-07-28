const express = require('express');
const router = express.Router();
const { protect, authorizeStudent, authorizeLecturer, authorizeAdmin, authorizeStaff } = require('../middleware/auth');

// Test route for all authenticated users
router.get('/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: {
      id: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Test route for students only
router.get('/student-only', protect, authorizeStudent, (req, res) => {
  res.json({
    success: true,
    message: 'Student access granted',
    user: {
      id: req.user._id,
      name: req.user.fullName,
      role: req.user.role
    }
  });
});

// Test route for lecturers only
router.get('/lecturer-only', protect, authorizeLecturer, (req, res) => {
  res.json({
    success: true,
    message: 'Lecturer access granted',
    user: {
      id: req.user._id,
      name: req.user.fullName,
      role: req.user.role,
      department: req.user.department
    }
  });
});

// Test route for admin only
router.get('/admin-only', protect, authorizeAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: {
      id: req.user._id,
      name: req.user.fullName,
      role: req.user.role
    }
  });
});

// Test route for staff (lecturers and admins)
router.get('/staff-only', protect, authorizeStaff, (req, res) => {
  res.json({
    success: true,
    message: 'Staff access granted',
    user: {
      id: req.user._id,
      name: req.user.fullName,
      role: req.user.role
    }
  });
});

module.exports = router; 