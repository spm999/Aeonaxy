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
    const { category, level, page, limit } = req.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10; // Default limit is 10

    // Calculate offset
    const offset = (pageNumber - 1) * pageSize;

    // Construct base query
    let query = `SELECT * FROM courses`;

    // Add filters
    const filters = [];
    if (category) filters.push(`category = '${category}'`);
    if (level) filters.push(`level = '${level}'`);
    // Add other filters as needed

    if (filters.length > 0) {
      query += ` WHERE ` + filters.join(` AND `);
    }

    // Add pagination
    // if (pageSize > 10) {
      query += ` OFFSET ${offset} LIMIT ${pageSize}`;
    // }

    // Execute query
    const courses = await sql.unsafe(query);

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
