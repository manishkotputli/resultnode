'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const db = require('../../models');
const repo = require('../../repositories/admin/trackingReport.repository');

const FILTER_LABELS = {
  today: 'Today',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  this_month: 'This Month',
  previous_month: 'Previous Month',
  month: 'Month',
  year: 'Year',
  custom: 'Custom Range',
};

function resolveDateRange(query) {
  const filter = FILTER_LABELS[query.filter] ? query.filter : 'last_30_days';
  const now = moment();
  let from;
  let to;
  let label = FILTER_LABELS[filter];

  switch (filter) {
    case 'today':
      from = now.clone().startOf('day');
      to = now.clone().endOf('day');
      break;
    case 'last_7_days':
      from = now.clone().subtract(6, 'days').startOf('day');
      to = now.clone().endOf('day');
      break;
    case 'this_month':
      from = now.clone().startOf('month');
      to = now.clone().endOf('month');
      break;
    case 'previous_month':
      from = now.clone().subtract(1, 'month').startOf('month');
      to = now.clone().subtract(1, 'month').endOf('month');
      break;
    case 'month': {
      const year = parseInt(query.year, 10) || now.year();
      const monthNum = parseInt(query.month, 10) || now.month() + 1;
      const base = moment(`${year}-${monthNum}-01`, 'YYYY-M-D');
      from = base.clone().startOf('month');
      to = base.clone().endOf('month');
      label = base.format('MMMM YYYY');
      break;
    }
    case 'year': {
      const year = parseInt(query.year, 10) || now.year();
      from = moment(`${year}-01-01`, 'YYYY-MM-DD').startOf('day');
      to = moment(`${year}-12-31`, 'YYYY-MM-DD').endOf('day');
      label = String(year);
      break;
    }
    case 'custom': {
      from = query.from ? moment(query.from, 'YYYY-MM-DD').startOf('day') : now.clone().subtract(29, 'days').startOf('day');
      to = query.to ? moment(query.to, 'YYYY-MM-DD').endOf('day') : now.clone().endOf('day');
      if (to.isBefore(from)) to = from.clone().endOf('day');
      label = `${from.format('DD MMM YYYY')} - ${to.format('DD MMM YYYY')}`;
      break;
    }
    case 'last_30_days':
    default:
      from = now.clone().subtract(29, 'days').startOf('day');
      to = now.clone().endOf('day');
      break;
  }

  const durationDays = to.diff(from, 'days') + 1;
  const prevTo = from.clone().subtract(1, 'second');
  const prevFrom = prevTo.clone().subtract(durationDays - 1, 'days').startOf('day');

  return {
    filter,
    label,
    from: from.toDate(),
    to: to.toDate(),
    fromStr: from.format('YYYY-MM-DD'),
    toStr: to.format('YYYY-MM-DD'),
    prevFrom: prevFrom.toDate(),
    prevTo: prevTo.toDate(),
    prevFromStr: prevFrom.format('YYYY-MM-DD'),
    prevToStr: prevTo.format('YYYY-MM-DD'),
  };
}

function growthPercent(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) return c > 0 ? 100 : 0;
  return Math.round(((c - p) / p) * 10000) / 100;
}

function ctrPercent(clicks, views) {
  const c = Number(clicks) || 0;
  const v = Number(views) || 0;
  if (v === 0) return 0;
  return Math.round((c / v) * 10000) / 100;
}

function percentOfTotal(part, total) {
  const p = Number(part) || 0;
  const t = Number(total) || 0;
  if (t === 0) return 0;
  return Math.round((p / t) * 10000) / 100;
}

/* --------------------------- Site health / server info --------------------------- */

async function getSiteHealth() {
  let dbStatus = 'error';
  try {
    await db.sequelize.authenticate();
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'error';
  }

  let storageStatus = 'error';
  try {
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    storageStatus = 'writable';
  } catch (e) {
    storageStatus = 'error';
  }

  return {
    application: 'operational',
    database: dbStatus,
    // No cache layer (Redis/memory cache) exists in this project.
    cache: 'not_configured',
    storage: storageStatus,
    // No background job/queue system exists in this project.
    queue: 'not_configured',
    // Automated scraping cron (services/admin/scrapingScheduler.js) exists
    // but is opt-in — it is only started if wired into app.js, so its
    // live status can't be reliably reported from a request handler.
    cron: 'available_manual_trigger',
  };
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function getServerConfig() {
  const mem = process.memoryUsage();
  let disk = null;
  try {
    // fs.statfsSync is only available on Node 18.15+ and not on all platforms.
    const stat = fs.statfsSync(process.cwd());
    disk = {
      total: formatBytes(stat.blocks * stat.bsize),
      free: formatBytes(stat.bfree * stat.bsize),
    };
  } catch (e) {
    disk = { total: 'N/A', free: 'N/A' };
  }

  const uptimeSeconds = process.uptime();
  const uptimeHours = Math.floor(uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

  return {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    serverOs: `${os.type()} ${os.release()} (${os.arch()})`,
    memoryTotal: formatBytes(os.totalmem()),
    memoryFree: formatBytes(os.freemem()),
    heapUsed: formatBytes(mem.heapUsed),
    heapTotal: formatBytes(mem.heapTotal),
    uptime: `${uptimeHours}h ${uptimeMinutes}m`,
    diskTotal: disk.total,
    diskFree: disk.free,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/* --------------------------- Dashboard assembly --------------------------- */

async function getDashboardData(adminUserId, query) {
  const range = resolveDateRange(query);
  const { from, to, prevFrom, prevTo, fromStr, toStr, prevFromStr, prevToStr } = range;

  const [
    incomeExpense,
    incomeExpensePrev,
    incomeByCategory,
    expenseByCategory,
    topTransactions,
    incomeExpenseSeries,

    postsTotal,
    postViewClicks,
    postViewClicksPrev,
    topPostsByViews,
    topPostsByClicks,
    topPostsByLikes,
    categoryWisePosts,

    blogsTotals,
    topBlogsByViews,
    blogCategoryAnalytics,

    coursesTotals,
    testSeriesTotals,
    topCourses,
    topTestSeries,
    revenueBreakdown,

    usersTotals,
    usersTotalsPrev,
  ] = await Promise.all([
    repo.getIncomeExpenseTotals(adminUserId, fromStr, toStr),
    repo.getIncomeExpenseTotals(adminUserId, prevFromStr, prevToStr),
    repo.getIncomeExpenseByCategory(adminUserId, 1, fromStr, toStr),
    repo.getIncomeExpenseByCategory(adminUserId, 2, fromStr, toStr),
    repo.getTopTransactions(adminUserId, fromStr, toStr, 5),
    repo.getIncomeExpenseDailySeries(adminUserId, fromStr, toStr),

    repo.getPostsTotalCount(),
    repo.getPostViewClickTotals(from, to),
    repo.getPostViewClickTotals(prevFrom, prevTo),
    repo.getTopPostsByEvent('view', from, to, 5),
    repo.getTopPostsByEvent('click', from, to, 5),
    repo.getTopPostsByLikes(5),
    repo.getCategoryWisePostAnalytics(from, to),

    repo.getBlogsTotals(),
    repo.getTopBlogsByViews(5),
    repo.getBlogCategoryAnalytics(),

    repo.getCoursesTotals(),
    repo.getTestSeriesTotals(),
    repo.getTopCoursesByRevenue(from, to, 5),
    repo.getTopTestSeriesByRevenue(from, to, 5),
    repo.getRevenueBreakdown(from, to),

    repo.getUsersTotals(from, to),
    repo.getUsersTotals(prevFrom, prevTo),
  ]);

  const incomeTotalForPct = incomeByCategory.reduce((s, c) => s + c.total, 0);
  const expenseTotalForPct = expenseByCategory.reduce((s, c) => s + c.total, 0);

  const netIncome = incomeExpense.income - incomeExpense.expense;
  const netIncomePrev = incomeExpensePrev.income - incomeExpensePrev.expense;

  const siteHealth = await getSiteHealth();
  const serverConfig = getServerConfig();

  return {
    range,

    stats: {
      totalUsers: usersTotals.total,
      newUsers: usersTotals.newUsers,
      activeUsers: usersTotals.active,
      userGrowth: growthPercent(usersTotals.newUsers, usersTotalsPrev.newUsers),

      totalPosts: postsTotal,
      totalBlogs: blogsTotals.total,
      totalCourses: coursesTotals.total,
      totalTestSeries: testSeriesTotals.total,

      totalRevenue: revenueBreakdown.total,
      totalIncome: incomeExpense.income,
      totalExpense: incomeExpense.expense,
      netIncome,
      incomeGrowth: growthPercent(incomeExpense.income, incomeExpensePrev.income),
      expenseGrowth: growthPercent(incomeExpense.expense, incomeExpensePrev.expense),
      netIncomeGrowth: growthPercent(netIncome, netIncomePrev),
    },

    incomeExpense: {
      income: incomeExpense.income,
      expense: incomeExpense.expense,
      net: netIncome,
      series: incomeExpenseSeries,
      incomeByCategory: incomeByCategory.map((c) => ({ ...c, percentage: percentOfTotal(c.total, incomeTotalForPct) })),
      expenseByCategory: expenseByCategory.map((c) => ({ ...c, percentage: percentOfTotal(c.total, expenseTotalForPct) })),
      topTransactions,
    },

    posts: {
      total: postsTotal,
      views: postViewClicks.views,
      clicks: postViewClicks.clicks,
      ctr: ctrPercent(postViewClicks.clicks, postViewClicks.views),
      viewsGrowth: growthPercent(postViewClicks.views, postViewClicksPrev.views),
      clicksGrowth: growthPercent(postViewClicks.clicks, postViewClicksPrev.clicks),
      topByViews: topPostsByViews,
      topByClicks: topPostsByClicks,
      topByLikes: topPostsByLikes,
      byCategory: categoryWisePosts,
    },

    blogs: {
      total: blogsTotals.total,
      views: blogsTotals.views,
      likes: blogsTotals.likes,
      comments: blogsTotals.comments,
      topByViews: topBlogsByViews,
      byCategory: blogCategoryAnalytics,
    },

    courses: {
      total: coursesTotals.total,
      active: coursesTotals.active,
      revenue: revenueBreakdown.course,
      top: topCourses,
    },

    testSeries: {
      total: testSeriesTotals.total,
      active: testSeriesTotals.active,
      revenue: revenueBreakdown.testSeries,
      top: topTestSeries,
    },

    revenueBreakdown,

    users: {
      total: usersTotals.total,
      newUsers: usersTotals.newUsers,
      active: usersTotals.active,
      growth: growthPercent(usersTotals.newUsers, usersTotalsPrev.newUsers),
    },

    siteHealth,
    serverConfig,
  };
}

module.exports = { resolveDateRange, getDashboardData, growthPercent, ctrPercent };
