const pool = require('../config/db');

exports.getById = async (id) => {
  const [rows] = await pool.execute('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
};
