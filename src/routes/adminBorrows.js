const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const adminBorrowsController = require('../controllers/adminBorrowsController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @openapi
 * components:
 *   schemas:
 *     Borrow:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         book_id:
 *           type: integer
 *         borrowed_at:
 *           type: string
 *           format: date-time
 *         due_date:
 *           type: string
 *           format: date-time
 *         returned_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, returned]
 *         user_email:
 *           type: string
 *         book_title:
 *           type: string
 */

/**
 * @openapi
 * /api/admin/borrows:
 *   get:
 *     tags:
 *       - Admin Borrows
 *     summary: Search and list all borrows
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userQuery
 *         schema:
 *           type: string
 *         description: Filter by user email (partial match)
 *       - in: query
 *         name: itemQuery
 *         schema:
 *           type: string
 *         description: Filter by book title (partial match)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned]
 *         description: Filter by loan status
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter borrows from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter borrows up to this date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of borrows with total count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 borrows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Borrow'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/borrows', adminBorrowsController.searchBorrows);

/**
 * @openapi
 * /api/admin/borrows/{id}:
 *   get:
 *     tags:
 *       - Admin Borrows
 *     summary: Get a single borrow by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Borrow ID
 *     responses:
 *       200:
 *         description: Borrow details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Borrow'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Borrow not found
 */
router.get('/borrows/:id', adminBorrowsController.getBorrow);

/**
 * @openapi
 * /api/admin/borrows/{id}/due-date:
 *   put:
 *     tags:
 *       - Admin Borrows
 *     summary: Update the due date of a borrow
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Borrow ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newDueDate
 *             properties:
 *               newDueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Due date updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Borrow not found
 */
router.put('/borrows/:id/due-date', adminBorrowsController.updateDueDate);

/**
 * @openapi
 * /api/admin/borrows/{id}/mark-returned:
 *   post:
 *     tags:
 *       - Admin Borrows
 *     summary: Mark a borrow as returned
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Borrow ID
 *     responses:
 *       200:
 *         description: Borrow marked as returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Borrow not found
 */
router.post('/borrows/:id/mark-returned', adminBorrowsController.markReturned);

module.exports = router;
