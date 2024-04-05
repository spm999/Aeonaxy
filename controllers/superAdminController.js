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

const saltRounds = 10;

//Password strength function
function checkPasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (password.length < minLength) {
    return 'Password should be at least 8 characters long.';
  }

  if (!hasUpperCase) {
    return 'Password should contain at least one uppercase letter.';
  }

  if (!hasLowerCase) {
    return 'Password should contain at least one lowercase letter.';
  }

  if (!hasDigit) {
    return 'Password should contain at least one digit.';
  }

  if (!hasSpecialChar) {
    return 'Password should contain at least one special character.';
  }

  return 'strong'; // Password meets all criteria
}


// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

// SuperAdmin registration
exports.registerSuperAdmin = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, profile_picture } = req.body;

  try {
    // Check if superadmin already exists
    const existingSuperAdmin = await sql`
        SELECT * FROM superadmins WHERE email = ${email}
      `;
    if (existingSuperAdmin.length > 0) {
      return res.status(400).json({ message: 'SuperAdmin already exists' });
    }

    // Check password strength
    const passwordStrength = checkPasswordStrength(password);
    if (passwordStrength !== 'strong') {
      return res.status(400).json({ message: passwordStrength });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new superadmin into database
    await sql`
        INSERT INTO superadmins (name, email, password_hash, profile_picture)
        VALUES (${name}, ${email}, ${hashedPassword}, ${profile_picture})
      `;

    // Generate JWT token
    const token = jwt.sign({ userId: email, role: 'superadmin' }, JWT_SECRET, { expiresIn: '24h' });
    // 

    // Send registration confirmation email
    const data = await resend.emails.send({
      from: "E_learning <onboarding@resend.dev>",
      to: [email],
      subject: "SuperAdmin Registration Confirmation",
      html: `
          <p>Dear ${name},</p>
          <br>
          <p>Thank you for registering as a SuperAdmin!</p>
          <p>Your account has been successfully created. You now have access to administrative functionalities.</p>
          <br>
          <p>Best regards,</p>
          <p>The E_learning Team</p>
        `,
    });

    res.status(201).json({ message: 'SuperAdmin registered successfully', token, email_confirmation: "Email sent" });
  } catch (error) {
    console.error('Error registering SuperAdmin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// SuperAdmin login
exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch superadmin from database by email
    const superadmin = await sql`SELECT * FROM superadmins WHERE email = ${email}`;

    // Check if superadmin exists
    if (superadmin.length === 0) {
      return res.status(404).json({ message: 'SuperAdmin not found' });
    }


    // Compare passwords
    const match = await bcrypt.compare(password, superadmin[0].password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // // Generate JWT token
    const token = generateToken(superadmin[0].superadmin_id, 'superadmin');

    // Prepare response object
    const responseData = {
      message: 'Login successful',
      token,
    };

    // Add profile_picture to response if available
    if (superadmin[0].profile_picture) {
      responseData.profile_picture = superadmin[0].profile_picture;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error logging in SuperAdmin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create a new course
exports.createCourse = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, category, level } = req.body;

  try {
    // Insert new course into database
    const newCourse = await sql`
      INSERT INTO courses (title, description, category, level)
      VALUES (${title}, ${description}, ${category}, ${level})
      RETURNING *
    `;

    res.status(201).json(newCourse[0]);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a course by ID
exports.getCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Fetch course from database by ID
    const course = await sql`
      SELECT * FROM courses WHERE course_id = ${courseId}
    `;

    if (course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course[0]);
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const { title, description, category, level } = req.body;

  try {
    // Update course in the database
    const updatedCourse = await sql`
      UPDATE courses
      SET title = ${title}, description = ${description}, category = ${category}, level = ${level}
      WHERE course_id = ${courseId}
      RETURNING *
    `;

    if (updatedCourse.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(updatedCourse[0]);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  const courseId = req.params.id;

  try {
    // Delete course from database
    const deletedCourse = await sql`
      DELETE FROM courses
      WHERE course_id = ${courseId}
      RETURNING *
    `;

    if (deletedCourse.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};