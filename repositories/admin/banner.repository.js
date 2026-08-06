'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

async function list(search = '') {
  const where = {};
  if (search) where.text = { [Op.like]: `%${search}%` };
  return db.Banner.findAll({ where, order: [['id', 'DESC']] });
}

async function findById(id) {
  return db.Banner.findByPk(id);
}

async function create(data) {
  return db.Banner.create(data);
}

async function update(banner, data) {
  return banner.update(data);
}

async function destroy(banner) {
  return banner.destroy();
}

module.exports = { list, findById, create, update, destroy };
