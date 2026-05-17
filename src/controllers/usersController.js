const usersService = require('../services/usersService');

exports.me = async (req, res) => {
  try {
    const user = await usersService.getById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};