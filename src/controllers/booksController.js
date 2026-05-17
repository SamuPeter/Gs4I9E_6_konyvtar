const booksService = require('../services/booksService');
const { success, fail } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    const filter = {
      search: req.query.search || '',
      available: req.query.available === '1' || req.query.available === 'true'
    };
    const books = await booksService.list(filter);
    return success(res, books, 'Books retrieved successfully');
  } catch (err) {
    return fail(res, 'INTERNAL_ERROR', 'Failed to retrieve books', 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const book = await booksService.getById(req.params.id);
    if (!book) return fail(res, 'BOOK_NOT_FOUND', 'Book not found', 404);
    return success(res, book, 'Book retrieved successfully');
  } catch (err) {
    return fail(res, 'INTERNAL_ERROR', 'Failed to retrieve book', 500);
  }
};

exports.create = async (req, res) => {
  try {
    const result = await booksService.create(req.body);
    return success(res, { id: result.insertId }, 'Book created successfully', 201);
  } catch (err) {
    return fail(res, 'BOOK_CREATE_FAILED', err.message, 400);
  }
};

exports.update = async (req, res) => {
  try {
    await booksService.update(req.params.id, req.body);
    return success(res, null, 'Book updated successfully');
  } catch (err) {
    return fail(res, 'BOOK_UPDATE_FAILED', err.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    await booksService.delete(req.params.id);
    return success(res, null, 'Book deleted successfully');
  } catch (err) {
    return fail(res, 'INTERNAL_ERROR', 'Failed to delete book', 500);
  }
};
