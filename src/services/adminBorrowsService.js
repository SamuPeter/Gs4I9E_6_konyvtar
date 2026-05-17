const pool = require('../config/db');

exports.searchBorrows = async (userQuery = '', itemQuery = '', status = null, fromDate = null, toDate = null, limit = 20, offset = 0) => {
  let sql = `
    SELECT 
      l.id,
      l.user_id,
      l.book_id,
      l.borrowed_at,
      l.due_date,
      l.returned_at,
      l.status,
      u.email as user_email,
      b.title as book_title
    FROM loans l
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN books b ON l.book_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (userQuery) {
    sql += ' AND u.email LIKE ?';
    params.push(`%${userQuery}%`);
  }
  if (itemQuery) {
    sql += ' AND b.title LIKE ?';
    params.push(`%${itemQuery}%`);
  }
  if (status !== null && status !== undefined) {
    sql += ' AND l.status = ?';
    params.push(status);
  }
  if (fromDate) {
    sql += ' AND l.borrowed_at >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    sql += ' AND l.borrowed_at <= ?';
    params.push(toDate);
  }

   sql += ` ORDER BY l.borrowed_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
  const [rows] = await pool.execute(sql, params);
  return rows;
};

exports.getBorrowCount = async (userQuery = '', itemQuery = '', status = null, fromDate = null, toDate = null) => {
  let sql = 'SELECT COUNT(*) as count FROM loans l LEFT JOIN users u ON l.user_id = u.id LEFT JOIN books b ON l.book_id = b.id WHERE 1=1';
  const params = [];

  if (userQuery) {
    sql += ' AND u.email LIKE ?';
    params.push(`%${userQuery}%`);
  }
  if (itemQuery) {
    sql += ' AND b.title LIKE ?';
    params.push(`%${itemQuery}%`);
  }
  if (status) {
    sql += ' AND l.status = ?';
    params.push(status);
  }
  if (fromDate) {
    sql += ' AND l.borrowed_at >= ?';
    params.push(fromDate);
  }
  if (toDate) {
    sql += ' AND l.borrowed_at <= ?';
    params.push(toDate);
  }

  const [rows] = await pool.execute(sql, params);
  return rows[0].count;
};

exports.getBorrowById = async (id) => {
  const sql = `
    SELECT 
      l.id,
      l.user_id,
      l.book_id,
      l.borrowed_at,
      l.due_date,
      l.returned_at,
      l.status,
      u.email as user_email,
      u.id as user_id_detail,
      b.title as book_title,
      b.id as book_id_detail
    FROM loans l
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN books b ON l.book_id = b.id
    WHERE l.id = ?
  `;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
};

exports.updateBorrowDueDate = async (borrowId, newDueDate) => {
  const [result] = await pool.execute(
    'UPDATE loans SET due_date = ? WHERE id = ?',
    [newDueDate, borrowId]
  );
  return result.affectedRows > 0;
};

exports.markBorrowReturned = async (borrowId) => {
  const [result] = await pool.execute(
    'UPDATE loans SET status = ?, returned_at = NOW() WHERE id = ?',
    ['returned', borrowId]
  );
  return result.affectedRows > 0;
};

