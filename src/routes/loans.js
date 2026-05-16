const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loansController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/loans/:bookId', auth, loansController.borrow);
router.put('/loans/:loanId/return', auth, loansController.return);
router.get('/loans/me', auth, loansController.myLoans);
router.get('/loans', auth, admin, loansController.listAll);

module.exports = router;
