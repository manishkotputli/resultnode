'use strict';
const express = require('express');
const router = express.Router();

// The public "globals" middleware (mounted app-wide) sets res.locals.currentUser
// from req.session.user, which is the STUDENT/public session. Admin panel uses
// a separate req.session.admin, so override currentUser for every /admin request.
router.use((req, res, next) => {
  res.locals.currentUser = req.session.admin || null;
  next();
});

router.use(require('./auth.routes'));
router.use(require('./dashboard.routes'));
router.use(require('./post.routes'));
router.use(require('./category.routes'));
router.use(require('./user.routes'));
router.use(require('./role.routes'));
router.use(require('./blogCategory.routes'));
router.use(require('./blog.routes'));
router.use(require('./course.routes'));
router.use(require('./testSeries.routes'));
router.use(require('./banner.routes'));
router.use(require('./faq.routes'));
router.use(require('./comment.routes'));
router.use(require('./contactMessage.routes'));
router.use(require('./settings.routes'));
router.use(require('./incomeexpense.routes'));
router.use(require('./purchase.routes'));
module.exports = router;
