'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/faq.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/faqs', controller.index);
router.get('/faqs/create', controller.createForm);
router.post('/faqs', controller.store);
router.get('/faqs/:id/edit', controller.editForm);
router.post('/faqs/:id/update', controller.update);
router.post('/faqs/:id/delete', controller.destroy);

module.exports = router;
