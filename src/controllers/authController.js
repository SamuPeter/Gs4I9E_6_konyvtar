const authService = require('../services/authService');
const { success, fail } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    return success(res, { id: result.insertId, email }, 'Account created successfully', 201);
  } catch (err) {
    const isConflict = /already|exist/i.test(err.message);
    return fail(res, 'REGISTRATION_FAILED', err.message, isConflict ? 409 : 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    return success(res, { token, user }, 'Login successful');
  } catch (err) {
    return fail(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }
};
