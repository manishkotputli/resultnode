'use strict';
const service = require('../../services/admin/scrapingDashboard.service');

async function index(req, res, next) {
  try {
    const [stats, recentActivity, dailyCounts] = await Promise.all([
      service.getStats(),
      service.getRecentWebsiteActivity(),
      service.getDailyPublishCounts(7),
    ]);
    res.render('admin/scraping/dashboard', {
      title: 'Scraping Dashboard',
      active: 'scraping-dashboard',
      stats,
      recentActivity,
      dailyCounts,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { index };
