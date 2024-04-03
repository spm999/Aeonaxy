// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController.js');
const authenticateToken = require('../middleware/authenticateToken.js');

// User registration route
router.post('/register', UserController.registerUser);

// User login route
router.post('/login',authenticateToken, UserController.loginUser);


// Get user profile route (protected)
router.get('/profile/:userId', authenticateToken, UserController.getUserProfile);

// Update user profile route (protected)
router.put('/profile/:userId', authenticateToken, UserController.updateUserProfile);

// Password reset routes
// router.get('/reset-password/:token', UserController.renderResetPasswordPage);
// router.post('/reset-password/:token', UserController.resetPassword);

module.exports = router;
