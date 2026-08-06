'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 20;

async function list({ search = '', type = '', status = '', userId = '', page = 1, perPage = PER_PAGE } = {}) {
  const where = {};
  if (type) where.purchasable_type = type;
  if (status) where.payment_status = status;
  if (userId) where.user_id = Number(userId);
  if (search) where.order_id = { [Op.like]: `%${search}%` };

  const offset = (page - 1) * perPage;
  const { rows, count } = await db.Purchase.findAndCountAll({
    where,
    include: [{ model: db.User, attributes: ['id', 'name', 'email'] }],
    order: [['created_at', 'DESC']],
    limit: perPage,
    offset,
  });

  const purchases = await attachTitles(rows.map((r) => r.get({ plain: true })));
  return { purchases, total: count };
}

async function findById(id) {
  const purchase = await db.Purchase.findByPk(id, {
    include: [{ model: db.User, attributes: ['id', 'name', 'email'] }],
  });
  if (!purchase) return null;
  const [withTitle] = await attachTitles([purchase.get({ plain: true })]);
  return withTitle;
}

// Purchasable is polymorphic (purchasable_type + purchasable_id, no real FK),
// so resolve the item title/slug with a couple of batched lookups.
async function attachTitles(purchases) {
  const courseIds = purchases.filter((p) => p.purchasable_type === 'course').map((p) => p.purchasable_id);
  const seriesIds = purchases.filter((p) => p.purchasable_type === 'test_series').map((p) => p.purchasable_id);
  const [courses, series] = await Promise.all([
    courseIds.length ? db.Course.findAll({ where: { id: courseIds } }) : [],
    seriesIds.length ? db.TestSeries.findAll({ where: { id: seriesIds } }) : [],
  ]);
  return purchases.map((p) => {
    const source = p.purchasable_type === 'course' ? courses : series;
    const match = source.find((s) => s.id === p.purchasable_id);
    return {
      ...p,
      itemTitle: match ? match.title : `${p.purchasable_type === 'course' ? 'Course' : 'Test Series'} #${p.purchasable_id}`,
    };
  });
}

async function updateStatus(purchase, status) {
  return purchase.update({ payment_status: status });
}

async function usersForFilter() {
  return db.User.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
}

async function getStats() {
  const totalRevenue = await db.Purchase.sum('amount', { where: { payment_status: 'completed' } });
  const totalOrders = await db.Purchase.count();
  const completedOrders = await db.Purchase.count({ where: { payment_status: 'completed' } });
  const refundedOrders = await db.Purchase.count({ where: { payment_status: 'refunded' } });
  return { totalRevenue: totalRevenue || 0, totalOrders, completedOrders, refundedOrders };
}

module.exports = { list, findById, updateStatus, usersForFilter, getStats, PER_PAGE };
