'use strict';
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/categories', categoryController.index);
router.post('/categories', categoryController.store);
router.post('/categories/:id/update', categoryController.update);
router.post('/categories/:id/delete', categoryController.destroy);
router.post('/categories/:id/toggle-status', categoryController.toggleStatus);

module.exports = router;
