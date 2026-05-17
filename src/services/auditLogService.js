const pool = require('../config/db');

exports.logAction = async (adminUserId, actionType, targetId, targetType, metadata = {}) => {
  try {
    const query = `
      INSERT INTO admin_audit_logs (admin_user_id, action_type, target_id, target_type, metadata)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(query, [adminUserId, actionType, targetId, targetType, JSON.stringify(metadata)]);
  } catch (err) {
    console.error('Audit log error:', err.message);
    // Don't throw - audit failure shouldn't block the action
  }
};

exports.getLogs = async (adminId = null, actionType = null, limit = 100, offset = 0) => {
  let query = 'SELECT * FROM admin_audit_logs WHERE 1=1';
  const params = [];

  if (adminId) {
    query += ' AND admin_user_id = ?';
    params.push(adminId);
  }
  if (actionType) {
    query += ' AND action_type = ?';
    params.push(actionType);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.execute(query, params);
  return rows.map(row => ({
    ...row,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata
  }));
};

exports.getLogCount = async (adminId = null, actionType = null) => {
  let query = 'SELECT COUNT(*) as count FROM admin_audit_logs WHERE 1=1';
  const params = [];

  if (adminId) {
    query += ' AND admin_user_id = ?';
    params.push(adminId);
  }
  if (actionType) {
    query += ' AND action_type = ?';
    params.push(actionType);
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].count;
};
