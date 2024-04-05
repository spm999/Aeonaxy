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
router.get('/profile/:superadminId',authenticateSuperadmin, SuperAdminController.getAdminProfile);

// Update user profile route (protected)
router.put('/profile/:superadminId',authenticateSuperadmin, SuperAdminController.updateAdminProfile);


// Superadmin CRUD operations endpoints
router.post('/courses', authenticateSuperadmin, SuperAdminController.createCourse);
router.get('/courses/:superadminId', authenticateSuperadmin, SuperAdminController.getCourse);
router.put('/courses/:superadminId', authenticateSuperadmin, SuperAdminController.updateCourse);
router.delete('/courses/:superadminId', authenticateSuperadmin, SuperAdminController.deleteCourse);


module.exports = router;