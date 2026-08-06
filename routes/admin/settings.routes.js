'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/settings.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload');

const upload = makeUploader('settings');
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'footer_logo', maxCount: 1 },
]);

router.use(isAdminAuthenticated);

router.get('/settings', controller.edit);
router.post('/settings', uploadFields, controller.update);

module.exports = router;
