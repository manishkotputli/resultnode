'use strict';
const express = require('express');
const router = express.Router();
const incomeExpenseController = require('../../controllers/admin/incomeExpense.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/income-expense', incomeExpenseController.index);
router.post('/income-expense', incomeExpenseController.storeEntry);
router.post('/income-expense/:id/update', incomeExpenseController.updateEntry);
router.post('/income-expense/:id/delete', incomeExpenseController.destroyEntry);
router.post('/income-expense/bank', incomeExpenseController.storeBank);
router.post('/income-expense/bank/:id/update', incomeExpenseController.updateBank);
router.post('/income-expense/bank/:id/delete', incomeExpenseController.destroyBank);

module.exports = router;