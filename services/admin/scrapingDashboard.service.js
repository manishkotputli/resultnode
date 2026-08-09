'use strict';
const db = require('../../models');
const { Op } = require('sequelize');
const contentRepo = require('../../repositories/admin/scrapedContent.repository');

async function getStats() {
  const [totalWebsites, activeWebsites, contentStats, failedToday] = await Promise.all([
    db.ScrapingWebsite.count(),
    db.ScrapingWebsite.count({ where: { is_active: true } }),
    contentRepo.stats(),
    db.ScrapingWebsite.count({
      where: {
        last_status: 'failed',
        updated_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const totalProcessed = contentStats.published + contentStats.rejected;
  const successRate = totalProcessed > 0 ? Math.round((contentStats.published / totalProcessed) * 100) : 0;

  return {
    totalWebsites,
    activeWebsites,
    pendingContent: contentStats.pending,
    publishedToday: contentStats.publishedToday,
    failedToday,
    successRate,
  };
}

async function getRecentWebsiteActivity() {
  return db.ScrapingWebsite.findAll({
    where: { last_scraped_at: { [Op.ne]: null } },
    order: [['last_scraped_at', 'DESC']],
    limit: 8,
  });
}

async function getDailyPublishCounts(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await db.ScrapingLog.findAll({
    where: { status: 'published', updated_at: { [Op.gte]: since } },
    attributes: [
      [db.Sequelize.fn('DATE', db.Sequelize.col('updated_at')), 'day'],
      [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
    ],
    group: [db.Sequelize.fn('DATE', db.Sequelize.col('updated_at'))],
    raw: true,
  });

  const map = new Map(rows.map((r) => [r.day, parseInt(r.count, 10)]));
  const result = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) || 0 });
  }
  return result;
}

module.exports = { getStats, getRecentWebsiteActivity, getDailyPublishCounts };
