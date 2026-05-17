jest.mock('../../src/config/data-source');

const AppDataSource = require('../../src/config/data-source');
const usersService = require('../../src/services/usersService');

describe('usersService', () => {
  let mockRepo;
  beforeEach(() => {
    mockRepo = { findOne: jest.fn() };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
  });

  describe('getById', () => {
    test('returns user when found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'a@b.com', role: 'user' });
      const result = await usersService.getById(1);
      expect(result).toEqual({ id: 1, email: 'a@b.com', role: 'user' });
    });

    test('returns null when user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await usersService.getById(999);
      expect(result).toBeNull();
    });
  });
});
