const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return fail(res, 'MISSING_TOKEN', 'Authorization header is required', 401);
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return fail(res, 'INVALID_TOKEN_FORMAT', 'Authorization header must use Bearer <token> format', 401);
  try {
    req.user = jwt.verify(parts[1], process.env.JWT_SECRET);
    next();
  } catch (err) {
    return fail(res, 'INVALID_TOKEN', 'Your session has expired or the token is invalid. Please log in again.', 401);
  }
};
