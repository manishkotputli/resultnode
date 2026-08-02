'use strict';
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.get('/dashboard', isAdminAuthenticated, dashboardController.showDashboard);

module.exports = router;
