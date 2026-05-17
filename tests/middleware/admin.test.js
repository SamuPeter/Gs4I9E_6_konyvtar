const adminMiddleware = require('../../src/middleware/admin');

describe('admin middleware', () => {
  let res, next;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('returns 401 when req.user is not set', () => {
    adminMiddleware({}, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when user role is not admin', () => {
    adminMiddleware({ user: { role: 'user' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when user is admin', () => {
    adminMiddleware({ user: { role: 'admin' } }, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
