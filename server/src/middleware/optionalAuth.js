const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Sets req.user when a valid Bearer token is present; otherwise req.user is null.
 * Never sends 401 — used for endpoints that support both guest and authenticated access.
 */
const optionalAuth = async (req, res, next) => {
  req.user = null;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+tokenVersion');
    if (!user || decoded.tv !== user.tokenVersion) {
      return next();
    }
    req.user = user;
  } catch {
    // Invalid token — treat as guest
  }
  next();
};

module.exports = optionalAuth;
