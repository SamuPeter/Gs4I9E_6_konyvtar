jest.mock('../../src/services/adminUsersService');
jest.mock('../../src/services/auditLogService');

const adminUsersService = require('../../src/services/adminUsersService');
const auditLogService = require('../../src/services/auditLogService');
const adminUsersController = require('../../src/controllers/adminUsersController');

describe('adminUsersController', () => {
  let req, res;
  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: { id: 99 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    auditLogService.logAction = jest.fn().mockResolvedValue();
  });

  describe('listUsers', () => {
    test('returns 200 with paginated users', async () => {
      adminUsersService.listUsers.mockResolvedValue([{ id: 1 }]);
      adminUsersService.getUserCount.mockResolvedValue(1);
      await adminUsersController.listUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ pagination: expect.any(Object) })
      }));
    });
  });

  describe('getUser', () => {
    test('returns 404 when user not found', async () => {
      req.params.id = '999';
      adminUsersService.getUserById.mockResolvedValue(null);
      await adminUsersController.getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 with user on success', async () => {
      req.params.id = '1';
      adminUsersService.getUserById.mockResolvedValue({ id: 1 });
      await adminUsersController.getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateUser', () => {
    test('returns 404 when user not found', async () => {
      req.params.id = '999';
      adminUsersService.getUserById.mockResolvedValue(null);
      await adminUsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 and logs audit action on success', async () => {
      req.params.id = '1';
      req.body = { email: 'new@email.com' };
      adminUsersService.getUserById
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, email: 'new@email.com' });
      adminUsersService.updateUser.mockResolvedValue(true);
      await adminUsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(auditLogService.logAction).toHaveBeenCalledWith(99, 'USER_UPDATE', 1, 'user', expect.any(Object));
    });
  });

  describe('resetPassword', () => {
    test('returns 404 when user not found', async () => {
      req.params.id = '999';
      adminUsersService.getUserById.mockResolvedValue(null);
      await adminUsersController.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 and logs audit action on success', async () => {
      req.params.id = '1';
      req.body = { new_password: 'newpw' };
      adminUsersService.getUserById.mockResolvedValue({ id: 1, email: 'a@b.com' });
      adminUsersService.resetPassword.mockResolvedValue(true);
      await adminUsersController.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(auditLogService.logAction).toHaveBeenCalledWith(99, 'PASSWORD_RESET', 1, 'user', expect.any(Object));
    });
  });

  describe('deleteUser', () => {
    test('returns 404 when user not found', async () => {
      req.params.id = '999';
      adminUsersService.getUserById.mockResolvedValue(null);
      await adminUsersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 200 and logs audit action on success', async () => {
      req.params.id = '1';
      adminUsersService.getUserById.mockResolvedValue({ id: 1, email: 'a@b.com' });
      adminUsersService.deactivateUser.mockResolvedValue(true);
      await adminUsersController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(auditLogService.logAction).toHaveBeenCalledWith(99, 'USER_DEACTIVATED', 1, 'user', expect.any(Object));
    });
  });
});
