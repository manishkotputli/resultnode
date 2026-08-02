'use strict';
const bcrypt = require('bcryptjs');
const authRepo = require('../../repositories/admin/auth.repository');

// Roles allowed to enter the admin panel (seeded in 20260101000001-roles.js).
// 'User' (prefix US) is the public/student role and must NOT be able to log in here.
const ADMIN_ROLE_PREFIXES = ['SA', 'AD', 'DEV'];

async function login(email, password) {
  const user = await authRepo.findByEmail(email);
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  if (!user.Role || !ADMIN_ROLE_PREFIXES.includes(user.Role.prefix)) {
    const err = new Error('This account does not have admin panel access.');
    err.status = 403;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Your account has been deactivated.');
    err.status = 403;
    throw err;
  }

  return user;
}

module.exports = { login, ADMIN_ROLE_PREFIXES };
