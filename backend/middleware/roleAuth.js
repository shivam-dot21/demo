/**
 * Middleware to authorize users based on their roles
 * @param {...string} roles - Allowed roles
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'No user data found, authorization denied' });
    }

    if (req.user.role !== 'admin' && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }
    
    next();
  };
};
