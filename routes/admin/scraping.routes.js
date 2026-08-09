'use strict';
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/scrapingDashboard.controller');
const websiteController = require('../../controllers/admin/scrapingWebsite.controller');
const contentController = require('../../controllers/admin/scrapedContent.controller');
const logsController = require('../../controllers/admin/scrapingLogs.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use('/scraping', isAdminAuthenticated);

router.get('/scraping/dashboard', dashboardController.index);

router.get('/scraping/websites', websiteController.index);
router.post('/scraping/websites', websiteController.store);
router.post('/scraping/websites/:id/update', websiteController.update);
router.post('/scraping/websites/:id/delete', websiteController.destroy);
router.post('/scraping/websites/:id/run', websiteController.runNow);

router.get('/scraping/content', contentController.index);
router.get('/scraping/content/:id/edit', contentController.editForm);
router.post('/scraping/content/:id/update', contentController.update);
router.post('/scraping/content/:id/publish', contentController.publish);
router.post('/scraping/content/:id/reject', contentController.reject);
router.post('/scraping/content/:id/delete', contentController.destroy);
router.post('/scraping/content/bulk', contentController.bulk);

router.get('/scraping/logs', logsController.index);

module.exports = router;
