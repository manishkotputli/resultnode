'use strict';
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../../models');
const userRepo = require('../../repositories/admin/user.repository');

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await userRepo.list({
    page,
    search: (query.search || '').trim(),
    roleId: query.role || '',
    status: query.status || '',
  });
  return { users: rows, total: count, page, perPage };
}

async function getById(id) {
  return userRepo.findById(id);
}

function usernameFromEmail(email) {
  return String(email).split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

async function ensureUniqueUsername(base, excludeId) {
  let username = base;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where = excludeId ? { username, id: { [Op.ne]: excludeId } } : { username };
    const existing = await db.User.findOne({ where });
    if (!existing) return username;
    i += 1;
    username = `${base}${i}`;
  }
}

async function createUser(body) {
  if (!body.name || !body.email || !body.password || !body.role_id) {
    const err = new Error('Name, Email, Password and Role are required.');
    err.status = 400;
    throw err;
  }
  const existingEmail = await userRepo.findByEmail(body.email.trim().toLowerCase());
  if (existingEmail) {
    const err = new Error('A user with this email already exists.');
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(body.password, 10);
  let username = (body.username || '').trim() || usernameFromEmail(body.email);
  username = await ensureUniqueUsername(username);

  return userRepo.create({
    role_id: body.role_id,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    username,
    password: hashed,
    phone: body.phone || null,
    address: body.address || null,
    is_active: body.is_active === 'on' || body.is_active === undefined,
  });
}

async function updateUser(id, body, currentAdminId) {
  const user = await userRepo.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  if (!body.name || !body.email || !body.role_id) {
    const err = new Error('Name, Email and Role are required.');
    err.status = 400;
    throw err;
  }
  const existingEmail = await userRepo.findByEmail(body.email.trim().toLowerCase(), id);
  if (existingEmail) {
    const err = new Error('A user with this email already exists.');
    err.status = 400;
    throw err;
  }

  const data = {
    role_id: body.role_id,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone || null,
    address: body.address || null,
  };

  if ((body.username || '').trim()) data.username = body.username.trim();

  // Prevent an admin from locking themselves out
  if (String(id) === String(currentAdminId)) {
    data.is_active = true;
  } else {
    data.is_active = body.is_active === 'on';
  }

  if (body.password && body.password.trim()) {
    data.password = await bcrypt.hash(body.password, 10);
  }

  return userRepo.update(user, data);
}

async function deleteUser(id, currentAdminId) {
  if (String(id) === String(currentAdminId)) {
    const err = new Error('You cannot delete your own account while logged in.');
    err.status = 400;
    throw err;
  }
  const user = await userRepo.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return userRepo.destroy(user);
}

async function toggleStatus(id, currentAdminId) {
  if (String(id) === String(currentAdminId)) {
    const err = new Error('You cannot deactivate your own account while logged in.');
    err.status = 400;
    throw err;
  }
  const user = await userRepo.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  user.is_active = !user.is_active;
  await user.save();
  return user;
}

module.exports = { getList, getById, createUser, updateUser, deleteUser, toggleStatus };
