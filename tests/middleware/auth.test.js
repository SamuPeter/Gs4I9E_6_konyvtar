jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');

describe('auth middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('returns 401 when no Authorization header', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when header format is not Bearer', () => {
    req.headers.authorization = 'Basic sometoken';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and sets req.user on valid token', () => {
    req.headers.authorization = 'Bearer valid.token';
    jwt.verify.mockReturnValue({ id: 1, email: 'test@test.com', role: 'user' });
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, email: 'test@test.com', role: 'user' });
  });

  test('returns 401 when token verification throws', () => {
    req.headers.authorization = 'Bearer invalid.token';
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
