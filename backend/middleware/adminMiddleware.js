// ─── Admin Middleware — Role-Based Access Control ─────────────────────────────
// Must be used AFTER authMiddleware. Rejects non-admin users with 403.
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied — admin role required',
    });
  }
  next();
};

module.exports = adminMiddleware;
