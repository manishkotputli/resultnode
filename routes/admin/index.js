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

// NOTE: controlroute.js and postroutes.js are still empty placeholders in the
// original project (Posts / Categories / Roles / Settings admin CRUD).
// We'll fill these in and wire them here in the next steps.

module.exports = router;
