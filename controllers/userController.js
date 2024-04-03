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

// User profile
exports.getUserProfile = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch user profile from database based on user ID
    const userProfile = await sql`
      SELECT name, email, profile_picture FROM users WHERE user_id = ${userId}
    `;

    if (userProfile.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userProfile[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.userId;
  const { name, email, profile_picture } = req.body;

  try {
    // Update user profile in database
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, profile_picture = ${profile_picture}
      WHERE user_id = ${userId}
    `;

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// User registration
exports.registerUser = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, profile_picture } = req.body;

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    await sql`
      INSERT INTO users (name, email, password_hash, profile_picture)
      VALUES (${name}, ${email}, ${hashedPassword}, ${profile_picture})
    `;

    // Generate JWT token
    const token = generateToken(email);

    // Send registration confirmation email
    const data=await resend.emails.send({
      from: "E_learning <onboarding@resend.dev>",
      to: [email],
      subject: "Registration Confirmation",
      html: `
        <p>Dear ${name},</p>
        <br>
        <p>Thank you for registering with us!</p>
        <p>Your account has been successfully created. Please feel free to explore our platform and start learning.</p>
        <br>
        <p>Best regards,</p>
        <p>The E_learning Team</p>
      `,
    });
    

    res.status(201).json({ message: 'User registered successfully', token, email_confirmation:"Email sent" });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// User login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user from database by email
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;

    // Check if user exists
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user[0].password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user[0].user_id);

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
