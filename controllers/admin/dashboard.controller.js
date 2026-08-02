'use strict';
const db = require('../../models');

async function showDashboard(req, res, next) {
  try {
    const [
      totalPosts,
      totalUsers,
      totalBlogs,
      totalCategories,
      categoriesWithCounts,
      recentPosts,
    ] = await Promise.all([
      db.Post.count(),
      db.User.count(),
      db.Blog.count(),
      db.Category.count(),
      db.Category.findAll({
        attributes: [
          'id',
          'name',
          'slug',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('Posts.id')), 'postCount'],
        ],
        include: [{ model: db.Post, attributes: [] }],
        group: ['Category.id'],
        order: [['display_order', 'ASC']],
      }),
      db.Post.findAll({
        include: [{ model: db.Category, attributes: ['name', 'slug'] }],
        order: [['created_at', 'DESC']],
        limit: 8,
      }),
    ]);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      active: 'dashboard',
      stats: {
        totalPosts,
        totalUsers,
        totalBlogs,
        totalCategories,
      },
      categoriesWithCounts,
      recentPosts,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { showDashboard };
