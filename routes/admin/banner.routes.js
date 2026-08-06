'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/banner.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/banners', controller.index);
router.post('/banners', controller.store);
router.post('/banners/:id/update', controller.update);
router.post('/banners/:id/delete', controller.destroy);
router.post('/banners/:id/toggle-status', controller.toggleStatus);

module.exports = router;
