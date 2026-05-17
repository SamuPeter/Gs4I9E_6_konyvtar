jest.mock('../../src/config/data-source');
jest.mock('bcrypt');

const bcrypt = require('bcrypt');
const AppDataSource = require('../../src/config/data-source');
const adminUsersService = require('../../src/services/adminUsersService');

describe('adminUsersService', () => {
  let mockRepo, mockQb;
  beforeEach(() => {
    mockQb = {
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    };
    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
  });

  describe('listUsers', () => {
    test('returns list of users', async () => {
      mockQb.getMany.mockResolvedValue([{ id: 1 }]);
      const result = await adminUsersService.listUsers();
      expect(result).toEqual([{ id: 1 }]);
    });

    test('applies email filter when query is provided', async () => {
      mockQb.getMany.mockResolvedValue([]);
      await adminUsersService.listUsers('alice');
      expect(mockQb.andWhere).toHaveBeenCalledWith('u.email LIKE :query', { query: '%alice%' });
    });

    test('applies role filter when role is provided', async () => {
      mockQb.getMany.mockResolvedValue([]);
      await adminUsersService.listUsers('', 'admin');
      expect(mockQb.andWhere).toHaveBeenCalledWith('u.role = :role', { role: 'admin' });
    });
  });

  describe('getUserCount', () => {
    test('returns total count', async () => {
      mockQb.getCount.mockResolvedValue(5);
      const result = await adminUsersService.getUserCount();
      expect(result).toBe(5);
    });
  });

  describe('getUserById', () => {
    test('returns user when found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com' });
      const result = await adminUsersService.getUserById(1);
      expect(result).toEqual({ id: 1, email: 'a@b.com' });
    });

    test('returns null when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await adminUsersService.getUserById(999);
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    test('returns false when no allowed fields are provided', async () => {
      const result = await adminUsersService.updateUser(1, { unknown: 'field' });
      expect(result).toBe(false);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    test('updates and returns true on success', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      const result = await adminUsersService.updateUser(1, { email: 'new@email.com' });
      expect(mockRepo.update).toHaveBeenCalledWith(1, { email: 'new@email.com' });
      expect(result).toBe(true);
    });
  });

  describe('resetPassword', () => {
    test('hashes password and updates it', async () => {
      bcrypt.hash.mockResolvedValue('hashed-pw');
      mockRepo.update.mockResolvedValue({ affected: 1 });
      const result = await adminUsersService.resetPassword(1, 'newpassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockRepo.update).toHaveBeenCalledWith(1, { password: 'hashed-pw' });
      expect(result).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    test('sets is_active to false and returns true', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      const result = await adminUsersService.deactivateUser(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, { is_active: false });
      expect(result).toBe(true);
    });

    test('returns false when no rows affected', async () => {
      mockRepo.update.mockResolvedValue({ affected: 0 });
      const result = await adminUsersService.deactivateUser(999);
      expect(result).toBe(false);
    });
  });
});
