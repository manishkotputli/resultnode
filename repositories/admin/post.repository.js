'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 15;

async function list({ page = 1, search = '', categorySlug = '', status = '' } = {}) {
  const where = {};
  if (search) {
    where.title = { [Op.like]: `%${search}%` };
  }
  if (status === 'active') where.status = true;
  if (status === 'inactive') where.status = false;

  const include = [{ model: db.Category, attributes: ['id', 'name', 'slug'] }];
  if (categorySlug) {
    include[0].where = { slug: categorySlug };
  }

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.Post.findAndCountAll({
    where,
    include,
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
    distinct: true,
  });

  return { rows, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.Post.findByPk(id, {
    include: [
      { model: db.Category },
      { model: db.PostLink, as: 'links', separate: true, order: [['order_no', 'ASC']] },
    ],
  });
}

async function findDynamicFields(postId) {
  return db.DynamicField.findAll({
    where: { table_name: 'post', record_id: postId },
    order: [['sort_order', 'ASC'], ['id', 'ASC']],
  });
}

async function create(data, t) {
  return db.Post.create(data, { transaction: t });
}

async function update(post, data, t) {
  return post.update(data, { transaction: t });
}

async function destroy(post, t) {
  await db.PostLink.destroy({ where: { post_id: post.id }, transaction: t });
  await db.DynamicField.destroy({ where: { table_name: 'post', record_id: post.id }, transaction: t });
  return post.destroy({ transaction: t });
}

async function replaceLinks(postId, links, t) {
  await db.PostLink.destroy({ where: { post_id: postId }, transaction: t });
  if (!links || !links.length) return;
  const rows = links.map((l, i) => ({
    post_id: postId,
    label: l.label,
    url: l.url,
    order_no: l.order_no != null ? l.order_no : i,
  }));
  await db.PostLink.bulkCreate(rows, { transaction: t });
}

async function replaceDynamicFields(postId, fields, t) {
  await db.DynamicField.destroy({ where: { table_name: 'post', record_id: postId }, transaction: t });
  if (!fields || !fields.length) return;
  const rows = fields.map((f, i) => ({
    table_name: 'post',
    record_id: postId,
    group_name: f.group_name || 'Details',
    field_label: f.field_label,
    field_type: f.field_type || 'text',
    field_value: f.field_value,
    sort_order: f.sort_order != null ? f.sort_order : i,
  }));
  await db.DynamicField.bulkCreate(rows, { transaction: t });
}

async function findBySlug(slug, excludeId) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.Post.findOne({ where });
}

module.exports = {
  list,
  findById,
  findDynamicFields,
  create,
  update,
  destroy,
  replaceLinks,
  replaceDynamicFields,
  findBySlug,
  PER_PAGE,
};
