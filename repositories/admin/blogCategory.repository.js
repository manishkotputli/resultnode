'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

async function list(search = '') {
  const where = {};
  if (search) where.name = { [Op.like]: `%${search}%` };

  return db.BlogCategory.findAll({
    where,
    attributes: {
      include: [[db.Sequelize.fn('COUNT', db.Sequelize.col('Blogs.id')), 'blogCount']],
    },
    include: [{ model: db.Blog, attributes: [] }],
    group: ['BlogCategory.id'],
    order: [['name', 'ASC']],
  });
}

async function findById(id) {
  return db.BlogCategory.findByPk(id);
}

async function findBySlug(slug, excludeId) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.BlogCategory.findOne({ where });
}

async function create(data) {
  return db.BlogCategory.create(data);
}

async function update(cat, data) {
  return cat.update(data);
}

async function destroy(cat) {
  return cat.destroy();
}

async function countBlogs(id) {
  return db.Blog.count({ where: { category_id: id } });
}

async function allForSelect() {
  return db.BlogCategory.findAll({ order: [['name', 'ASC']] });
}

module.exports = { list, findById, findBySlug, create, update, destroy, countBlogs, allForSelect };
