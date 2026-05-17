const adminBorrowsService = require('../services/adminBorrowsService');
const auditLogService = require('../services/auditLogService');
const { success, fail } = require('../utils/response');

exports.searchBorrows = async (req, res) => {
  try {
    const { user_query = '', item_query = '', status, from_date, to_date, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const borrows = await adminBorrowsService.searchBorrows(user_query, item_query, status, from_date, to_date, limitNum, offset);
    const total = await adminBorrowsService.getBorrowCount(user_query, item_query, status, from_date, to_date);

    return success(res, {
      borrows,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    }, 'Borrows retrieved successfully');
  } catch (err) {
    console.error('Search borrows error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to search borrows', 500);
  }
};

exports.getBorrow = async (req, res) => {
  try {
    const borrow = await adminBorrowsService.getBorrowById(req.params.id);
    if (!borrow) return fail(res, 'BORROW_NOT_FOUND', 'Borrow record not found', 404);
    return success(res, borrow, 'Borrow retrieved successfully');
  } catch (err) {
    console.error('Get borrow error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to get borrow record', 500);
  }
};

exports.updateDueDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { due_date } = req.body;

    if (!due_date) return fail(res, 'VALIDATION_ERROR', 'due_date is required');

    const borrow = await adminBorrowsService.getBorrowById(id);
    if (!borrow) return fail(res, 'BORROW_NOT_FOUND', 'Borrow record not found', 404);

    const updated = await adminBorrowsService.updateBorrowDueDate(id, due_date);
    if (!updated) return fail(res, 'UPDATE_FAILED', 'Failed to update due date');

    await auditLogService.logAction(req.user.id, 'BORROW_DUE_DATE_UPDATE', parseInt(id), 'borrow', {
      user_email: borrow.user_email,
      book_title: borrow.book_title,
      new_due_date: due_date
    });

    const updatedBorrow = await adminBorrowsService.getBorrowById(id);
    return success(res, updatedBorrow, 'Due date updated successfully');
  } catch (err) {
    console.error('Update due date error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to update due date', 500);
  }
};

exports.markReturned = async (req, res) => {
  try {
    const { id } = req.params;

    const borrow = await adminBorrowsService.getBorrowById(id);
    if (!borrow) return fail(res, 'BORROW_NOT_FOUND', 'Borrow record not found', 404);

    const updated = await adminBorrowsService.markBorrowReturned(id);
    if (!updated) return fail(res, 'MARK_RETURNED_FAILED', 'Failed to mark borrow as returned');

    await auditLogService.logAction(req.user.id, 'BORROW_MARKED_RETURNED', parseInt(id), 'borrow', {
      user_email: borrow.user_email,
      book_title: borrow.book_title
    });

    const updatedBorrow = await adminBorrowsService.getBorrowById(id);
    return success(res, updatedBorrow, 'Borrow marked as returned successfully');
  } catch (err) {
    console.error('Mark returned error:', err);
    return fail(res, 'INTERNAL_ERROR', 'Failed to mark borrow as returned', 500);
  }
};
