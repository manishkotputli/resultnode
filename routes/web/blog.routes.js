'use strict';
const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/web/blog.controller');

router.get('/blog', blogController.list);
router.get('/blog/:slug', blogController.detail);
router.post('/blog/:slug/comment', blogController.comment);
router.post('/blog/:slug/like', blogController.like);

module.exports = router;
