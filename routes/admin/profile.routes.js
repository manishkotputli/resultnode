'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/profile.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');
const { makeUploader } = require('../../middlewares/upload');

const upload = makeUploader('profile');

router.use(isAdminAuthenticated);

router.get('/profile', controller.edit);
router.post('/profile', upload.single('profile_photo'), controller.update);
router.post('/profile/change-password', controller.changePassword);

module.exports = router;
