'use strict';
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/web/dashboard.controller');
const { isAuthenticated } = require('../../middlewares/auth');

router.use('/dashboard', isAuthenticated);
router.get('/dashboard', dashboardController.index);
router.get('/dashboard/purchases', dashboardController.purchases);
router.get('/dashboard/finance-settings', dashboardController.financeSettings);
router.post('/dashboard/finance-settings/bank', dashboardController.addBank);
router.post('/dashboard/finance-settings/category', dashboardController.addCategory);
router.get('/dashboard/income-expense', dashboardController.incomeExpense);
router.post('/dashboard/income-expense', dashboardController.addEntry);

module.exports = router;
