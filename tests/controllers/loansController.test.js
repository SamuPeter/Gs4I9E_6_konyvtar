jest.mock('../../src/services/loansService');

const loansService = require('../../src/services/loansService');
const loansController = require('../../src/controllers/loansController');

describe('loansController', () => {
  let req, res;
  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('borrow', () => {
    test('returns 201 on success', async () => {
      req.params.bookId = '2';
      loansService.borrow.mockResolvedValue({ insertId: 10, due_date: '2026-05-31', book_status: 'loaned' });
      await loansController.borrow(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('returns 400 when book is unavailable', async () => {
      req.params.bookId = '2';
      loansService.borrow.mockRejectedValue(new Error('Book not available'));
      await loansController.borrow(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('create', () => {
    test('returns 400 when book_id is missing', async () => {
      req.body = {};
      await loansController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 201 on success', async () => {
      req.body = { book_id: 2 };
      loansService.borrow.mockResolvedValue({ insertId: 10, due_date: '2026-05-31' });
      await loansController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('return', () => {
    test('returns 200 on success', async () => {
      req.params.loanId = '1';
      loansService.return.mockResolvedValue({ returned_at: new Date(), overdue_days: 0 });
      await loansController.return(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 400 on error', async () => {
      req.params.loanId = '1';
      loansService.return.mockRejectedValue(new Error('Already returned'));
      await loansController.return(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('myLoans', () => {
    test('returns 200 with loans', async () => {
      loansService.getByUser.mockResolvedValue({ items: [], total: 0 });
      await loansController.myLoans(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 500 on service error', async () => {
      loansService.getByUser.mockRejectedValue(new Error('DB error'));
      await loansController.myLoans(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('listAll', () => {
    test('returns 200 with all active loans', async () => {
      loansService.listAll.mockResolvedValue({ items: [], total: 0 });
      await loansController.listAll(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
