/**
 * Use after authMiddleware. Ensures the user has completed onboarding (universityId set).
 */
const requireUniversity = (req, res, next) => {
  if (!req.user?.universityId) {
    return res.status(403).json({ message: 'Complete onboarding to access this resource.' });
  }
  next();
};

module.exports = requireUniversity;
