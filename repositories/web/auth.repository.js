'use strict';
const db = require('../../models');

async function findByEmail(email) {
  return db.User.scope('withPassword').findOne({ where: { email } });
}

async function findStudentRole() {
  return db.Role.findOne({ where: { prefix: 'US' } });
}

async function createUser({ name, email, phone, password, address, profilePhoto, roleId }) {
  return db.User.create({
    role_id: roleId, name, email, phone, password, address, profile_photo: profilePhoto,
  });
}

async function findById(id) {
  return db.User.findByPk(id);
}

module.exports = { findByEmail, findStudentRole, createUser, findById };
