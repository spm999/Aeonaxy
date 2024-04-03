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

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
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
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Insert new superadmin into database
      await sql`
        INSERT INTO superadmins (name, email, password_hash, profile_picture)
        VALUES (${name}, ${email}, ${hashedPassword}, ${profile_picture})
      `;
  
      // Generate JWT token
      const token = generateToken(email);
  
      // Send registration confirmation email
      const data=await resend.emails.send({
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
  
      // Generate JWT token
      const token = generateToken(superadmin[0].superadmin_id);
  
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
  