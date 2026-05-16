const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const result = await authService.register(email, password);
    return res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const token = await authService.login(email, password);
    return res.json({ token });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};
