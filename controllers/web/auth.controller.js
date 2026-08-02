'use strict';
const { validationResult } = require('express-validator');
const authService = require('../../services/web/auth.service');

function showRegister(req, res) {
  res.render('web/auth/register', { title: 'Create Account' });
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/register');
    }
    const profilePhoto = req.file ? `/uploads/users/${req.file.filename}` : null;
    const user = await authService.register({ ...req.body, profilePhoto });
    req.session.user = { id: user.id, name: user.name, email: user.email, user_code: user.user_code };
    res.redirect('/dashboard');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/register');
    }
    next(err);
  }
}

function showLogin(req, res) {
  res.render('web/auth/login', { title: 'Login' });
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/login');
    }
    const user = await authService.login(req.body.email, req.body.password);
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }
    req.session.user = { id: user.id, name: user.name, email: user.email, user_code: user.user_code };
    res.redirect(req.session.returnTo || '/dashboard');
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

module.exports = { showRegister, register, showLogin, login, logout };
