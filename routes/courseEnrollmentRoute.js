const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticateToken = require('../middleware/authenticateToken')

// Route for enrolling in a course
router.post('/:user_id/enroll', authenticateToken, enrollmentController.enrollCourse);

// Route for viewing enrolled courses of a user
router.get('/:user_id/enrolled-courses', authenticateToken, enrollmentController.getEnrolledCourses);

module.exports = router;
