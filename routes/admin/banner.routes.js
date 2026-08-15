'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/banner.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload'); // 1. Uploader import karein

const upload = makeUploader('banner'); // 2. Banner uploader initialize karein

router.use(isAdminAuthenticated);

router.get('/banners', controller.index);

// 3. Image upload middleware (upload.single('image')) add karein
router.post('/banners', upload.single('image'), controller.store);
router.post('/banners/:id/update', upload.single('image'), controller.update);

router.post('/banners/:id/delete', controller.destroy);
router.post('/banners/:id/toggle-status', controller.toggleStatus);

module.exports = router;