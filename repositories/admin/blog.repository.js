'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 15;

async function list({ page = 1, search = '', categoryId = '', status = '' } = {}) {
  const where = {};
  if (search) where.title = { [Op.like]: `%${search}%` };
  if (categoryId) where.category_id = categoryId;
  if (status) where.status = status;

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.Blog.findAndCountAll({
    where,
    include: [{ model: db.BlogCategory, attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
    distinct: true,
  });

  return { rows, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.Blog.findByPk(id, { include: [{ model: db.BlogCategory }] });
}

async function findBySlug(slug, excludeId) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.Blog.findOne({ where });
}

async function create(data) {
  return db.Blog.create(data);
}

async function update(blog, data) {
  return blog.update(data);
}

async function destroy(blog) {
  return blog.destroy();
}

module.exports = { list, findById, findBySlug, create, update, destroy, PER_PAGE };
