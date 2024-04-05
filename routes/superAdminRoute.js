// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const SuperAdminController = require('../controllers/superAdminController.js');
const { authenticateSuperadmin } = require('../middleware/authMiddleware');


// User registration route
router.post('/register', SuperAdminController.registerSuperAdmin);

// User login route
router.post('/login', authenticateSuperadmin, SuperAdminController.loginSuperAdmin);


// Get user profile route (protected)
// router.get('/profile/:userId',authenticateSuperadmin, UserController.getUserProfile);

// Update user profile route (protected)
// router.put('/profile/:userId',authenticateSuperadmin, UserController.updateUserProfile);

// Password reset routes
// router.get('/reset-password/:token', UserController.renderResetPasswordPage);
// router.post('/reset-password/:token', UserController.resetPassword);



// Superadmin CRUD operations endpoints
router.post('/courses', authenticateSuperadmin, SuperAdminController.createCourse);
router.get('/courses/:id', authenticateSuperadmin, SuperAdminController.getCourse);
router.put('/courses/:id', authenticateSuperadmin, SuperAdminController.updateCourse);
router.delete('/courses/:id', authenticateSuperadmin, SuperAdminController.deleteCourse);


module.exports = router;