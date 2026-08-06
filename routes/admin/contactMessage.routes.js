'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/contactMessage.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/contact-messages', controller.index);
router.post('/contact-messages/:id/toggle-read', controller.toggleRead);
router.post('/contact-messages/:id/delete', controller.destroy);

module.exports = router;
