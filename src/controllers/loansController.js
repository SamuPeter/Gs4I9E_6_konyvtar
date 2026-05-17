const loansService = require('../services/loansService');
const { success, fail } = require('../utils/response');

exports.borrow = async (req, res) => {
  try {
    const loan = await loansService.borrow(req.user.id, req.params.bookId);
    return success(res, { loan_id: loan.insertId, due_date: loan.due_date, book_status: loan.book_status }, 'Book borrowed successfully', 201);
  } catch (err) {
    return fail(res, 'BORROW_FAILED', err.message, 400);
  }
};

exports.create = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.user_id;
    if (!userId) return fail(res, 'VALIDATION_ERROR', 'user_id is required');
    const { book_id: bookId } = req.body;
    if (!bookId) return fail(res, 'VALIDATION_ERROR', 'book_id is required');
    const loan = await loansService.borrow(userId, bookId);
    return success(res, { loan_id: loan.insertId, due_date: loan.due_date }, 'Loan created successfully', 201);
  } catch (err) {
    return fail(res, 'LOAN_CREATE_FAILED', err.message, 400);
  }
};

exports.return = async (req, res) => {
  try {
    const loanId = parseInt(req.params.loanId, 10);
    const userId = req.user ? req.user.id : null;
    const result = await loansService.return(loanId, userId);
    return success(res, { loan_id: loanId, return_date: result.returned_at, overdue_days: result.overdue_days }, 'Book returned successfully');
  } catch (err) {
    return fail(res, 'RETURN_FAILED', err.message, 400);
  }
};

exports.myLoans = async (req, res) => {
  try {
    const status = req.query.status || null;
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 50;
    const loans = await loansService.getByUser(req.user.id, status, page, size);
    return success(res, loans, 'Loans retrieved successfully');
  } catch (err) {
    return fail(res, 'INTERNAL_ERROR', 'Failed to retrieve loans', 500);
  }
};

exports.listAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const size = parseInt(req.query.size, 10) || 100;
    const loans = await loansService.listAll(page, size);
    return success(res, loans, 'Loans retrieved successfully');
  } catch (err) {
    return fail(res, 'INTERNAL_ERROR', 'Failed to retrieve loans', 500);
  }
};
