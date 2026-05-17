jest.mock('../../src/config/data-source');

const AppDataSource = require('../../src/config/data-source');
const loansService = require('../../src/services/loansService');

describe('loansService', () => {
  let mockQR, mockRepo;
  beforeEach(() => {
    mockQR = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      },
    };
    mockRepo = { findAndCount: jest.fn() };
    AppDataSource.createQueryRunner = jest.fn().mockReturnValue(mockQR);
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
  });

  describe('borrow', () => {
    test('throws when book is not found', async () => {
      mockQR.manager.findOne.mockResolvedValue(null);
      await expect(loansService.borrow(1, 99)).rejects.toThrow('Book not found');
      expect(mockQR.rollbackTransaction).toHaveBeenCalled();
    });

    test('throws when book is not available', async () => {
      mockQR.manager.findOne.mockResolvedValue({ id: 99, available: false });
      await expect(loansService.borrow(1, 99)).rejects.toThrow('Book not available');
      expect(mockQR.rollbackTransaction).toHaveBeenCalled();
    });

    test('creates loan and commits on success', async () => {
      mockQR.manager.findOne.mockResolvedValue({ id: 2, available: true });
      mockQR.manager.create.mockReturnValue({});
      mockQR.manager.save.mockResolvedValue({ id: 10 });
      mockQR.manager.update.mockResolvedValue({});

      const result = await loansService.borrow(1, 2);
      expect(result.insertId).toBe(10);
      expect(result.book_status).toBe('loaned');
      expect(mockQR.commitTransaction).toHaveBeenCalled();
    });

    test('releases query runner regardless of outcome', async () => {
      mockQR.manager.findOne.mockResolvedValue(null);
      await expect(loansService.borrow(1, 99)).rejects.toThrow();
      expect(mockQR.release).toHaveBeenCalled();
    });
  });

  describe('return', () => {
    test('throws when loan is not found', async () => {
      mockQR.manager.findOne.mockResolvedValue(null);
      await expect(loansService.return(99)).rejects.toThrow('Loan not found');
    });

    test('throws when loan is already returned', async () => {
      mockQR.manager.findOne.mockResolvedValue({ id: 1, returned_at: new Date(), due_date: new Date(), user_id: 1 });
      await expect(loansService.return(1)).rejects.toThrow('Already returned');
    });

    test('throws when user does not own the loan', async () => {
      mockQR.manager.findOne.mockResolvedValue({ id: 1, returned_at: null, due_date: new Date(), user_id: 2 });
      await expect(loansService.return(1, 99)).rejects.toThrow('Not authorized');
    });

    test('marks loan returned and returns result on success', async () => {
      const dueDate = new Date(Date.now() - 86400000);
      mockQR.manager.findOne.mockResolvedValue({ id: 1, returned_at: null, due_date: dueDate, user_id: 1, book_id: 2 });
      mockQR.manager.update.mockResolvedValue({});

      const result = await loansService.return(1);
      expect(result.id).toBe(1);
      expect(result.overdue_days).toBeGreaterThanOrEqual(1);
      expect(mockQR.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('getByUser', () => {
    test('returns paginated loans with book title', async () => {
      const mockLoans = [{
        id: 1, book_id: 2, book: { title: 'Test Book' },
        borrowed_at: new Date(), due_date: new Date(), returned_at: null, status: 'active'
      }];
      mockRepo.findAndCount.mockResolvedValue([mockLoans, 1]);
      const result = await loansService.getByUser(1);
      expect(result.total).toBe(1);
      expect(result.items[0].title).toBe('Test Book');
    });
  });

  describe('listAll', () => {
    test('returns active loans with user email and book title', async () => {
      const mockLoans = [{
        id: 1, user_id: 1, book_id: 2,
        user: { email: 'a@b.com' }, book: { title: 'Book A' },
        borrowed_at: new Date(), due_date: new Date(), returned_at: null, status: 'active'
      }];
      mockRepo.findAndCount.mockResolvedValue([mockLoans, 1]);
      const result = await loansService.listAll();
      expect(result.total).toBe(1);
      expect(result.items[0].user_email).toBe('a@b.com');
      expect(result.items[0].title).toBe('Book A');
    });
  });
});
