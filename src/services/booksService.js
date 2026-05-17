const pool = require('../config/db');

exports.list = async (filter = {}) => {
  let sql = 'SELECT id, title, author, description, available, created_at FROM books';
  const params = [];
  const conditions = [];
  if (filter.search) {
    conditions.push('(title LIKE ? OR author LIKE ?)');
    params.push(`%${filter.search}%`, `%${filter.search}%`);
  }
  if (filter.available) {
    conditions.push('available = 1');
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY title';
  const [rows] = await pool.execute(sql, params);
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await pool.execute('SELECT id, title, author, description, available, created_at FROM books WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (data) => {
  const [result] = await pool.execute(
    'INSERT INTO books (title, author, description, available) VALUES (?, ?, ?, ?)',
    [data.title, data.author, data.description || null, data.available === false ? 0 : 1]
  );
  return result;
};

exports.update = async (id, data) => {
  await pool.execute(
    'UPDATE books SET title = ?, author = ?, description = ?, available = ? WHERE id = ?',
    [data.title, data.author, data.description || null, data.available === false ? 0 : 1, id]
  );
};

exports.delete = async (id) => {
  await pool.execute('DELETE FROM books WHERE id = ?', [id]);
};
