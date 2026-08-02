'use strict';
const express = require('express');
const router = express.Router();
const pagesController = require('../../controllers/web/pages.controller');
const { contactValidator } = require('../../validators/contact.validator');

router.get('/about', pagesController.about);
router.get('/terms', pagesController.terms);
router.get('/privacy-policy', pagesController.privacyPolicy);
router.get('/disclaimer', pagesController.disclaimer);
router.get('/faqs', pagesController.faqsPage);
router.get('/contact', pagesController.contactForm);
router.post('/contact/send', contactValidator, pagesController.contactSubmit);

module.exports = router;
