'use strict';
const express = require('express');
const router = express.Router();
const postController = require('../../controllers/admin/post.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/posts', postController.index);
router.get('/posts/create', postController.createForm);
router.post('/posts', postController.store);
router.get('/posts/:id/edit', postController.editForm);
router.post('/posts/:id/update', postController.update);
router.post('/posts/:id/delete', postController.destroy);
router.post('/posts/:id/toggle-status', postController.toggleStatus);

module.exports = router;
