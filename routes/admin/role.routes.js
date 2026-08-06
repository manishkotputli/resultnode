'use strict';
const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/role.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/roles', roleController.index);
router.post('/roles', roleController.store);
router.post('/roles/:id/update', roleController.update);
router.post('/roles/:id/delete', roleController.destroy);

module.exports = router;
