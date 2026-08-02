'use strict';
const { validationResult } = require('express-validator');
const authService = require('../../services/admin/auth.service');

function showLogin(req, res) {
  res.render('admin/auth/login', { title: 'Admin Login', layout: false });
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/admin/login');
    }

    const { email, password } = req.body;
    let user;
    try {
      user = await authService.login(email, password);
    } catch (err) {
      if (err.status === 403) {
        req.flash('error', err.message);
        return res.redirect('/admin/login');
      }
      throw err;
    }

    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/admin/login');
    }

    req.session.admin = {
      id: user.id,
      name: user.name,
      email: user.email,
      user_code: user.user_code,
      avatar: user.profile_photo,
      role: user.Role ? user.Role.name : null,
      role_prefix: user.Role ? user.Role.prefix : null,
    };

    return res.redirect(req.session.adminReturnTo || '/admin/dashboard');
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  delete req.session.admin;
  req.session.save(() => res.redirect('/admin/login'));
}

module.exports = { showLogin, login, logout };
