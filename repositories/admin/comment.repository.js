'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 20;

async function list({ page = 1, type = '', status = '' } = {}) {
  const where = {};
  if (type) where.commentable_type = type;
  if (status === 'approved') where.is_approved = true;
  if (status === 'pending') where.is_approved = false;

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.Comment.findAndCountAll({
    where,
    include: [{ model: db.User, attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
  });

  // Resolve the polymorphic parent (Post or Blog) titles in two batch queries.
  const postIds = rows.filter((c) => c.commentable_type === 'post').map((c) => c.commentable_id);
  const blogIds = rows.filter((c) => c.commentable_type === 'blog').map((c) => c.commentable_id);

  const [posts, blogs] = await Promise.all([
    postIds.length ? db.Post.findAll({ where: { id: { [Op.in]: postIds } }, attributes: ['id', 'title', 'slug'] }) : [],
    blogIds.length ? db.Blog.findAll({ where: { id: { [Op.in]: blogIds } }, attributes: ['id', 'title', 'slug'] }) : [],
  ]);
  const postMap = new Map(posts.map((p) => [p.id, p]));
  const blogMap = new Map(blogs.map((b) => [b.id, b]));

  const decorated = rows.map((c) => {
    const plain = c.get({ plain: true });
    plain.parent = c.commentable_type === 'post' ? postMap.get(c.commentable_id) : blogMap.get(c.commentable_id);
    return plain;
  });

  return { rows: decorated, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.Comment.findByPk(id);
}

async function destroy(comment) {
  await db.Comment.destroy({ where: { parent_id: comment.id } });
  return comment.destroy();
}

module.exports = { list, findById, destroy, PER_PAGE };
