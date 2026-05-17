jest.mock('../../src/config/data-source');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppDataSource = require('../../src/config/data-source');
const authService = require('../../src/services/authService');

describe('authService', () => {
  let mockRepo;
  beforeEach(() => {
    mockRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn() };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('register', () => {
    test('hashes password and returns insertId', async () => {
      bcrypt.hash.mockResolvedValue('hashed-pw');
      mockRepo.create.mockReturnValue({ email: 'a@b.com', password: 'hashed-pw' });
      mockRepo.save.mockResolvedValue({ id: 1, email: 'a@b.com' });

      const result = await authService.register('a@b.com', 'password123');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual({ insertId: 1 });
    });
  });

  describe('login', () => {
    test('throws on unknown email', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(authService.login('x@y.com', 'pw')).rejects.toThrow('Invalid credentials');
    });

    test('throws on wrong password', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed', role: 'user' });
      bcrypt.compare.mockResolvedValue(false);
      await expect(authService.login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    test('returns token and user on valid credentials', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hashed', role: 'user' });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-token');

      const result = await authService.login('a@b.com', 'password123');
      expect(result.token).toBe('mocked-token');
      expect(result.user).toEqual({ id: 1, email: 'a@b.com', role: 'user' });
    });
  });
});
