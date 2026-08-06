'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 15;

async function list({ page = 1, search = '', roleId = '', status = '' } = {}) {
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { user_code: { [Op.like]: `%${search}%` } },
    ];
  }
  if (status === 'active') where.is_active = true;
  if (status === 'inactive') where.is_active = false;
  if (roleId) where.role_id = roleId;

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.User.findAndCountAll({
    where,
    include: [{ model: db.Role }],
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
    distinct: true,
  });

  return { rows, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.User.findByPk(id, { include: [{ model: db.Role }] });
}

async function findByIdWithPassword(id) {
  return db.User.scope('withPassword').findByPk(id);
}

async function findByEmail(email, excludeId) {
  const where = { email };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.User.findOne({ where });
}

async function create(data) {
  return db.User.create(data);
}

async function update(user, data) {
  return user.update(data);
}

async function destroy(user) {
  return user.destroy();
}

module.exports = { list, findById, findByIdWithPassword, findByEmail, create, update, destroy, PER_PAGE };
