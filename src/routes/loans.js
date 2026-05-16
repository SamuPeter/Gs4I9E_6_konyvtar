const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loansController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @openapi
 * components:
 *   schemas:
 *     Loan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         book_id:
 *           type: integer
 *         title:
 *           type: string
 *         borrowed_at:
 *           type: string
 *           format: date-time
 *         due_date:
 *           type: string
 *           format: date-time
 *         returned_at:
 *           type: string
 *           nullable: true
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, returned]
 *     BorrowResponse:
 *       type: object
 *       properties:
 *         loan_id:
 *           type: integer
 *         due_date:
 *           type: string
 *           format: date-time
 *         book_status:
 *           type: string
 *     ReturnResponse:
 *       type: object
 *       properties:
 *         loan_id:
 *           type: integer
 *         return_date:
 *           type: string
 *           format: date-time
 *         overdue_days:
 *           type: integer
 *     PaginatedLoans:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Loan'
 *         total:
 *           type: integer
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /api/v1/loans/{bookId}:
 *   post:
 *     tags:
 *       - Loans
 *     summary: Borrow a book (path)
 *     description: Borrow a book by bookId. Returns loan id and due date.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Loan created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowResponse'
 *       403:
 *         description: User ineligible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Book unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/loans/:bookId', auth, loansController.borrow);

/**
 * @openapi
 * /api/v1/loans/create:
 *   post:
 *     tags:
 *       - Loans
 *     summary: Create a loan (body)
 *     description: Create a loan with JSON body. Authenticated user is used if token present; admin may provide user_id in body.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               book_id:
 *                 type: integer
 *             required: [book_id]
 *     responses:
 *       201:
 *         description: Loan created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BorrowResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/loans/create', auth, loansController.create);

/**
 * @openapi
 * /api/v1/loans/{loanId}/return:
 *   put:
 *     tags:
 *       - Loans
 *     summary: Return a loan
 *     description: Mark a loan as returned. Only the loan owner or admin may return a loan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Loan returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReturnResponse'
 *       400:
 *         description: Bad Request / Invalid state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Loan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/loans/:loanId/return', auth, loansController.return);

/**
 * @openapi
 * /api/v1/loans/me:
 *   get:
 *     tags:
 *       - Loans
 *     summary: Get current user's loans
 *     description: Returns paginated loans for the authenticated user. Supports status filter (active|returned).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, returned]
 *         description: Filter by loan status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Page size (default 50)
 *     responses:
 *       200:
 *         description: Paginated loans
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedLoans'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/loans/me', auth, loansController.myLoans);

/**
 * @openapi
 * /api/v1/loans:
 *   get:
 *     tags:
 *       - Loans
 *     summary: List all loans (admin)
 *     description: Admin-only endpoint returning paginated loans across all users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Page size (default 100)
 *     responses:
 *       200:
 *         description: Paginated loans
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedLoans'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/loans', auth, admin, loansController.listAll);

module.exports = router;
