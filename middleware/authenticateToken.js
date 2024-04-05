// // middleware/authenticateToken.js

// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const JWT_SECRET = process.env.JWT_SECRET;

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized: Missing token' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       console.error('Token verification error:', err);
//       return res.status(403).json({ message: 'Forbidden: Invalid token' });
//     }
//     req.user = decoded; // Add decoded user information to the request object
//     next(); // Continue to the next middleware or route handler
//   });
// };

// module.exports = authenticateToken;


const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    // Check if the decoded token contains the expected role ('superadmin' in this case)
    if (!decoded.role || decoded.role !== 'user') {
      return res.status(403).json({ message: 'Forbidden: Not authorized as User' });
    }

    // If the token is valid and the user has the expected role, add decoded user information to the request object
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};

module.exports = authenticateToken;
