'use strict';
const express = require('express');
const router = express.Router();
const purchaseController = require('../../controllers/admin/purchase.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/purchases', purchaseController.index);
router.get('/purchases/:id/receipt', purchaseController.receipt);
router.post('/purchases/:id/status', purchaseController.updateStatus);

module.exports = router;
