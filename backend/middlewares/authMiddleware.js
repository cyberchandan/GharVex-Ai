const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      try {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          console.error(`User not found for id: ${decoded.id}`);
          res.status(401);
          throw new Error('Not authorized, user no longer exists');
        }
        next();
      } catch (dbError) {
        console.error('Database error in protect middleware:', dbError.message);
        res.status(500);
        throw new Error('Authentication failed due to database error: ' + dbError.message);
      }
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed: ' + error.message);
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const contractor = (req, res, next) => {
  if (req.user && req.user.role === 'contractor') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an contractor');
  }
};

module.exports = { protect, contractor };
