'use strict';
const roleRepo = require('../../repositories/admin/role.repository');

async function getList(search) {
  return roleRepo.list(search);
}

async function allForSelect() {
  return roleRepo.allForSelect();
}

async function createRole(body) {
  if (!body.name || !body.prefix) {
    const err = new Error('Role Name and Prefix are required.');
    err.status = 400;
    throw err;
  }
  const prefix = body.prefix.trim().toUpperCase();
  const existingName = await roleRepo.findByName(body.name.trim());
  if (existingName) {
    const err = new Error('A role with this name already exists.');
    err.status = 400;
    throw err;
  }
  const existingPrefix = await roleRepo.findByPrefix(prefix);
  if (existingPrefix) {
    const err = new Error('A role with this prefix already exists.');
    err.status = 400;
    throw err;
  }
  return roleRepo.create({ name: body.name.trim(), prefix });
}

async function updateRole(id, body) {
  const role = await roleRepo.findById(id);
  if (!role) {
    const err = new Error('Role not found');
    err.status = 404;
    throw err;
  }
  if (!body.name || !body.prefix) {
    const err = new Error('Role Name and Prefix are required.');
    err.status = 400;
    throw err;
  }
  const prefix = body.prefix.trim().toUpperCase();
  const existingName = await roleRepo.findByName(body.name.trim(), id);
  if (existingName) {
    const err = new Error('A role with this name already exists.');
    err.status = 400;
    throw err;
  }
  const existingPrefix = await roleRepo.findByPrefix(prefix, id);
  if (existingPrefix) {
    const err = new Error('A role with this prefix already exists.');
    err.status = 400;
    throw err;
  }
  return roleRepo.update(role, { name: body.name.trim(), prefix });
}

async function deleteRole(id) {
  const role = await roleRepo.findById(id);
  if (!role) {
    const err = new Error('Role not found');
    err.status = 404;
    throw err;
  }
  const userCount = await roleRepo.countUsers(id);
  if (userCount > 0) {
    const err = new Error(
      `Cannot delete "${role.name}" — ${userCount} user(s) currently have this role.`
    );
    err.status = 400;
    throw err;
  }
  return roleRepo.destroy(role);
}

module.exports = { getList, allForSelect, createRole, updateRole, deleteRole };
