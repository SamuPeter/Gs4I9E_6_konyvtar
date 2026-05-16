const pool = require('../config/db');

exports.borrow = async (userId, bookId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [books] = await conn.execute('SELECT available FROM books WHERE id = ? FOR UPDATE', [bookId]);
    const book = books[0];
    if (!book) throw new Error('Book not found');
    if (!book.available) throw new Error('Book not available');
    const [result] = await conn.execute('INSERT INTO loans (user_id, book_id) VALUES (?, ?)', [userId, bookId]);
    await conn.execute('UPDATE books SET available = 0 WHERE id = ?', [bookId]);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.return = async (loanId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT book_id, returned_at FROM loans WHERE id = ? FOR UPDATE', [loanId]);
    const loan = rows[0];
    if (!loan) throw new Error('Loan not found');
    if (loan.returned_at) throw new Error('Already returned');
    await conn.execute('UPDATE loans SET returned_at = NOW() WHERE id = ?', [loanId]);
    await conn.execute('UPDATE books SET available = 1 WHERE id = ?', [loan.book_id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.getByUser = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT l.id, l.book_id, b.title, l.borrowed_at, l.returned_at FROM loans l JOIN books b ON l.book_id = b.id WHERE l.user_id = ?',
    [userId]
  );
  return rows;
};

exports.listAll = async () => {
  const [rows] = await pool.execute('SELECT l.id, l.user_id, l.book_id, b.title, l.borrowed_at, l.returned_at FROM loans l JOIN books b ON l.book_id = b.id');
  return rows;
};
