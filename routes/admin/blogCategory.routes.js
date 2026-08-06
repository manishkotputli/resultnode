'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/blogCategory.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/blog-categories', controller.index);
router.post('/blog-categories', controller.store);
router.post('/blog-categories/:id/update', controller.update);
router.post('/blog-categories/:id/delete', controller.destroy);

module.exports = router;
