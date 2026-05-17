jest.mock('../../src/services/booksService');

const booksService = require('../../src/services/booksService');
const booksController = require('../../src/controllers/booksController');

describe('booksController', () => {
  let req, res;
  beforeEach(() => {
    req = { query: {}, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('list', () => {
    test('returns 200 with books on success', async () => {
      booksService.list.mockResolvedValue([{ id: 1 }]);
      await booksController.list(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 500 on service error', async () => {
      booksService.list.mockRejectedValue(new Error('DB error'));
      await booksController.list(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getById', () => {
    test('returns 404 when book not found', async () => {
      req.params.id = '999';
      booksService.getById.mockResolvedValue(null);
      await booksController.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 with book on success', async () => {
      req.params.id = '1';
      booksService.getById.mockResolvedValue({ id: 1, title: 'A' });
      await booksController.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('create', () => {
    test('returns 201 on success', async () => {
      booksService.create.mockResolvedValue({ insertId: 5 });
      await booksController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('returns 400 on service error', async () => {
      booksService.create.mockRejectedValue(new Error('Validation error'));
      await booksController.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('update', () => {
    test('returns 200 on success', async () => {
      booksService.update.mockResolvedValue();
      await booksController.update(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 400 on service error', async () => {
      booksService.update.mockRejectedValue(new Error('Update error'));
      await booksController.update(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('remove', () => {
    test('returns 200 on success', async () => {
      booksService.delete.mockResolvedValue();
      await booksController.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 500 on service error', async () => {
      booksService.delete.mockRejectedValue(new Error('Delete error'));
      await booksController.remove(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
