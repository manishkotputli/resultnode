'use strict';

const db = require('../../models');
const { Op } = require('sequelize');

/* ==========================================================================
 * Helpers
 * ========================================================================== */

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toInt(value) {
  const number = parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

/* ==========================================================================
 * Income / Expense
 * ========================================================================== */

/**
 * Always scoped to the logged-in admin's user_id.
 *
 * IMPORTANT:
 * Do not accept user_id from req.query.
 */
async function getIncomeExpenseTotals(userId, from, to) {
  const income = await db.IncomeExpense.sum('amount', {
    where: {
      user_id: userId,
      type: 1,
      transaction_date: {
        [Op.between]: [from, to],
      },
    },
  });

  const expense = await db.IncomeExpense.sum('amount', {
    where: {
      user_id: userId,
      type: 2,
      transaction_date: {
        [Op.between]: [from, to],
      },
    },
  });

  return {
    income: toNumber(income),
    expense: toNumber(expense),
  };
}

async function getIncomeExpenseByCategory(
  userId,
  type,
  from,
  to
) {
  const rows = await db.IncomeExpense.findAll({
    where: {
      user_id: userId,
      type,
      transaction_date: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      'category_id',

      [
        db.Sequelize.fn(
          'SUM',
          db.Sequelize.col('amount')
        ),
        'total',
      ],

      [
        db.Sequelize.fn(
          'COUNT',
          db.Sequelize.col('IncomeExpense.id')
        ),
        'txn_count',
      ],
    ],

    include: [
      {
        model: db.IncomeExpenseCategory,
        attributes: ['name'],
      },
    ],

    group: [
      'IncomeExpense.category_id',
      'IncomeExpenseCategory.id',
    ],

    order: [
      [
        db.Sequelize.literal('total'),
        'DESC',
      ],
    ],
  });

  return rows.map((row) => ({
    category_id: row.category_id,

    name: row.IncomeExpenseCategory
      ? row.IncomeExpenseCategory.name
      : 'Uncategorized',

    total: toNumber(row.get('total')),

    txn_count: toInt(row.get('txn_count')),
  }));
}

async function getTopTransactions(
  userId,
  from,
  to,
  limit = 5
) {
  const rows = await db.IncomeExpense.findAll({
    where: {
      user_id: userId,
      transaction_date: {
        [Op.between]: [from, to],
      },
    },

    include: [
      {
        model: db.IncomeExpenseCategory,
        attributes: ['name'],
      },
    ],

    order: [
      ['transaction_date', 'DESC'],
      ['id', 'DESC'],
    ],

    limit,
  });

  return rows.map((row) => ({
    type: row.type === 1
      ? 'Income'
      : 'Expense',

    category: row.IncomeExpenseCategory
      ? row.IncomeExpenseCategory.name
      : 'Uncategorized',

    description: row.title,

    amount: toNumber(row.amount),

    date: row.transaction_date,
  }));
}

/**
 * Returns daily income/expense totals.
 *
 * Uses DATE(transaction_date), so multiple transactions
 * on the same day are combined into one point.
 */
async function getIncomeExpenseDailySeries(
  userId,
  from,
  to
) {
  const dateExpression =
    db.Sequelize.fn(
      'DATE',
      db.Sequelize.col('transaction_date')
    );

  const rows = await db.IncomeExpense.findAll({
    where: {
      user_id: userId,
      transaction_date: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      [
        dateExpression,
        'date',
      ],

      'type',

      [
        db.Sequelize.fn(
          'SUM',
          db.Sequelize.col('amount')
        ),
        'total',
      ],
    ],

    group: [
      db.Sequelize.literal(
        'DATE(`transaction_date`)'
      ),
      'type',
    ],

    order: [
      [
        db.Sequelize.literal(
          'DATE(`transaction_date`)'
        ),
        'ASC',
      ],
      ['type', 'ASC'],
    ],

    raw: true,
  });

  return rows.map((row) => ({
    date: row.date,

    type: Number(row.type) === 1
      ? 'income'
      : 'expense',

    total: toNumber(row.total),
  }));
}

/* ==========================================================================
 * Posts
 * ========================================================================== */

async function getPostsTotalCount() {
  return db.Post.count();
}

async function getPostViewClickTotals(from, to) {
  const rows = await db.PostView.findAll({
    where: {
      trackable_type: 'post',

      created_at: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      'event_type',

      [
        db.Sequelize.fn(
          'COUNT',
          db.Sequelize.col('id')
        ),
        'cnt',
      ],
    ],

    group: ['event_type'],

    raw: true,
  });

  const result = {
    views: 0,
    clicks: 0,
  };

  rows.forEach((row) => {
    if (row.event_type === 'view') {
      result.views = toInt(row.cnt);
    }

    if (row.event_type === 'click') {
      result.clicks = toInt(row.cnt);
    }
  });

  return result;
}

async function getTopPostsByEvent(
  eventType,
  from,
  to,
  limit = 5
) {
  const rows = await db.PostView.findAll({
    where: {
      trackable_type: 'post',
      event_type: eventType,

      created_at: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      'trackable_id',

      [
        db.Sequelize.fn(
          'COUNT',
          db.Sequelize.col('id')
        ),
        'cnt',
      ],
    ],

    group: ['trackable_id'],

    order: [
      [
        db.Sequelize.literal('cnt'),
        'DESC',
      ],
    ],

    limit,

    raw: true,
  });

  if (!rows.length) {
    return [];
  }

  const postIds = rows.map(
    (row) => row.trackable_id
  );

  const posts = await db.Post.findAll({
    where: {
      id: {
        [Op.in]: postIds,
      },
    },

    attributes: [
      'id',
      'title',
      'slug',
    ],
  });

  const postMap = new Map(
    posts.map((post) => [
      post.id,
      post,
    ])
  );

  return rows
    .map((row) => ({
      post: postMap.get(row.trackable_id),

      count: toInt(row.cnt),
    }))

    .filter((item) => item.post);
}

async function getTopPostsByLikes(limit = 5) {
  const rows = await db.Like.findAll({
    where: {
      likeable_type: 'post',
    },

    attributes: [
      'likeable_id',

      [
        db.Sequelize.fn(
          'COUNT',
          db.Sequelize.col('id')
        ),
        'cnt',
      ],
    ],

    group: ['likeable_id'],

    order: [
      [
        db.Sequelize.literal('cnt'),
        'DESC',
      ],
    ],

    limit,

    raw: true,
  });

  if (!rows.length) {
    return [];
  }

  const postIds = rows.map(
    (row) => row.likeable_id
  );

  const posts = await db.Post.findAll({
    where: {
      id: {
        [Op.in]: postIds,
      },
    },

    attributes: [
      'id',
      'title',
      'slug',
    ],
  });

  const postMap = new Map(
    posts.map((post) => [
      post.id,
      post,
    ])
  );

  return rows
    .map((row) => ({
      post: postMap.get(row.likeable_id),

      count: toInt(row.cnt),
    }))

    .filter((item) => item.post);
}

async function getCategoryWisePostAnalytics(
  from,
  to
) {
  /*
   * Deliberately sequential.
   *
   * The old version started 3 database queries simultaneously
   * and then started another query. This dashboard already has
   * many queries, so keeping this method sequential reduces
   * MySQL connection pressure.
   */

  const categories = await db.Category.findAll({
    attributes: {
      include: [
        [
          db.Sequelize.fn(
            'COUNT',
            db.Sequelize.col('Posts.id')
          ),
          'postCount',
        ],
      ],
    },

    include: [
      {
        model: db.Post,
        attributes: [],
      },
    ],

    group: ['Category.id'],

    order: [
      ['display_order', 'ASC'],
    ],
  });

  const viewRows = await db.PostView.findAll({
    where: {
      trackable_type: 'post',
      event_type: 'view',

      created_at: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      'trackable_id',
    ],

    raw: true,
  });

  const clickRows = await db.PostView.findAll({
    where: {
      trackable_type: 'post',
      event_type: 'click',

      created_at: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      'trackable_id',
    ],

    raw: true,
  });

  const postIds = [
    ...new Set([
      ...viewRows.map(
        (row) => row.trackable_id
      ),

      ...clickRows.map(
        (row) => row.trackable_id
      ),
    ]),
  ];

  let posts = [];

  if (postIds.length > 0) {
    posts = await db.Post.findAll({
      where: {
        id: {
          [Op.in]: postIds,
        },
      },

      attributes: [
        'id',
        'category_id',
      ],
    });
  }

  const postCategoryMap = new Map(
    posts.map((post) => [
      post.id,
      post.category_id,
    ])
  );

  const viewsByCategory = new Map();
  const clicksByCategory = new Map();

  viewRows.forEach((row) => {
    const categoryId =
      postCategoryMap.get(
        row.trackable_id
      );

    if (!categoryId) {
      return;
    }

    viewsByCategory.set(
      categoryId,
      (viewsByCategory.get(categoryId) || 0) + 1
    );
  });

  clickRows.forEach((row) => {
    const categoryId =
      postCategoryMap.get(
        row.trackable_id
      );

    if (!categoryId) {
      return;
    }

    clicksByCategory.set(
      categoryId,
      (clicksByCategory.get(categoryId) || 0) + 1
    );
  });

  return categories.map((category) => {
    const views =
      viewsByCategory.get(category.id) || 0;

    const clicks =
      clicksByCategory.get(category.id) || 0;

    return {
      id: category.id,

      name: category.name,

      postCount: toInt(
        category.get('postCount')
      ),

      views,

      clicks,

      ctr: views > 0
        ? Math.round(
            (clicks / views) * 10000
          ) / 100
        : 0,
    };
  });
}

/* ==========================================================================
 * Blogs
 * ========================================================================== */

async function getBlogsTotals() {
  const row = await db.Blog.findOne({
    attributes: [
      [
        db.Sequelize.fn(
          'COUNT',
          db.Sequelize.col('id')
        ),
        'total',
      ],

      [
        db.Sequelize.fn(
          'SUM',
          db.Sequelize.col('views')
        ),
        'views',
      ],

      [
        db.Sequelize.fn(
          'SUM',
          db.Sequelize.col('likes_count')
        ),
        'likes',
      ],

      [
        db.Sequelize.fn(
          'SUM',
          db.Sequelize.col('comments_count')
        ),
        'comments',
      ],
    ],

    where: {
      status: 'published',
    },

    raw: true,
  });

  if (!row) {
    return {
      total: 0,
      views: 0,
      likes: 0,
      comments: 0,
    };
  }

  return {
    total: toInt(row.total),
    views: toInt(row.views),
    likes: toInt(row.likes),
    comments: toInt(row.comments),
  };
}

async function getTopBlogsByViews(limit = 5) {
  return db.Blog.findAll({
    where: {
      status: 'published',
    },

    order: [
      ['views', 'DESC'],
    ],

    limit,

    attributes: [
      'id',
      'title',
      'slug',
      'views',
      'likes_count',
      'comments_count',
    ],
  });
}

async function getBlogCategoryAnalytics() {
  const rows = await db.BlogCategory.findAll({
    attributes: {
      include: [
        [
          db.Sequelize.fn(
            'COUNT',
            db.Sequelize.col('Blogs.id')
          ),
          'blogCount',
        ],

        [
          db.Sequelize.fn(
            'SUM',
            db.Sequelize.col('Blogs.views')
          ),
          'views',
        ],

        [
          db.Sequelize.fn(
            'SUM',
            db.Sequelize.col('Blogs.likes_count')
          ),
          'likes',
        ],
      ],
    },

    include: [
      {
        model: db.Blog,
        attributes: [],

        where: {
          status: 'published',
        },

        required: false,
      },
    ],

    group: [
      'BlogCategory.id',
    ],
  });

  return rows.map((row) => ({
    id: row.id,

    name: row.name,

    blogCount: toInt(
      row.get('blogCount')
    ),

    views: toInt(
      row.get('views')
    ),

    likes: toInt(
      row.get('likes')
    ),
  }));
}

/* ==========================================================================
 * Courses / Test Series
 * ========================================================================== */

async function getCoursesTotals() {
  const total = await db.Course.count();

  const active = await db.Course.count({
    where: {
      is_active: true,
    },
  });

  return {
    total,
    active,
  };
}

async function getTestSeriesTotals() {
  const total = await db.TestSeries.count();

  const active = await db.TestSeries.count({
    where: {
      is_active: true,
    },
  });

  return {
    total,
    active,
  };
}

async function getPurchaseTotalsByType(
  purchasableType,
  from,
  to
) {
  const rows = await db.Purchase.findAll({
    where: {
      purchasable_type: purchasableType,

      payment_status: 'completed',

      purchased_at: {
        [Op.between]: [from, to],
      },
    },

    attributes: [
      'purchasable_id',

      [
        db.Sequelize.fn(
          'SUM',
          db.Sequelize.col('amount')
        ),
        'revenue',
      ],

      [
        db.Sequelize.fn(
          'COUNT',
          db.Sequelize.col('id')
        ),
        'enrollments',
      ],
    ],

    group: [
      'purchasable_id',
    ],

    raw: true,
  });

  return rows.map((row) => ({
    purchasable_id:
      row.purchasable_id,

    revenue: toNumber(
      row.revenue
    ),

    enrollments: toInt(
      row.enrollments
    ),
  }));
}

async function getTopCoursesByRevenue(
  from,
  to,
  limit = 5
) {
  const rows =
    await getPurchaseTotalsByType(
      'course',
      from,
      to
    );

  rows.sort(
    (a, b) => b.revenue - a.revenue
  );

  const top = rows.slice(0, limit);

  if (!top.length) {
    return [];
  }

  const courses =
    await db.Course.findAll({
      where: {
        id: {
          [Op.in]: top.map(
            (row) =>
              row.purchasable_id
          ),
        },
      },

      attributes: [
        'id',
        'title',
        'slug',
      ],
    });

  const courseMap = new Map(
    courses.map((course) => [
      course.id,
      course,
    ])
  );

  return top
    .map((row) => ({
      course: courseMap.get(
        row.purchasable_id
      ),

      revenue: row.revenue,

      enrollments: row.enrollments,
    }))

    .filter(
      (item) => item.course
    );
}

async function getTopTestSeriesByRevenue(
  from,
  to,
  limit = 5
) {
  const rows =
    await getPurchaseTotalsByType(
      'test_series',
      from,
      to
    );

  rows.sort(
    (a, b) => b.revenue - a.revenue
  );

  const top = rows.slice(0, limit);

  if (!top.length) {
    return [];
  }

  const testSeries =
    await db.TestSeries.findAll({
      where: {
        id: {
          [Op.in]: top.map(
            (row) =>
              row.purchasable_id
          ),
        },
      },

      attributes: [
        'id',
        'title',
        'slug',
      ],
    });

  const testSeriesMap = new Map(
    testSeries.map((item) => [
      item.id,
      item,
    ])
  );

  return top
    .map((row) => ({
      testSeries:
        testSeriesMap.get(
          row.purchasable_id
        ),

      revenue: row.revenue,

      enrollments: row.enrollments,
    }))

    .filter(
      (item) => item.testSeries
    );
}

async function getRevenueBreakdown(
  from,
  to
) {
  const baseWhere = {
    payment_status: 'completed',

    purchased_at: {
      [Op.between]: [from, to],
    },
  };

  const courseRevenue =
    await db.Purchase.sum('amount', {
      where: {
        ...baseWhere,

        purchasable_type: 'course',
      },
    });

  const testSeriesRevenue =
    await db.Purchase.sum('amount', {
      where: {
        ...baseWhere,

        purchasable_type: 'test_series',
      },
    });

  const totalPurchases =
    await db.Purchase.sum('amount', {
      where: baseWhere,
    });

  const course =
    toNumber(courseRevenue);

  const testSeries =
    toNumber(testSeriesRevenue);

  const total =
    toNumber(totalPurchases);

  const other =
    Math.max(
      0,
      total - course - testSeries
    );

  return {
    course,
    testSeries,
    other,
    total,
  };
}

/* ==========================================================================
 * Users
 * ========================================================================== */

async function getUsersTotals(
  from,
  to
) {
  const total =
    await db.User.count();

  const newUsers =
    await db.User.count({
      where: {
        created_at: {
          [Op.between]: [from, to],
        },
      },
    });

  const active =
    await db.User.count({
      where: {
        is_active: true,
      },
    });

  return {
    total,
    newUsers,
    active,
  };
}

/* ==========================================================================
 * Exports
 * ========================================================================== */

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