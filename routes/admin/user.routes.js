'use strict';
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/users', userController.index);
router.get('/users/create', userController.createForm);
router.post('/users', userController.store);
router.get('/users/:id/edit', userController.editForm);
router.post('/users/:id/update', userController.update);
router.post('/users/:id/delete', userController.destroy);
router.post('/users/:id/toggle-status', userController.toggleStatus);

module.exports = router;
