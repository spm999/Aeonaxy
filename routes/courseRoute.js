const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// GET /courses
// Fetch courses with filtering options and pagination
router.get('/', courseController.getCourses);

module.exports = router;
