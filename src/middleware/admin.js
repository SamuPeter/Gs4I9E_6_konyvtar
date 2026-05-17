const { fail } = require('../utils/response');

module.exports = (req, res, next) => {
  if (!req.user) return fail(res, 'UNAUTHORIZED', 'Authentication is required', 401);
  if (req.user.role !== 'admin') return fail(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403);
  next();
};
