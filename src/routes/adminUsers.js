const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminUsersController = require('../controllers/adminUsersController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// List users with pagination and search
router.get('/users', adminUsersController.listUsers);

// Get single user
router.get('/users/:id', adminUsersController.getUser);

// Update user (email, role, is_active)
router.put('/users/:id', adminUsersController.updateUser);

// Reset user password
router.post('/users/:id/reset-password', adminUsersController.resetPassword);

// Deactivate user (soft delete)
router.delete('/users/:id', adminUsersController.deleteUser);

module.exports = router;
