'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/web/auth.controller');
const { isGuest } = require('../../middlewares/auth');
const { registerValidator, loginValidator } = require('../../validators/auth.validator');
const { makeUploader } = require('../../middlewares/upload');

const uploadPhoto = makeUploader('users');

router.get('/register', isGuest, authController.showRegister);
router.post('/register', isGuest, uploadPhoto.single('profile_photo'), registerValidator, authController.register);
router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, loginValidator, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
