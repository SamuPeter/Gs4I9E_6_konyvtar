jest.mock('../../src/config/data-source');

const AppDataSource = require('../../src/config/data-source');
const auditLogService = require('../../src/services/auditLogService');

describe('auditLogService', () => {
  let mockRepo, mockQb;
  beforeEach(() => {
    mockQb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
    };
    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      create: jest.fn(),
      save: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
  });

  describe('logAction', () => {
    test('creates and saves an audit log entry', async () => {
      mockRepo.create.mockReturnValue({ admin_user_id: 1 });
      mockRepo.save.mockResolvedValue({});
      await auditLogService.logAction(1, 'USER_UPDATE', 2, 'user', { email: 'a@b.com' });
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        admin_user_id: 1, action_type: 'USER_UPDATE', target_id: 2, target_type: 'user'
      }));
      expect(mockRepo.save).toHaveBeenCalled();
    });

    test('does not throw when save fails (silent error handling)', async () => {
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockRejectedValue(new Error('DB error'));
      await expect(auditLogService.logAction(1, 'USER_UPDATE', 2, 'user')).resolves.not.toThrow();
    });
  });

  describe('getLogs', () => {
    test('returns logs from the repository', async () => {
      mockQb.getMany.mockResolvedValue([{ id: 1 }]);
      const result = await auditLogService.getLogs();
      expect(result).toEqual([{ id: 1 }]);
    });

    test('filters by adminId when provided', async () => {
      mockQb.getMany.mockResolvedValue([]);
      await auditLogService.getLogs(5);
      expect(mockQb.andWhere).toHaveBeenCalledWith('l.admin_user_id = :adminId', { adminId: 5 });
    });

    test('filters by actionType when provided', async () => {
      mockQb.getMany.mockResolvedValue([]);
      await auditLogService.getLogs(null, 'USER_UPDATE');
      expect(mockQb.andWhere).toHaveBeenCalledWith('l.action_type = :actionType', { actionType: 'USER_UPDATE' });
    });
  });

  describe('getLogCount', () => {
    test('returns count from the repository', async () => {
      mockQb.getCount.mockResolvedValue(3);
      const result = await auditLogService.getLogCount();
      expect(result).toBe(3);
    });
  });
});
