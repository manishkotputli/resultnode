'use strict';

function isAdminAuthenticated(req, res, next) {
  if (req.session && req.session.admin) return next();
  req.session.adminReturnTo = req.originalUrl;
  req.flash('error', 'Please login to continue.');
  return res.redirect('/admin/login');
}

function isAdminGuest(req, res, next) {
  if (req.session && req.session.admin) return res.redirect('/admin/dashboard');
  next();
}

module.exports = { isAdminAuthenticated, isAdminGuest };
