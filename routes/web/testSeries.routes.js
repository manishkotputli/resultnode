'use strict';
const express = require('express');
const router = express.Router();
const testSeriesController = require('../../controllers/web/testSeries.controller');

router.get('/test-series', testSeriesController.list);
router.get('/test-series/:slug', testSeriesController.detail);
router.post('/test-series/:slug/buy', testSeriesController.buy);

module.exports = router;
