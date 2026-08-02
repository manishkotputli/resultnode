'use strict';

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  req.flash('error', 'Please login to continue.');
  return res.redirect('/login');
}

function isGuest(req, res, next) {
  if (req.session && req.session.user) return res.redirect('/dashboard');
  next();
}

module.exports = { isAuthenticated, isGuest };
