'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

async function list(search = '') {
  const where = {};
  if (search) where.name = { [Op.like]: `%${search}%` };

  return db.Category.findAll({
    where,
    attributes: {
      include: [[db.Sequelize.fn('COUNT', db.Sequelize.col('Posts.id')), 'postCount']],
    },
    include: [{ model: db.Post, attributes: [] }],
    group: ['Category.id'],
    order: [['display_order', 'ASC'], ['name', 'ASC']],
  });
}

async function findById(id) {
  return db.Category.findByPk(id);
}

async function findBySlug(slug, excludeId) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.Category.findOne({ where });
}

async function create(data) {
  return db.Category.create(data);
}

async function update(category, data) {
  return category.update(data);
}

async function destroy(category) {
  return category.destroy();
}

async function countPosts(categoryId) {
  return db.Post.count({ where: { category_id: categoryId } });
}

module.exports = { list, findById, findBySlug, create, update, destroy, countPosts };
