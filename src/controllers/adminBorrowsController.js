const adminBorrowsService = require('../services/adminBorrowsService');
const auditLogService = require('../services/auditLogService');

exports.searchBorrows = async (req, res) => {
  try {
    const { user_query = '', item_query = '', status, from_date, to_date, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const borrows = await adminBorrowsService.searchBorrows(
      user_query,
      item_query,
      status,
      from_date,
      to_date,
      limitNum,
      offset
    );
    const total = await adminBorrowsService.getBorrowCount(user_query, item_query, status, from_date, to_date);

    res.json({
      data: borrows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Search borrows error:', err);
    res.status(500).json({ error: 'Failed to search borrows' });
  }
};

exports.getBorrow = async (req, res) => {
  try {
    const { id } = req.params;
    const borrow = await adminBorrowsService.getBorrowById(id);

    if (!borrow) return res.status(404).json({ error: 'Borrow record not found' });
    res.json(borrow);
  } catch (err) {
    console.error('Get borrow error:', err);
    res.status(500).json({ error: 'Failed to get borrow record' });
  }
};

exports.updateDueDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { due_date } = req.body;

    if (!due_date) return res.status(400).json({ error: 'due_date is required' });

    const borrow = await adminBorrowsService.getBorrowById(id);
    if (!borrow) return res.status(404).json({ error: 'Borrow record not found' });

    const success = await adminBorrowsService.updateBorrowDueDate(id, due_date);
    if (!success) return res.status(400).json({ error: 'Update failed' });

    await auditLogService.logAction(req.user.id, 'BORROW_DUE_DATE_UPDATE', parseInt(id), 'borrow', { 
      user_email: borrow.user_email,
      book_title: borrow.book_title,
      new_due_date: due_date 
    });

    const updated = await adminBorrowsService.getBorrowById(id);
    res.json(updated);
  } catch (err) {
    console.error('Update due date error:', err);
    res.status(500).json({ error: 'Failed to update due date' });
  }
};

exports.markReturned = async (req, res) => {
  try {
    const { id } = req.params;

    const borrow = await adminBorrowsService.getBorrowById(id);
    if (!borrow) return res.status(404).json({ error: 'Borrow record not found' });

    const success = await adminBorrowsService.markBorrowReturned(id);
    if (!success) return res.status(400).json({ error: 'Mark returned failed' });

    await auditLogService.logAction(req.user.id, 'BORROW_MARKED_RETURNED', parseInt(id), 'borrow', {
      user_email: borrow.user_email,
      book_title: borrow.book_title
    });

    const updated = await adminBorrowsService.getBorrowById(id);
    res.json(updated);
  } catch (err) {
    console.error('Mark returned error:', err);
    res.status(500).json({ error: 'Failed to mark as returned' });
  }
};
