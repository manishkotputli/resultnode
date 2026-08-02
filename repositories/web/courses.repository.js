'use strict';
const { Op } = require('sequelize');
const db = require('../../models');

async function getActiveCourses() {
  return db.Course.findAll({ where: { is_active: true }, order: [['id', 'DESC']] });
}

async function findBySlug(slug) {
  return db.Course.findOne({ where: { slug, is_active: true } });
}

async function findAlreadyPurchased(userId, courseId) {
  return db.Purchase.findOne({
    where: { user_id: userId, purchasable_type: 'course', purchasable_id: courseId, payment_status: 'completed' },
  });
}

async function getPurchasedCourseIds(userId) {
  const rows = await db.Purchase.findAll({
    where: { user_id: userId, purchasable_type: 'course', payment_status: 'completed' },
    attributes: ['purchasable_id'],
  });
  return rows.map((r) => r.purchasable_id);
}

async function getSuggested(excludeIds, limit) {
  return db.Course.findAll({
    where: { is_active: true, id: { [Op.notIn]: excludeIds.length ? excludeIds : [0] } },
    order: [['id', 'DESC']],
    limit,
  });
}

module.exports = { getActiveCourses, findBySlug, findAlreadyPurchased, getPurchasedCourseIds, getSuggested };