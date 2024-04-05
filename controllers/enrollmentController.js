// Import required modules
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const postgres = require('postgres');
const { validationResult } = require('express-validator');
const { Resend } = require("resend");

require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, JWT_SECRET } = process.env;

PGUSER = decodeURIComponent(PGUSER);
PGDATABASE = decodeURIComponent(PGDATABASE);

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
});


// Course Enrollment API
// Import the Course model or fetch course details from the database

// Function to get course details by ID (this is just an example, you need to implement this based on your setup)
const getCourseDetailsById = async (course_id) => {
  try {
    // Query the database to fetch course details by ID
    const courseDetails = await sql`
        SELECT * FROM courses
        WHERE course_id = ${course_id}
      `;

    // Return the fetched course details
    return courseDetails[0]; // Assuming course_id is unique and returns only one result
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw new Error('Failed to fetch course details');
  }
};


// Course Enrollment API
exports.enrollCourse = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { course_id } = req.body;

    // Check if the user is already enrolled in the course
    const existingEnrollment = await sql`
        SELECT * FROM user_enrollments
        WHERE user_id = ${user_id} AND course_id = ${course_id}
      `;

    if (existingEnrollment.length > 0) {
      return res.status(400).json({ message: "User is already enrolled in this course." });
    }

    // Insert new enrollment
    await sql`
        INSERT INTO user_enrollments (user_id, course_id)
        VALUES (${user_id}, ${course_id})
      `;

    // Get course details
    const courseDetails = await getCourseDetailsById(course_id);


    // Retrieve user's email address from the database
    const user = await sql`
SELECT email, name FROM users WHERE user_id = ${user_id}
`;
const { email, name } = user[0]; // Extracting email and name from the query result

    // Send registration confirmation email
    const data = await resend.emails.send({
      from: "E_learning <onboarding@resend.dev>",
      to: [email],
      subject: "Course Enrollment Confirmation",
      html: `
  <p>Dear ${name},</p>
  <br>
  <p>Thank you for enrolling in our course "${courseDetails.title}"!</p>
  <p>You are now successfully enrolled in the course.</p>
  <br>
  <p>Best regards,</p>
  <p>The E_learning Team</p>
`,
    });

    res.status(200).json({ message: "Enrollment successful.", course: courseDetails });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// View Enrolled Courses API
exports.getEnrolledCourses = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Retrieve enrolled courses for the user
    const enrolledCourses = await sql`
        SELECT courses.* FROM courses
        INNER JOIN user_enrollments ON courses.course_id = user_enrollments.course_id
        WHERE user_enrollments.user_id = ${user_id}
      `;

    res.json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
