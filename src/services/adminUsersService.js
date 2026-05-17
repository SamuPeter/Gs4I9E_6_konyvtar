const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.listUsers = async (query = '', role = null, isActive = null, limit = 20, offset = 0) => {
  let sql = 'SELECT id, email, role, is_active, created_at FROM users WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND email LIKE ?';
    params.push(`%${query}%`);
  }
  if (role) {
    sql += ' AND role = ?';
    params.push(role);
  }
  if (isActive !== null) {
    sql += ' AND is_active = ?';
    params.push(isActive ? 1 : 0);
  }

  sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

  const [rows] = await pool.execute(sql, params);
  return rows;
};

exports.getUserCount = async (query = '', role = null, isActive = null) => {
  let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
  const params = [];

  if (query) {
    sql += ' AND email LIKE ?';
    params.push(`%${query}%`);
  }
  if (role) {
    sql += ' AND role = ?';
    params.push(role);
  }
  if (isActive !== null) {
    sql += ' AND is_active = ?';
    params.push(isActive ? 1 : 0);
  }

  const [rows] = await pool.execute(sql, params);
  return rows[0].count;
};

exports.getUserById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id, email, role, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

exports.updateUser = async (id, updates) => {
  const allowedFields = ['email', 'role', 'is_active'];
  const fields = [];
  const values = [];

  for (const field of allowedFields) {
    if (field in updates) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  if (fields.length === 0) return false;

  values.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  const [result] = await pool.execute(sql, values);

  return result.affectedRows > 0;
};

exports.resetPassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const [result] = await pool.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
};

exports.deactivateUser = async (id) => {
  const [result] = await pool.execute(
    'UPDATE users SET is_active = FALSE WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
