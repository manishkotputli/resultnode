'use strict';
const express = require('express');
const router = express.Router();
const siteController = require('../../controllers/web/site.controller');
const sitemapController = require('../../controllers/web/sitemap.controller');

router.get('/', siteController.home);
router.get('/category/:slug', siteController.categoryPage);
router.get('/post/:slug', siteController.postDetail);
router.get('/go/:linkId', siteController.trackLinkClick);


router.get('/sitemap.xml', sitemapController.index);

module.exports = router;
