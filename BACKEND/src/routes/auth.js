const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorizeAdmin, rateLimit } = require('../middleware/auth');

// Rate limiting for auth routes
const authRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Public routes
router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.post('/forgot-password', authRateLimit, authController.forgotPassword);
router.put('/reset-password/:token', authRateLimit, authController.resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/update-profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

// Admin only routes
router.get('/users', authorizeAdmin, authController.getAllUsers);
router.put('/users/:id', authorizeAdmin, authController.updateUser);

module.exports = router; 