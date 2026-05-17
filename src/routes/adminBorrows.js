const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminBorrowsController = require('../controllers/adminBorrowsController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Search borrows with filters
router.get('/borrows', adminBorrowsController.searchBorrows);

// Get single borrow details
router.get('/borrows/:id', adminBorrowsController.getBorrow);

// Update borrow due date
router.put('/borrows/:id/due-date', adminBorrowsController.updateDueDate);

// Mark borrow as returned
router.post('/borrows/:id/mark-returned', adminBorrowsController.markReturned);

module.exports = router;
