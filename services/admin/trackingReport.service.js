'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const repo = require('../../repositories/admin/trackingReport.repository');

/* ==========================================================================
 * Filter labels
 * ========================================================================== */

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

/* ==========================================================================
 * Date helpers
 * ========================================================================== */

function isValidDate(value) {
  return moment.isMoment(value) && value.isValid();
}

function resolveDateRange(query = {}) {
  const requestedFilter =
    typeof query.filter === 'string'
      ? query.filter
      : 'last_30_days';

  const filter =
    Object.prototype.hasOwnProperty.call(
      FILTER_LABELS,
      requestedFilter
    )
      ? requestedFilter
      : 'last_30_days';

  const now = moment();

  let from;
  let to;
  let label =
    FILTER_LABELS[filter];

  switch (filter) {
    case 'today': {
      from = now.clone().startOf('day');
      to = now.clone().endOf('day');
      break;
    }

    case 'last_7_days': {
      from = now
        .clone()
        .subtract(6, 'days')
        .startOf('day');

      to = now.clone().endOf('day');

      break;
    }

    case 'last_30_days': {
      from = now
        .clone()
        .subtract(29, 'days')
        .startOf('day');

      to = now.clone().endOf('day');

      break;
    }

    case 'this_month': {
      from = now.clone().startOf('month');
      to = now.clone().endOf('month');

      break;
    }

    case 'previous_month': {
      const previousMonth =
        now.clone().subtract(1, 'month');

      from =
        previousMonth
          .clone()
          .startOf('month');

      to =
        previousMonth
          .clone()
          .endOf('month');

      break;
    }

    case 'month': {
      const year = Number.parseInt(
        query.year,
        10
      ) || now.year();

      let month = Number.parseInt(
        query.month,
        10
      );

      if (
        !Number.isInteger(month) ||
        month < 1 ||
        month > 12
      ) {
        month = now.month() + 1;
      }

      const base = moment({
        year,
        month: month - 1,
        day: 1,
      });

      if (!base.isValid()) {
        from =
          now
            .clone()
            .subtract(29, 'days')
            .startOf('day');

        to =
          now
            .clone()
            .endOf('day');

        label =
          FILTER_LABELS.last_30_days;
      } else {
        from =
          base
            .clone()
            .startOf('month');

        to =
          base
            .clone()
            .endOf('month');

        label =
          base.format('MMMM YYYY');
      }

      break;
    }

    case 'year': {
      const year = Number.parseInt(
        query.year,
        10
      ) || now.year();

      from = moment({
        year,
        month: 0,
        day: 1,
      }).startOf('day');

      to = moment({
        year,
        month: 11,
        day: 31,
      }).endOf('day');

      label = String(year);

      break;
    }

    case 'custom': {
      const customFrom =
        typeof query.from === 'string'
          ? moment(
              query.from,
              'YYYY-MM-DD',
              true
            )
          : null;

      const customTo =
        typeof query.to === 'string'
          ? moment(
              query.to,
              'YYYY-MM-DD',
              true
            )
          : null;

      from =
        customFrom &&
        isValidDate(customFrom)
          ? customFrom.startOf('day')
          : now
              .clone()
              .subtract(29, 'days')
              .startOf('day');

      to =
        customTo &&
        isValidDate(customTo)
          ? customTo.endOf('day')
          : now.clone().endOf('day');

      if (to.isBefore(from)) {
        to = from.clone().endOf('day');
      }

      label =
        `${from.format('DD MMM YYYY')} - ${to.format(
          'DD MMM YYYY'
        )}`;

      break;
    }

    default: {
      from =
        now
          .clone()
          .subtract(29, 'days')
          .startOf('day');

      to =
        now
          .clone()
          .endOf('day');

      label =
        FILTER_LABELS.last_30_days;

      break;
    }
  }

  /*
   * Number of calendar days in the selected range.
   */
  const durationDays =
    Math.max(
      1,
      to.diff(from, 'days') + 1
    );

  /*
   * Previous period has exactly the same duration.
   */
  const prevTo =
    from
      .clone()
      .subtract(1, 'millisecond');

  const prevFrom =
    prevTo
      .clone()
      .subtract(
        durationDays - 1,
        'days'
      )
      .startOf('day');

  return {
    filter,
    label,

    from: from.toDate(),
    to: to.toDate(),

    fromStr:
      from.format('YYYY-MM-DD'),

    toStr:
      to.format('YYYY-MM-DD'),

    prevFrom:
      prevFrom.toDate(),

    prevTo:
      prevTo.toDate(),

    prevFromStr:
      prevFrom.format('YYYY-MM-DD'),

    prevToStr:
      prevTo.format('YYYY-MM-DD'),
  };
}

/* ==========================================================================
 * Percentage helpers
 * ========================================================================== */

function growthPercent(
  current,
  previous
) {
  const currentValue =
    Number(current) || 0;

  const previousValue =
    Number(previous) || 0;

  if (previousValue === 0) {
    return currentValue > 0
      ? 100
      : 0;
  }

  return Math.round(
    (
      (
        currentValue -
        previousValue
      ) /
      previousValue
    ) *
      10000
  ) / 100;
}

function ctrPercent(
  clicks,
  views
) {
  const clickValue =
    Number(clicks) || 0;

  const viewValue =
    Number(views) || 0;

  if (viewValue === 0) {
    return 0;
  }

  return Math.round(
    (clickValue / viewValue) *
      10000
  ) / 100;
}

function percentOfTotal(
  part,
  total
) {
  const partValue =
    Number(part) || 0;

  const totalValue =
    Number(total) || 0;

  if (totalValue === 0) {
    return 0;
  }

  return Math.round(
    (partValue / totalValue) *
      10000
  ) / 100;
}

/* ==========================================================================
 * Site health
 * ========================================================================== */

function getSiteHealth() {
  let storageStatus = 'error';

  try {
    const uploadsDir =
      path.join(
        __dirname,
        '..',
        '..',
        'public',
        'uploads'
      );

    fs.accessSync(
      uploadsDir,
      fs.constants.W_OK
    );

    storageStatus = 'writable';
  } catch (error) {
    storageStatus = 'error';
  }

  return {
    application: 'operational',

    /*
     * Do not claim database connected here.
     * The dashboard itself has already successfully queried
     * the database when this function is reached.
     */
    database: 'connected',

    cache: 'not_configured',

    storage: storageStatus,

    queue: 'not_configured',

    cron: 'available_manual_trigger',
  };
}

/* ==========================================================================
 * Dashboard
 * ========================================================================== */

/**
 * IMPORTANT:
 *
 * Queries are intentionally executed in small sequential groups.
 *
 * The old implementation started ~23 repository operations at once.
 * Several repository methods also started multiple queries with
 * Promise.all(), creating a large connection burst.
 *
 * This implementation keeps DB connection pressure low.
 */
async function getDashboardData(
  adminUserId,
  query = {}
) {
  if (!adminUserId) {
    throw new Error(
      'Admin user session is required.'
    );
  }

  const range =
    resolveDateRange(query);

  const {
    from,
    to,
    prevFrom,
    prevTo,
  } = range;

  /*
   * ========================================================================
   * Income / Expense
   * ========================================================================
   */

  const incomeExpense =
    await repo.getIncomeExpenseTotals(
      adminUserId,
      from,
      to
    );

  const incomeExpensePrev =
    await repo.getIncomeExpenseTotals(
      adminUserId,
      prevFrom,
      prevTo
    );

  const incomeByCategory =
    await repo.getIncomeExpenseByCategory(
      adminUserId,
      1,
      from,
      to
    );

  const expenseByCategory =
    await repo.getIncomeExpenseByCategory(
      adminUserId,
      2,
      from,
      to
    );

  const topTransactions =
    await repo.getTopTransactions(
      adminUserId,
      from,
      to,
      5
    );

  const incomeExpenseSeries =
    await repo.getIncomeExpenseDailySeries(
      adminUserId,
      from,
      to
    );

  /*
   * ========================================================================
   * Posts
   * ========================================================================
   */

  const postsTotal =
    await repo.getPostsTotalCount();

  const postViewClicks =
    await repo.getPostViewClickTotals(
      from,
      to
    );

  const postViewClicksPrev =
    await repo.getPostViewClickTotals(
      prevFrom,
      prevTo
    );

  const topPostsByViews =
    await repo.getTopPostsByEvent(
      'view',
      from,
      to,
      5
    );

  const topPostsByClicks =
    await repo.getTopPostsByEvent(
      'click',
      from,
      to,
      5
    );

  const topPostsByLikes =
    await repo.getTopPostsByLikes(5);

  const categoryWisePosts =
    await repo.getCategoryWisePostAnalytics(
      from,
      to
    );

  /*
   * ========================================================================
   * Blogs
   * ========================================================================
   */

  const blogsTotals =
    await repo.getBlogsTotals();

  const topBlogsByViews =
    await repo.getTopBlogsByViews(5);

  const blogCategoryAnalytics =
    await repo.getBlogCategoryAnalytics();

  /*
   * ========================================================================
   * Courses / Test Series
   * ========================================================================
   */

  const coursesTotals =
    await repo.getCoursesTotals();

  const testSeriesTotals =
    await repo.getTestSeriesTotals();

  const topCourses =
    await repo.getTopCoursesByRevenue(
      from,
      to,
      5
    );

  const topTestSeries =
    await repo.getTopTestSeriesByRevenue(
      from,
      to,
      5
    );

  const revenueBreakdown =
    await repo.getRevenueBreakdown(
      from,
      to
    );

  /*
   * ========================================================================
   * Users
   * ========================================================================
   */

  const usersTotals =
    await repo.getUsersTotals(
      from,
      to
    );

  const usersTotalsPrev =
    await repo.getUsersTotals(
      prevFrom,
      prevTo
    );

  /*
   * ========================================================================
   * Calculations
   * ========================================================================
   */

  const incomeTotalForPct =
    incomeByCategory.reduce(
      (sum, category) =>
        sum +
        (
          Number(category.total) ||
          0
        ),
      0
    );

  const expenseTotalForPct =
    expenseByCategory.reduce(
      (sum, category) =>
        sum +
        (
          Number(category.total) ||
          0
        ),
      0
    );

  const netIncome =
    (
      Number(incomeExpense.income) ||
      0
    ) -
    (
      Number(incomeExpense.expense) ||
      0
    );

  const netIncomePrev =
    (
      Number(
        incomeExpensePrev.income
      ) || 0
    ) -
    (
      Number(
        incomeExpensePrev.expense
      ) || 0
    );

  const siteHealth =
    getSiteHealth();

  /*
   * ========================================================================
   * Final response
   * ========================================================================
   */

  return {
    range,

    stats: {
      totalUsers:
        usersTotals.total,

      newUsers:
        usersTotals.newUsers,

      activeUsers:
        usersTotals.active,

      userGrowth:
        growthPercent(
          usersTotals.newUsers,
          usersTotalsPrev.newUsers
        ),

      totalPosts:
        postsTotal,

      totalBlogs:
        blogsTotals.total,

      totalCourses:
        coursesTotals.total,

      totalTestSeries:
        testSeriesTotals.total,

      totalRevenue:
        revenueBreakdown.total,

      totalIncome:
        incomeExpense.income,

      totalExpense:
        incomeExpense.expense,

      netIncome,

      incomeGrowth:
        growthPercent(
          incomeExpense.income,
          incomeExpensePrev.income
        ),

      expenseGrowth:
        growthPercent(
          incomeExpense.expense,
          incomeExpensePrev.expense
        ),

      netIncomeGrowth:
        growthPercent(
          netIncome,
          netIncomePrev
        ),
    },

    incomeExpense: {
      income:
        incomeExpense.income,

      expense:
        incomeExpense.expense,

      net:
        netIncome,

      series:
        incomeExpenseSeries,

      incomeByCategory:
        incomeByCategory.map(
          (category) => ({
            ...category,

            percentage:
              percentOfTotal(
                category.total,
                incomeTotalForPct
              ),
          })
        ),

      expenseByCategory:
        expenseByCategory.map(
          (category) => ({
            ...category,

            percentage:
              percentOfTotal(
                category.total,
                expenseTotalForPct
              ),
          })
        ),

      topTransactions,
    },

    posts: {
      total:
        postsTotal,

      views:
        postViewClicks.views,

      clicks:
        postViewClicks.clicks,

      ctr:
        ctrPercent(
          postViewClicks.clicks,
          postViewClicks.views
        ),

      viewsGrowth:
        growthPercent(
          postViewClicks.views,
          postViewClicksPrev.views
        ),

      clicksGrowth:
        growthPercent(
          postViewClicks.clicks,
          postViewClicksPrev.clicks
        ),

      topByViews:
        topPostsByViews,

      topByClicks:
        topPostsByClicks,

      topByLikes:
        topPostsByLikes,

      byCategory:
        categoryWisePosts,
    },

    blogs: {
      total:
        blogsTotals.total,

      views:
        blogsTotals.views,

      likes:
        blogsTotals.likes,

      comments:
        blogsTotals.comments,

      topByViews:
        topBlogsByViews,

      byCategory:
        blogCategoryAnalytics,
    },

    courses: {
      total:
        coursesTotals.total,

      active:
        coursesTotals.active,

      revenue:
        revenueBreakdown.course,

      top:
        topCourses,
    },

    testSeries: {
      total:
        testSeriesTotals.total,

      active:
        testSeriesTotals.active,

      revenue:
        revenueBreakdown.testSeries,

      top:
        topTestSeries,
    },

    revenueBreakdown,

    users: {
      total:
        usersTotals.total,

      newUsers:
        usersTotals.newUsers,

      active:
        usersTotals.active,

      growth:
        growthPercent(
          usersTotals.newUsers,
          usersTotalsPrev.newUsers
        ),
    },

    siteHealth,
  };
}

/* ==========================================================================
 * Exports
 * ========================================================================== */

module.exports = {
  resolveDateRange,
  getDashboardData,
  growthPercent,
  ctrPercent,
};