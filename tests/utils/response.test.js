const { success, fail } = require('../../src/utils/response');

describe('response helpers', () => {
  let res;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('success', () => {
    test('sends 200 with correct shape', () => {
      success(res, { id: 1 }, 'OK');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 }, message: 'OK' });
    });

    test('uses custom status code', () => {
      success(res, null, 'Created', 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('uses default message when omitted', () => {
      success(res, null);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Operation successful' }));
    });
  });

  describe('fail', () => {
    test('sends 400 with correct shape', () => {
      fail(res, 'ERR', 'Bad request');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'ERR', message: 'Bad request' });
    });

    test('uses custom status code', () => {
      fail(res, 'NOT_FOUND', 'Not found', 404);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
