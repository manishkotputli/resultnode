'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

/* ---------------------------------------------------------------------- *
 * Income / Expense — ALWAYS scoped to a single user_id (the logged-in
 * admin's own transactions). Never accept a user_id from the request.
 * ---------------------------------------------------------------------- */

async function getIncomeExpenseTotals(userId, from, to) {
  const [income, expense] = await Promise.all([
    db.IncomeExpense.sum('amount', {
      where: { user_id: userId, type: 1, transaction_date: { [Op.between]: [from, to] } },
    }),
    db.IncomeExpense.sum('amount', {
      where: { user_id: userId, type: 2, transaction_date: { [Op.between]: [from, to] } },
    }),
  ]);
  return { income: income || 0, expense: expense || 0 };
}

async function getIncomeExpenseByCategory(userId, type, from, to) {
  const rows = await db.IncomeExpense.findAll({
    where: { user_id: userId, type, transaction_date: { [Op.between]: [from, to] } },
    attributes: [
      'category_id',
      [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'total'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('IncomeExpense.id')), 'txn_count'],
    ],
    include: [{ model: db.IncomeExpenseCategory, attributes: ['name'] }],
    group: ['category_id', 'IncomeExpenseCategory.id'],
    order: [[db.Sequelize.literal('total'), 'DESC']],
  });
  return rows.map((r) => ({
    category_id: r.category_id,
    name: r.IncomeExpenseCategory ? r.IncomeExpenseCategory.name : 'Uncategorized',
    total: parseFloat(r.get('total')) || 0,
    txn_count: parseInt(r.get('txn_count'), 10) || 0,
  }));
}

// "Top transactions" = most recent within the selected period (own transactions only).
async function getTopTransactions(userId, from, to, limit = 5) {
  const rows = await db.IncomeExpense.findAll({
    where: { user_id: userId, transaction_date: { [Op.between]: [from, to] } },
    include: [{ model: db.IncomeExpenseCategory, attributes: ['name'] }],
    order: [['transaction_date', 'DESC'], ['id', 'DESC']],
    limit,
  });
  return rows.map((r) => ({
    type: r.type === 1 ? 'Income' : 'Expense',
    category: r.IncomeExpenseCategory ? r.IncomeExpenseCategory.name : 'Uncategorized',
    description: r.title,
    amount: parseFloat(r.amount),
    date: r.transaction_date,
  }));
}

async function getIncomeExpenseDailySeries(userId, from, to) {
  const rows = await db.IncomeExpense.findAll({
    where: { user_id: userId, transaction_date: { [Op.between]: [from, to] } },
    attributes: [
      'transaction_date',
      'type',
      [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'total'],
    ],
    group: ['transaction_date', 'type'],
    raw: true,
  });
  return rows.map((r) => ({
    date: r.transaction_date,
    type: r.type === 1 ? 'income' : 'expense',
    total: parseFloat(r.total) || 0,
  }));
}

/* ---------------------------------------------------------------------- *
 * Posts — Post.views_count/clicks_count are lifetime counters. For a
 * date-scoped period we use the granular PostView log (event_type
 * 'view'|'click'), which is exactly what that table exists for. There is
 * no "impressions" or "shares" tracking anywhere in the schema, so those
 * are intentionally NOT included here (no fake data).
 * ---------------------------------------------------------------------- */

async function getPostsTotalCount() {
  return db.Post.count();
}

async function getPostViewClickTotals(from, to) {
  const rows = await db.PostView.findAll({
    where: { trackable_type: 'post', created_at: { [Op.between]: [from, to] } },
    attributes: ['event_type', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'cnt']],
    group: ['event_type'],
    raw: true,
  });
  const out = { views: 0, clicks: 0 };
  rows.forEach((r) => {
    if (r.event_type === 'view') out.views = parseInt(r.cnt, 10);
    if (r.event_type === 'click') out.clicks = parseInt(r.cnt, 10);
  });
  return out;
}

async function getTopPostsByEvent(eventType, from, to, limit = 5) {
  const rows = await db.PostView.findAll({
    where: { trackable_type: 'post', event_type: eventType, created_at: { [Op.between]: [from, to] } },
    attributes: ['trackable_id', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'cnt']],
    group: ['trackable_id'],
    order: [[db.Sequelize.literal('cnt'), 'DESC']],
    limit,
    raw: true,
  });
  if (!rows.length) return [];
  const postIds = rows.map((r) => r.trackable_id);
  const posts = await db.Post.findAll({ where: { id: { [Op.in]: postIds } }, attributes: ['id', 'title', 'slug'] });
  const postMap = new Map(posts.map((p) => [p.id, p]));
  return rows
    .map((r) => ({ post: postMap.get(r.trackable_id), count: parseInt(r.cnt, 10) }))
    .filter((r) => r.post);
}

async function getTopPostsByLikes(limit = 5) {
  const rows = await db.Like.findAll({
    where: { likeable_type: 'post' },
    attributes: ['likeable_id', [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'cnt']],
    group: ['likeable_id'],
    order: [[db.Sequelize.literal('cnt'), 'DESC']],
    limit,
    raw: true,
  });
  if (!rows.length) return [];
  const postIds = rows.map((r) => r.likeable_id);
  const posts = await db.Post.findAll({ where: { id: { [Op.in]: postIds } }, attributes: ['id', 'title', 'slug'] });
  const postMap = new Map(posts.map((p) => [p.id, p]));
  return rows
    .map((r) => ({ post: postMap.get(r.likeable_id), count: parseInt(r.cnt, 10) }))
    .filter((r) => r.post);
}

async function getCategoryWisePostAnalytics(from, to) {
  const [categories, viewRows, clickRows] = await Promise.all([
    db.Category.findAll({
      attributes: {
        include: [[db.Sequelize.fn('COUNT', db.Sequelize.col('Posts.id')), 'postCount']],
      },
      include: [{ model: db.Post, attributes: [] }],
      group: ['Category.id'],
      order: [['display_order', 'ASC']],
    }),
    db.PostView.findAll({
      where: { trackable_type: 'post', event_type: 'view', created_at: { [Op.between]: [from, to] } },
      attributes: ['trackable_id'],
      raw: true,
    }),
    db.PostView.findAll({
      where: { trackable_type: 'post', event_type: 'click', created_at: { [Op.between]: [from, to] } },
      attributes: ['trackable_id'],
      raw: true,
    }),
  ]);

  const postIds = [...new Set([...viewRows.map((r) => r.trackable_id), ...clickRows.map((r) => r.trackable_id)])];
  const posts = postIds.length
    ? await db.Post.findAll({ where: { id: { [Op.in]: postIds } }, attributes: ['id', 'category_id'] })
    : [];
  const postCategoryMap = new Map(posts.map((p) => [p.id, p.category_id]));

  const viewsByCategory = new Map();
  const clicksByCategory = new Map();
  viewRows.forEach((r) => {
    const catId = postCategoryMap.get(r.trackable_id);
    if (catId) viewsByCategory.set(catId, (viewsByCategory.get(catId) || 0) + 1);
  });
  clickRows.forEach((r) => {
    const catId = postCategoryMap.get(r.trackable_id);
    if (catId) clicksByCategory.set(catId, (clicksByCategory.get(catId) || 0) + 1);
  });

  return categories.map((cat) => {
    const views = viewsByCategory.get(cat.id) || 0;
    const clicks = clicksByCategory.get(cat.id) || 0;
    return {
      id: cat.id,
      name: cat.name,
      postCount: parseInt(cat.get('postCount'), 10) || 0,
      views,
      clicks,
      ctr: views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0,
    };
  });
}

/* ---------------------------------------------------------------------- *
 * Blogs — views/likes_count/comments_count are lifetime counters (no
 * per-day log exists for blogs the way PostView exists for posts), so
 * these are shown as all-time totals regardless of the date filter.
 * There is no "impressions" or "shares" field on Blog, so those are
 * intentionally omitted (no fake data).
 * ---------------------------------------------------------------------- */

async function getBlogsTotals() {
  const row = await db.Blog.findOne({
    attributes: [
      [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'total'],
      [db.Sequelize.fn('SUM', db.Sequelize.col('views')), 'views'],
      [db.Sequelize.fn('SUM', db.Sequelize.col('likes_count')), 'likes'],
      [db.Sequelize.fn('SUM', db.Sequelize.col('comments_count')), 'comments'],
    ],
    where: { status: 'published' },
    raw: true,
  });
  return {
    total: parseInt(row.total, 10) || 0,
    views: parseInt(row.views, 10) || 0,
    likes: parseInt(row.likes, 10) || 0,
    comments: parseInt(row.comments, 10) || 0,
  };
}

async function getTopBlogsByViews(limit = 5) {
  return db.Blog.findAll({
    where: { status: 'published' },
    order: [['views', 'DESC']],
    limit,
    attributes: ['id', 'title', 'slug', 'views', 'likes_count', 'comments_count'],
  });
}

async function getBlogCategoryAnalytics() {
  const rows = await db.BlogCategory.findAll({
    attributes: {
      include: [
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Blogs.id')), 'blogCount'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('Blogs.views')), 'views'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('Blogs.likes_count')), 'likes'],
      ],
    },
    include: [{ model: db.Blog, attributes: [], where: { status: 'published' }, required: false }],
    group: ['BlogCategory.id'],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    blogCount: parseInt(r.get('blogCount'), 10) || 0,
    views: parseInt(r.get('views'), 10) || 0,
    likes: parseInt(r.get('likes'), 10) || 0,
  }));
}

/* ---------------------------------------------------------------------- *
 * Courses / Test Series — no "views" or "attempts" field/table exists for
 * either, so those are intentionally NOT included (no fake data).
 * Enrollments + revenue come from the Purchase table (payment_status
 * 'completed'), the same convention used by the student dashboard.
 * ---------------------------------------------------------------------- */

async function getCoursesTotals() {
  const [total, active] = await Promise.all([
    db.Course.count(),
    db.Course.count({ where: { is_active: true } }),
  ]);
  return { total, active };
}

async function getTestSeriesTotals() {
  const [total, active] = await Promise.all([
    db.TestSeries.count(),
    db.TestSeries.count({ where: { is_active: true } }),
  ]);
  return { total, active };
}

async function getPurchaseTotalsByType(purchasableType, from, to) {
  const rows = await db.Purchase.findAll({
    where: {
      purchasable_type: purchasableType,
      payment_status: 'completed',
      purchased_at: { [Op.between]: [from, to] },
    },
    attributes: [
      'purchasable_id',
      [db.Sequelize.fn('SUM', db.Sequelize.col('amount')), 'revenue'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'enrollments'],
    ],
    group: ['purchasable_id'],
    raw: true,
  });
  return rows.map((r) => ({
    purchasable_id: r.purchasable_id,
    revenue: parseFloat(r.revenue) || 0,
    enrollments: parseInt(r.enrollments, 10) || 0,
  }));
}

async function getTopCoursesByRevenue(from, to, limit = 5) {
  const rows = await getPurchaseTotalsByType('course', from, to);
  rows.sort((a, b) => b.revenue - a.revenue);
  const top = rows.slice(0, limit);
  if (!top.length) return [];
  const courses = await db.Course.findAll({
    where: { id: { [Op.in]: top.map((r) => r.purchasable_id) } },
    attributes: ['id', 'title', 'slug'],
  });
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  return top.map((r) => ({ course: courseMap.get(r.purchasable_id), revenue: r.revenue, enrollments: r.enrollments })).filter((r) => r.course);
}

async function getTopTestSeriesByRevenue(from, to, limit = 5) {
  const rows = await getPurchaseTotalsByType('test_series', from, to);
  rows.sort((a, b) => b.revenue - a.revenue);
  const top = rows.slice(0, limit);
  if (!top.length) return [];
  const items = await db.TestSeries.findAll({
    where: { id: { [Op.in]: top.map((r) => r.purchasable_id) } },
    attributes: ['id', 'title', 'slug'],
  });
  const itemMap = new Map(items.map((c) => [c.id, c]));
  return top.map((r) => ({ testSeries: itemMap.get(r.purchasable_id), revenue: r.revenue, enrollments: r.enrollments })).filter((r) => r.testSeries);
}

async function getRevenueBreakdown(from, to) {
  const where = (type) => ({
    purchasable_type: type,
    payment_status: 'completed',
    purchased_at: { [Op.between]: [from, to] },
  });
  const [courseRevenue, testSeriesRevenue, totalPurchases] = await Promise.all([
    db.Purchase.sum('amount', { where: where('course') }),
    db.Purchase.sum('amount', { where: where('test_series') }),
    db.Purchase.sum('amount', {
      where: { payment_status: 'completed', purchased_at: { [Op.between]: [from, to] } },
    }),
  ]);
  const course = courseRevenue || 0;
  const testSeries = testSeriesRevenue || 0;
  const total = totalPurchases || 0;
  // "Other" = any purchase type outside course/test_series (schema only
  // defines these two today, so this will normally be 0 — kept for
  // structural completeness rather than assumed to always be zero).
  const other = Math.max(0, total - course - testSeries);
  return { course, testSeries, other, total };
}

/* ---------------------------------------------------------------------- *
 * Users
 * ---------------------------------------------------------------------- */

async function getUsersTotals(from, to) {
  const [total, newUsers, active] = await Promise.all([
    db.User.count(),
    db.User.count({ where: { created_at: { [Op.between]: [from, to] } } }),
    db.User.count({ where: { is_active: true } }),
  ]);
  return { total, newUsers, active };
}

module.exports = {
  getIncomeExpenseTotals,
  getIncomeExpenseByCategory,
  getTopTransactions,
  getIncomeExpenseDailySeries,
  getPostsTotalCount,
  getPostViewClickTotals,
  getTopPostsByEvent,
  getTopPostsByLikes,
  getCategoryWisePostAnalytics,
  getBlogsTotals,
  getTopBlogsByViews,
  getBlogCategoryAnalytics,
  getCoursesTotals,
  getTestSeriesTotals,
  getTopCoursesByRevenue,
  getTopTestSeriesByRevenue,
  getRevenueBreakdown,
  getUsersTotals,
};
