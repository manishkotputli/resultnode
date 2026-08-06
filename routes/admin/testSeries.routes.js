'use strict';
const express = require('express');
const router = express.Router();
const testSeriesController = require('../../controllers/admin/testSeries.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload');

const upload = makeUploader('test-series');

router.use(isAdminAuthenticated);

router.get('/test-series', testSeriesController.index);
router.get('/test-series/create', testSeriesController.createForm);
router.post('/test-series', upload.single('thumbnail'), testSeriesController.store);
router.get('/test-series/:id/edit', testSeriesController.editForm);
router.post('/test-series/:id/update', upload.single('thumbnail'), testSeriesController.update);
router.post('/test-series/:id/delete', testSeriesController.destroy);

router.get('/test-series/:seriesId/tests', testSeriesController.testsIndex);
router.post('/test-series/:seriesId/tests', testSeriesController.storeTest);
router.post('/test-series/:seriesId/tests/:testId/update', testSeriesController.updateTest);
router.post('/test-series/:seriesId/tests/:testId/delete', testSeriesController.destroyTest);

router.get('/test-series/:seriesId/tests/:testId/questions', testSeriesController.questionsIndex);
router.post('/test-series/:seriesId/tests/:testId/questions', testSeriesController.storeQuestion);
router.post('/test-series/:seriesId/tests/:testId/questions/:questionId/update', testSeriesController.updateQuestion);
router.post('/test-series/:seriesId/tests/:testId/questions/:questionId/delete', testSeriesController.destroyQuestion);

router.get('/test-series/:seriesId/results', testSeriesController.attemptsIndex);
router.post('/test-series/:seriesId/results/:attemptId/delete', testSeriesController.destroyAttempt);

module.exports = router;
