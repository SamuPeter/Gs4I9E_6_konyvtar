jest.mock('../../src/config/data-source');

const AppDataSource = require('../../src/config/data-source');
const adminBorrowsService = require('../../src/services/adminBorrowsService');

describe('adminBorrowsService', () => {
  let mockRepo, mockQb;
  beforeEach(() => {
    mockQb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getCount: jest.fn(),
      getOne: jest.fn(),
    };
    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      update: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
  });

  describe('searchBorrows', () => {
    test('maps raw rows to result format', async () => {
      mockQb.getRawMany.mockResolvedValue([{
        l_id: 1, l_user_id: 2, l_book_id: 3,
        l_borrowed_at: new Date(), l_due_date: new Date(),
        l_returned_at: null, l_status: 'active',
        u_email: 'a@b.com', b_title: 'Book A'
      }]);
      const result = await adminBorrowsService.searchBorrows();
      expect(result[0].id).toBe(1);
      expect(result[0].user_email).toBe('a@b.com');
      expect(result[0].book_title).toBe('Book A');
    });

    test('returns empty array when no results', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      const result = await adminBorrowsService.searchBorrows();
      expect(result).toEqual([]);
    });
  });

  describe('getBorrowCount', () => {
    test('returns total count', async () => {
      mockQb.getCount.mockResolvedValue(10);
      const result = await adminBorrowsService.getBorrowCount();
      expect(result).toBe(10);
    });
  });

  describe('getBorrowById', () => {
    test('returns undefined when not found', async () => {
      mockQb.getOne.mockResolvedValue(null);
      const result = await adminBorrowsService.getBorrowById(999);
      expect(result).toBeUndefined();
    });

    test('maps loan to result format', async () => {
      mockQb.getOne.mockResolvedValue({
        id: 1, user_id: 2, book_id: 3,
        borrowed_at: new Date(), due_date: new Date(),
        returned_at: null, status: 'active',
        user: { email: 'a@b.com', id: 2 },
        book: { title: 'Book A', id: 3 }
      });
      const result = await adminBorrowsService.getBorrowById(1);
      expect(result.id).toBe(1);
      expect(result.user_email).toBe('a@b.com');
      expect(result.book_title).toBe('Book A');
    });
  });

  describe('updateBorrowDueDate', () => {
    test('returns true on success', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      const result = await adminBorrowsService.updateBorrowDueDate(1, '2026-06-01');
      expect(mockRepo.update).toHaveBeenCalledWith(1, { due_date: '2026-06-01' });
      expect(result).toBe(true);
    });

    test('returns false when no rows affected', async () => {
      mockRepo.update.mockResolvedValue({ affected: 0 });
      const result = await adminBorrowsService.updateBorrowDueDate(999, '2026-06-01');
      expect(result).toBe(false);
    });
  });

  describe('markBorrowReturned', () => {
    test('sets status to returned and returns true', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      const result = await adminBorrowsService.markBorrowReturned(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'returned' }));
      expect(result).toBe(true);
    });
  });
});
