const pool = require('../config/db');

exports.borrow = async (userId, bookId, loanDays = 14) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [books] = await conn.execute('SELECT available FROM books WHERE id = ? FOR UPDATE', [bookId]);
    const book = books[0];
    if (!book) throw new Error('Book not found');
    if (!book.available) throw new Error('Book not available');
    // insert loan with due_date and status
    const [result] = await conn.execute(
      "INSERT INTO loans (user_id, book_id, borrowed_at, due_date, status) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active')",
      [userId, bookId]
    );
    await conn.execute('UPDATE books SET available = 0 WHERE id = ?', [bookId]);
    await conn.commit();
    const dueDate = new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    return { insertId: result.insertId, due_date: dueDate, book_status: 'loaned' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.return = async (loanId, userId = null) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT book_id, returned_at, status, due_date, user_id FROM loans WHERE id = ? FOR UPDATE', [loanId]);
    const loan = rows[0];
    if (!loan) throw new Error('Loan not found');
    if (userId && loan.user_id !== userId) throw new Error('Not authorized to return this loan');
    if (loan.returned_at) throw new Error('Already returned');
    await conn.execute("UPDATE loans SET returned_at = NOW(), status = 'returned' WHERE id = ?", [loanId]);
    await conn.execute('UPDATE books SET available = 1 WHERE id = ?', [loan.book_id]);
    await conn.commit();
    const [resRows] = await pool.execute('SELECT id, returned_at, due_date, GREATEST(0, DATEDIFF(returned_at, due_date)) AS overdue_days FROM loans WHERE id = ?', [loanId]);
    return resRows[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.getByUser = async (userId, status = null, page = 1, size = 50) => {
  const offset = (page - 1) * size;
  const params = [userId];
  let where = 'WHERE l.user_id = ?';
  if (status) {
    where += ' AND l.status = ?';
    params.push(status);
  }
  // pool.query() avoids the mysql2 prepared-statement bug with LIMIT/OFFSET integer params
  const [rows] = await pool.query(
    `SELECT l.id, l.book_id, b.title, l.borrowed_at, l.due_date, l.returned_at, l.status
     FROM loans l JOIN books b ON l.book_id = b.id
     ${where} ORDER BY l.borrowed_at DESC LIMIT ? OFFSET ?`,
    params.concat([size, offset])
  );
  const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM loans l ${where}`, params);
  return { items: rows, total: countRows[0].total };
};

exports.listAll = async (page = 1, size = 100) => {
  const offset = (page - 1) * size;
  const [rows] = await pool.query(
    'SELECT l.id, l.user_id, l.book_id, b.title, l.borrowed_at, l.due_date, l.returned_at, l.status FROM loans l JOIN books b ON l.book_id = b.id ORDER BY l.borrowed_at DESC LIMIT ? OFFSET ?',
    [size, offset]
  );
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM loans');
  return { items: rows, total: countRows[0].total };
};
