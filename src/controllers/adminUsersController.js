const adminUsersService = require('../services/adminUsersService');
const auditLogService = require('../services/auditLogService');
const { success, fail } = require('../utils/response');

exports.listUsers = async (req, res) => {
  try {
    const { query = '', role, is_active, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    const isActive = is_active !== undefined ? is_active === 'true' : null;

    const users = await adminUsersService.listUsers(query, role, isActive, limitNum, offset);
    const total = await adminUsersService.getUserCount(query, role, isActive);

    return success(res, {
      users,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    }, 'Users retrieved successfully');
  } catch (err) {
    console.error('List users error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to list users', 500);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await adminUsersService.getUserById(req.params.id);
    if (!user) return fail(res, 'USER_NOT_FOUND', 'User not found', 404);
    return success(res, user, 'User retrieved successfully');
  } catch (err) {
    console.error('Get user error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to get user', 500);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, is_active } = req.body;

    const user = await adminUsersService.getUserById(id);
    if (!user) return fail(res, 'USER_NOT_FOUND', 'User not found', 404);

    const updates = {};
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;

    const updated = await adminUsersService.updateUser(id, updates);
    if (!updated) return fail(res, 'UPDATE_FAILED', 'Failed to update user');

    await auditLogService.logAction(req.user.id, 'USER_UPDATE', parseInt(id), 'user', updates);

    const updatedUser = await adminUsersService.getUserById(id);
    return success(res, updatedUser, 'User updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to update user', 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    const user = await adminUsersService.getUserById(id);
    if (!user) return fail(res, 'USER_NOT_FOUND', 'User not found', 404);

    const updated = await adminUsersService.resetPassword(id, new_password);
    if (!updated) return fail(res, 'PASSWORD_RESET_FAILED', 'Failed to reset password');

    await auditLogService.logAction(req.user.id, 'PASSWORD_RESET', parseInt(id), 'user', { email: user.email });

    return success(res, null, 'Password reset successfully');
  } catch (err) {
    console.error('Reset password error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to reset password', 500);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminUsersService.getUserById(id);
    if (!user) return fail(res, 'USER_NOT_FOUND', 'User not found', 404);

    const deactivated = await adminUsersService.deactivateUser(id);
    if (!deactivated) return fail(res, 'DEACTIVATION_FAILED', 'Failed to deactivate user');

    await auditLogService.logAction(req.user.id, 'USER_DEACTIVATED', parseInt(id), 'user', { email: user.email });

    return success(res, null, 'User deactivated successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to deactivate user', 500);
  }
};
