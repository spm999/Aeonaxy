const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateSuperadmin = (req, res, next) => {
  // Get token from request header
  const token = req.header('Authorization');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is a Superadmin
    if (!decoded || !decoded.superadmin_id) {
      return res.status(403).json({ message: 'Not authorized as Superadmin' });
    }

    // Add Superadmin ID to request object
    req.superadminId = decoded.superadmin_id;

    // Call next middleware
    next();
  } catch (error) {
    console.error('Error authenticating Superadmin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { authenticateSuperadmin };
