'use strict';
const bcrypt = require('bcryptjs');
const authRepo = require('../../repositories/web/auth.repository');

async function register({ name, email, phone, address, password, profilePhoto }) {
  const existing = await authRepo.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 400;
    throw err;
  }
  const role = await authRepo.findStudentRole();
  const hash = await bcrypt.hash(password, 10);
  const user = await authRepo.createUser({
    name, email, phone, address, password: hash, profilePhoto, roleId: role.id,
  });
  return user;
}

async function login(email, password) {
  const user = await authRepo.findByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
}

module.exports = { register, login };
