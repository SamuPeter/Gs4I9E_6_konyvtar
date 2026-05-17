jest.mock('../../src/config/data-source');

const AppDataSource = require('../../src/config/data-source');
const booksService = require('../../src/services/booksService');

describe('booksService', () => {
  let mockRepo, mockQb;
  beforeEach(() => {
    mockQb = {
      select: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };
    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);
  });

  describe('list', () => {
    test('returns books without applying filters when none given', async () => {
      mockQb.getMany.mockResolvedValue([{ id: 1, title: 'Book A' }]);
      const result = await booksService.list({});
      expect(result).toEqual([{ id: 1, title: 'Book A' }]);
      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });

    test('applies search filter when search is provided', async () => {
      mockQb.getMany.mockResolvedValue([]);
      await booksService.list({ search: 'test' });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.objectContaining({ search: '%test%' })
      );
    });

    test('applies available filter when available is true', async () => {
      mockQb.getMany.mockResolvedValue([]);
      await booksService.list({ available: true });
      expect(mockQb.andWhere).toHaveBeenCalledWith('b.available = true');
    });
  });

  describe('getById', () => {
    test('returns book when found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, title: 'Book A' });
      const result = await booksService.getById(1);
      expect(result).toEqual({ id: 1, title: 'Book A' });
    });

    test('returns null when book not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await booksService.getById(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('creates book and returns insertId', async () => {
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockResolvedValue({ id: 5 });
      const result = await booksService.create({ title: 'New Book', author: 'Author' });
      expect(result).toEqual({ insertId: 5 });
    });

    test('sets available to true by default', async () => {
      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockResolvedValue({ id: 6 });
      await booksService.create({ title: 'Book', author: 'Author' });
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ available: true }));
    });
  });

  describe('update', () => {
    test('calls repo update with correct data', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });
      await booksService.update(1, { title: 'Updated', author: 'A', available: true });
      expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'Updated' }));
    });
  });

  describe('delete', () => {
    test('calls repo delete with the given id', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      await booksService.delete(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
