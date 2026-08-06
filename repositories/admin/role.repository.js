'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

async function list(search = '') {
  const where = {};
  if (search) where.name = { [Op.like]: `%${search}%` };

  return db.Role.findAll({
    where,
    attributes: {
      include: [[db.Sequelize.fn('COUNT', db.Sequelize.col('Users.id')), 'userCount']],
    },
    include: [{ model: db.User, attributes: [] }],
    group: ['Role.id'],
    order: [['name', 'ASC']],
  });
}

async function findById(id) {
  return db.Role.findByPk(id);
}

async function findByName(name, excludeId) {
  const where = { name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.Role.findOne({ where });
}

async function findByPrefix(prefix, excludeId) {
  const where = { prefix };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.Role.findOne({ where });
}

async function create(data) {
  return db.Role.create(data);
}

async function update(role, data) {
  return role.update(data);
}

async function destroy(role) {
  return role.destroy();
}

async function countUsers(roleId) {
  return db.User.count({ where: { role_id: roleId } });
}

async function allForSelect() {
  return db.Role.findAll({ order: [['name', 'ASC']] });
}

module.exports = {
  list,
  findById,
  findByName,
  findByPrefix,
  create,
  update,
  destroy,
  countUsers,
  allForSelect,
};
