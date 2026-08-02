'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');
const { isAdminGuest } = require('../../middlewares/adminAuth');
const { loginValidator } = require('../../validators/auth.validator');

router.get('/login', isAdminGuest, authController.showLogin);
router.post('/login', isAdminGuest, loginValidator, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
