'use strict';
const db = require('../../models');

async function findByEmail(email) {
  return db.User.scope('withPassword').findOne({
    where: { email },
    include: [{ model: db.Role }],
  });
}

async function findById(id) {
  return db.User.findByPk(id, { include: [{ model: db.Role }] });
}

module.exports = { findByEmail, findById };
