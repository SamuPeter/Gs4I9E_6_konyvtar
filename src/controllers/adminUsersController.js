const adminUsersService = require('../services/adminUsersService');
const auditLogService = require('../services/auditLogService');

exports.listUsers = async (req, res) => {
  try {
    const { query = '', role, is_active, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    const isActive = is_active !== undefined ? is_active === 'true' : null;

    const users = await adminUsersService.listUsers(query, role, isActive, limitNum, offset);
    const total = await adminUsersService.getUserCount(query, role, isActive);

    res.json({
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await adminUsersService.getUserById(id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, is_active } = req.body;

    const user = await adminUsersService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;

    const success = await adminUsersService.updateUser(id, updates);
    if (!success) return res.status(400).json({ error: 'Update failed' });

    await auditLogService.logAction(req.user.id, 'USER_UPDATE', parseInt(id), 'user', updates);

    const updatedUser = await adminUsersService.getUserById(id);
    res.json(updatedUser);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    const user = await adminUsersService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const success = await adminUsersService.resetPassword(id, new_password);
    if (!success) return res.status(400).json({ error: 'Password reset failed' });

    await auditLogService.logAction(req.user.id, 'PASSWORD_RESET', parseInt(id), 'user', { email: user.email });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminUsersService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Soft delete - set is_active to false
    const success = await adminUsersService.deactivateUser(id);
    if (!success) return res.status(400).json({ error: 'Deactivation failed' });

    await auditLogService.logAction(req.user.id, 'USER_DEACTIVATED', parseInt(id), 'user', { email: user.email });

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};
