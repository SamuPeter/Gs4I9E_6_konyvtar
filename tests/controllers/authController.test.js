jest.mock('../../src/services/authService');

const authService = require('../../src/services/authService');
const authController = require('../../src/controllers/authController');

describe('authController', () => {
  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('register', () => {
    test('returns 201 on successful registration', async () => {
      req.body = { email: 'a@b.com', password: 'pw' };
      authService.register.mockResolvedValue({ insertId: 1 });
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('returns 409 when email already exists', async () => {
      req.body = { email: 'a@b.com', password: 'pw' };
      authService.register.mockRejectedValue(new Error('Email already exists'));
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('returns 400 on other registration error', async () => {
      req.body = { email: 'a@b.com', password: 'pw' };
      authService.register.mockRejectedValue(new Error('Some other error'));
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    test('returns 200 with token on successful login', async () => {
      req.body = { email: 'a@b.com', password: 'pw' };
      authService.login.mockResolvedValue({ token: 'tok', user: { id: 1 } });
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ token: 'tok' }) }));
    });

    test('returns 401 on invalid credentials', async () => {
      req.body = { email: 'a@b.com', password: 'wrong' };
      authService.login.mockRejectedValue(new Error('Invalid credentials'));
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
