const pool = require('../config/db');

exports.list = async () => {
  const [rows] = await pool.execute('SELECT id, title, author, description, available, created_at FROM books');
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
