'use strict';
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/comment.controller');
const { isAdminAuthenticated } = require('../../middlewares/adminAuth');

router.use(isAdminAuthenticated);

router.get('/comments', controller.index);
router.post('/comments/:id/toggle-approval', controller.toggleApproval);
router.post('/comments/:id/delete', controller.destroy);

module.exports = router;
