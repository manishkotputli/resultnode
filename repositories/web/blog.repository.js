'use strict';
const { Op } = require('sequelize');
const db = require('../../models');

async function getPublishedBlogs(limit) {
  return db.Blog.findAll({
    where: { status: 'published' },
    include: [{ model: db.BlogCategory }],
    order: [['published_at', 'DESC']],
    limit,
  });
}

async function findBlogBySlug(slug) {
  return db.Blog.findOne({
    where: { slug, status: 'published' },
    include: [{ model: db.BlogCategory }, { model: db.User, as: 'author' }],
  });
}

async function getRelatedBlogs(categoryId, excludeId, limit = 6) {
  return db.Blog.findAll({
    where: { category_id: categoryId, status: 'published', id: { [Op.ne]: excludeId } },
    order: [['published_at', 'DESC']],
    limit,
  });
}

async function incrementBlogViews(blogId) {
  return db.Blog.increment('views', { by: 1, where: { id: blogId } });
}

async function getApprovedComments(blogId) {
  return db.Comment.findAll({
    where: { commentable_type: 'blog', commentable_id: blogId, is_approved: true, parent_id: null },
    include: [{ model: db.User, attributes: ['id', 'name', 'profile_photo'] }],
    order: [['created_at', 'DESC']],
  });
}

async function addComment({ blogId, userId, content }) {
  const comment = await db.Comment.create({
    commentable_type: 'blog', commentable_id: blogId, user_id: userId, content,
  });
  await db.Blog.increment('comments_count', { by: 1, where: { id: blogId } });
  return comment;
}

async function toggleLike({ blogId, userId }) {
  const existing = await db.Like.findOne({ where: { likeable_type: 'blog', likeable_id: blogId, user_id: userId } });
  if (existing) {
    await existing.destroy();
    await db.Blog.decrement('likes_count', { by: 1, where: { id: blogId } });
    return { liked: false };
  }
  await db.Like.create({ likeable_type: 'blog', likeable_id: blogId, user_id: userId });
  await db.Blog.increment('likes_count', { by: 1, where: { id: blogId } });
  return { liked: true };
}

async function hasLiked(blogId, userId) {
  if (!userId) return false;
  const existing = await db.Like.findOne({ where: { likeable_type: 'blog', likeable_id: blogId, user_id: userId } });
  return !!existing;
}

module.exports = {
  getPublishedBlogs, findBlogBySlug, getRelatedBlogs, incrementBlogViews,
  getApprovedComments, addComment, toggleLike, hasLiked,
};
