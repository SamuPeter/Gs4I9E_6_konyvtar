const loansService = require('../services/loansService');

exports.borrow = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = req.params.bookId;
    const loan = await loansService.borrow(userId, bookId);
    res.status(201).json({ loan_id: loan.insertId, due_date: loan.due_date, book_status: loan.book_status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /loans/create - accept book_id in body; uses authenticated user when available
exports.create = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id required' });
    const bookId = req.body.book_id;
    if (!bookId) return res.status(400).json({ error: 'book_id required' });
    const loan = await loansService.borrow(userId, bookId);
    res.status(201).json({ loan_id: loan.insertId, due_date: loan.due_date });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.return = async (req, res) => {
  try {
    const loanId = parseInt(req.params.loanId, 10);
    const userId = req.user ? req.user.id : null;
    const result = await loansService.return(loanId, userId);
    res.json({ loan_id: loanId, return_date: result.returned_at, overdue_days: result.overdue_days });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.myLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status || null;
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 50;
    const rows = await loansService.getByUser(userId, status, page, size);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 100;
    const rows = await loansService.listAll(page, size);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const rows = await loansService.listAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
