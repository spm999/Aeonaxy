const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateSuperadmin = (req, res, next) => {
  // Get token from request header
  // const token = req.header('Authorization');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
// console.log(decoded)
// console.log(decoded.role)
    // Check if user is a Superadmin
    if (!decoded || !decoded.role || decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized as Superadmin' });
    }

    // Add Superadmin ID to request object
    req.superadminId = decoded.userId;

    // Call next middleware
    next();
  } catch (error) {
    console.error('Error authenticating Superadmin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { authenticateSuperadmin };
