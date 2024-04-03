// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const SuperAdminController = require('../controllers/superAdminController.js');
const authenticateToken = require('../middleware/authenticateToken.js');

// User registration route
router.post('/register', SuperAdminController.registerSuperAdmin);

// User login route
router.post('/login', authenticateToken, SuperAdminController.loginSuperAdmin);


// Get user profile route (protected)
// router.get('/profile/:userId', authenticateToken, UserController.getUserProfile);

// Update user profile route (protected)
// router.put('/profile/:userId', authenticateToken, UserController.updateUserProfile);

// Password reset routes
// router.get('/reset-password/:token', UserController.renderResetPasswordPage);
// router.post('/reset-password/:token', UserController.resetPassword);

module.exports = router;

