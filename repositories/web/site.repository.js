'use strict';
const { Op } = require('sequelize');
const db = require('../../models');

async function getMarqueePosts() {
  return db.Post.findAll({
    where: { is_marquee: true, status: true },
    include: [{ model: db.Category }],
    order: [['post_date', 'DESC']],
  });
}

async function getTopPosts() {
  return db.Post.findAll({
    where: { is_top: true, status: true },
    order: [['post_date', 'DESC']],
    limit: 12,
  });
}

async function getHomeSections() {
  return db.HomeSection.findAll({
    where: { status: true },
    include: [{ model: db.Category }],
    order: [['ordering', 'ASC']],
  });
}

async function getPostsByCategoryId(categoryId, limit) {
  return db.Post.findAll({
    where: { category_id: categoryId, status: true },
    order: [['post_date', 'DESC'], ['id', 'DESC']],
    limit,
  });
}

async function findCategoryBySlug(slug) {
  return db.Category.findOne({ where: { slug } });
}

async function getPostsByCategoryPaginated(categoryId, page, perPage) {
  return db.Post.findAndCountAll({
    where: { category_id: categoryId, status: true },
    order: [['post_date', 'DESC'], ['id', 'DESC']],
    limit: perPage,
    offset: (page - 1) * perPage,
  });
}

async function getFaqsByCategoryOrGlobal(categoryId) {
  const scoped = await db.Faq.findAll({
    where: { category_id: categoryId, status: true },
    include: [{ model: db.FaqAnswer, as: 'answers' }],
    order: [['ordering', 'ASC']],
  });
  if (scoped.length) return scoped;
  return db.Faq.findAll({
    where: { category_id: null, status: true },
    include: [{ model: db.FaqAnswer, as: 'answers' }],
    order: [['ordering', 'ASC']],
  });
}

async function findPostBySlug(slug) {
  return db.Post.findOne({
    where: { slug },
    include: [
      { model: db.Category },
      { model: db.PostLink, as: 'links', separate: true, order: [['order_no', 'ASC']] },
      { model: db.DynamicField, as: 'fields', separate: true, order: [['sort_order', 'ASC']] },
    ],
  });
}

async function getRelatedPosts(categoryId, excludeId, limit = 10) {
  return db.Post.findAll({
    where: { category_id: categoryId, status: true, id: { [Op.ne]: excludeId } },
    order: [['post_date', 'DESC']],
    limit,
  });
}

async function incrementPostViews(postId) {
  return db.Post.increment('views_count', { by: 1, where: { id: postId } });
}

async function incrementPostClicks(postId) {
  return db.Post.increment('clicks_count', { by: 1, where: { id: postId } });
}

async function logEvent({ trackableType, trackableId, eventType, userId, ip, userAgent, referrer }) {
  return db.PostView.create({
    trackable_type: trackableType,
    trackable_id: trackableId,
    event_type: eventType,
    user_id: userId || null,
    ip_address: ip,
    user_agent: userAgent,
    referrer_url: referrer,
  });
}

async function getActiveBanners() {
  return db.Banner.findAll({
    where: { status: true },
    order: [['id', 'DESC']], // optional ordering
  });
}

module.exports = {
  getMarqueePosts,
  getTopPosts,
  getHomeSections,
  getPostsByCategoryId,
  findCategoryBySlug,
  getPostsByCategoryPaginated,
  getFaqsByCategoryOrGlobal,
  findPostBySlug,
  getRelatedPosts,
  incrementPostViews,
  incrementPostClicks,
  logEvent,
  getActiveBanners,
};
