'use strict';
const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blog.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload');

const upload = makeUploader('blog');

router.use(isAdminAuthenticated);

router.get('/blogs', blogController.index);
router.get('/blogs/create', blogController.createForm);
router.post('/blogs', upload.single('thumbnail'), blogController.store);
router.get('/blogs/:id/edit', blogController.editForm);
router.post('/blogs/:id/update', upload.single('thumbnail'), blogController.update);
router.post('/blogs/:id/delete', blogController.destroy);

module.exports = router;
