jest.mock('../../src/services/adminBorrowsService');
jest.mock('../../src/services/auditLogService');

const adminBorrowsService = require('../../src/services/adminBorrowsService');
const auditLogService = require('../../src/services/auditLogService');
const adminBorrowsController = require('../../src/controllers/adminBorrowsController');

describe('adminBorrowsController', () => {
  let req, res;
  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: { id: 99 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    auditLogService.logAction = jest.fn().mockResolvedValue();
  });

  describe('searchBorrows', () => {
    test('returns 200 with paginated borrows', async () => {
      adminBorrowsService.searchBorrows.mockResolvedValue([]);
      adminBorrowsService.getBorrowCount.mockResolvedValue(0);
      await adminBorrowsController.searchBorrows(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getBorrow', () => {
    test('returns 404 when borrow not found', async () => {
      req.params.id = '999';
      adminBorrowsService.getBorrowById.mockResolvedValue(null);
      await adminBorrowsController.getBorrow(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 on success', async () => {
      req.params.id = '1';
      adminBorrowsService.getBorrowById.mockResolvedValue({ id: 1 });
      await adminBorrowsController.getBorrow(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateDueDate', () => {
    test('returns 400 when due_date is missing', async () => {
      req.body = {};
      await adminBorrowsController.updateDueDate(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 when borrow not found', async () => {
      req.params.id = '999';
      req.body = { due_date: '2026-06-01' };
      adminBorrowsService.getBorrowById.mockResolvedValue(null);
      await adminBorrowsController.updateDueDate(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 and logs audit action on success', async () => {
      req.params.id = '1';
      req.body = { due_date: '2026-06-01' };
      adminBorrowsService.getBorrowById
        .mockResolvedValueOnce({ id: 1, user_email: 'a@b.com', book_title: 'Book A' })
        .mockResolvedValueOnce({ id: 1 });
      adminBorrowsService.updateBorrowDueDate.mockResolvedValue(true);
      await adminBorrowsController.updateDueDate(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(auditLogService.logAction).toHaveBeenCalledWith(99, 'BORROW_DUE_DATE_UPDATE', 1, 'borrow', expect.any(Object));
    });
  });

  describe('markReturned', () => {
    test('returns 404 when borrow not found', async () => {
      req.params.id = '999';
      adminBorrowsService.getBorrowById.mockResolvedValue(null);
      await adminBorrowsController.markReturned(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 and logs audit action on success', async () => {
      req.params.id = '1';
      adminBorrowsService.getBorrowById
        .mockResolvedValueOnce({ id: 1, user_email: 'a@b.com', book_title: 'Book A' })
        .mockResolvedValueOnce({ id: 1, status: 'returned' });
      adminBorrowsService.markBorrowReturned.mockResolvedValue(true);
      await adminBorrowsController.markReturned(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(auditLogService.logAction).toHaveBeenCalledWith(99, 'BORROW_MARKED_RETURNED', 1, 'borrow', expect.any(Object));
    });
  });
});
