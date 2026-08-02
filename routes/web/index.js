'use strict';
const express = require('express');
const router = express.Router();

router.use(require('./site.routes'));
router.use(require('./blog.routes'));
router.use(require('./pages.routes'));
router.use(require('./auth.routes'));
router.use(require('./courses.routes'));
router.use(require('./testSeries.routes'));
router.use(require('./dashboard.routes'));

module.exports = router;
