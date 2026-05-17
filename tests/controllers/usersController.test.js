jest.mock('../../src/services/usersService');

const usersService = require('../../src/services/usersService');
const usersController = require('../../src/controllers/usersController');

describe('usersController', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('me', () => {
    test('returns 200 with user data', async () => {
      usersService.getById.mockResolvedValue({ id: 1, email: 'a@b.com' });
      await usersController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when user not found', async () => {
      usersService.getById.mockResolvedValue(null);
      await usersController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 500 on service error', async () => {
      usersService.getById.mockRejectedValue(new Error('DB error'));
      await usersController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
