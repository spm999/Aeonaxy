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


exports.getCourses = async (req, res) => {
  try {
    // Extract query parameters
    const { category, level } = req.query;

    // Construct base query
    let query = sql`SELECT * FROM courses`;

    // Add filters
    const filters = [];
    if (category) filters.push(sql`category = ${category}`);
    if (level) filters.push(sql`level = ${level}`);
    // Add other filters as needed

    if (filters.length > 0) {
      query.append(sql` WHERE `);
      query.append(filters.join(sql` AND `));
    }

    // Execute query
    const courses = await query;

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
