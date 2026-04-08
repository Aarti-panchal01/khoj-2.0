const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  console.log('🔐 Auth middleware - Path:', req.path);
  console.log('🔐 Auth header:', req.headers.authorization ? 'present' : 'missing');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Auth failed: No Bearer token in header');
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Extracted token:', token ? `${token.substring(0, 20)}...` : 'missing');
  
  if (!token) {
    console.log('❌ Auth failed: Token is empty after split');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET is not set!');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.id);

    // Fetch user with fields needed for access control.
    // universityId and campusId are always read from DB — never trusted from the token payload.
    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (!user) {
      console.log('❌ User not found in database:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    if (decoded.tv !== user.tokenVersion) {
      console.log('❌ Token version mismatch - decoded:', decoded.tv, 'user:', user.tokenVersion);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    console.log('✅ Auth successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      console.error('   Token is malformed or invalid');
    } else if (error.name === 'TokenExpiredError') {
      console.error('   Token has expired');
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
