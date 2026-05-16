const loansService = require('../services/loansService');

exports.borrow = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = req.params.bookId;
    const loan = await loansService.borrow(userId, bookId);
    res.status(201).json({ id: loan.insertId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.return = async (req, res) => {
  try {
    await loansService.return(parseInt(req.params.loanId, 10));
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.myLoans = async (req, res) => {
  try {
    const rows = await loansService.getByUser(req.user.id);
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
