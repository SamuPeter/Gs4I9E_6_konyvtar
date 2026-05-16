const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/books', booksController.list);
router.get('/books/:id', booksController.getById);
router.post('/books', auth, admin, booksController.create);
router.put('/books/:id', auth, admin, booksController.update);
router.delete('/books/:id', auth, admin, booksController.remove);

module.exports = router;
