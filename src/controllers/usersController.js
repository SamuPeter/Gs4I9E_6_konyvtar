const usersService = require('../services/usersService');
const { success, fail } = require('../utils/response');

exports.me = async (req, res) => {
  try {
    const user = await usersService.getById(req.user.id);
    if (!user) return fail(res, 'USER_NOT_FOUND', 'User not found', 404);
    return success(res, user, 'User retrieved successfully');
  } catch (err) {
    return fail(res, 'INTERNAL_ERROR', 'Failed to retrieve user', 500);
  }
};
