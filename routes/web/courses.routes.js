'use strict';
const express = require('express');
const router = express.Router();
const coursesController = require('../../controllers/web/courses.controller');

router.get('/courses', coursesController.list);
router.get('/courses/:slug', coursesController.detail);
router.post('/courses/:slug/buy', coursesController.buy);

module.exports = router;
