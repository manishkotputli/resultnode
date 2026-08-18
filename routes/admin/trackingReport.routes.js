'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/trackingReport.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/tracking-report', controller.index);
router.get('/tracking-report/data', controller.data);

module.exports = router;
