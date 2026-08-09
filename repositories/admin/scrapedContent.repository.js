'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 20;

async function list({ page = 1, status = '', websiteId = '', search = '' } = {}) {
  const where = {};
  if (status) where.status = status;
  if (websiteId) where.scraping_website_id = websiteId;
  if (search) where.post_title = { [Op.like]: `%${search}%` };

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.ScrapingLog.findAndCountAll({
    where,
    include: [{ model: db.ScrapingWebsite, attributes: ['id', 'name'] }],
    order: [['scraped_at', 'DESC']],
    limit: PER_PAGE,
    offset,
  });
  return { rows, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.ScrapingLog.findByPk(id, { include: [{ model: db.ScrapingWebsite }] });
}

async function findByDetailUrl(websiteId, detailUrl) {
  return db.ScrapingLog.findOne({ where: { scraping_website_id: websiteId, detail_url: detailUrl } });
}

async function create(data) {
  return db.ScrapingLog.create(data);
}

async function update(log, data) {
  return log.update(data);
}

async function destroy(log) {
  return log.destroy();
}

async function stats() {
  const [pending, published, rejected, today] = await Promise.all([
    db.ScrapingLog.count({ where: { status: 'draft' } }),
    db.ScrapingLog.count({ where: { status: 'published' } }),
    db.ScrapingLog.count({ where: { status: 'rejected' } }),
    db.ScrapingLog.count({
      where: {
        status: 'published',
        updated_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);
  return { pending, published, rejected, publishedToday: today };
}

module.exports = { list, findById, findByDetailUrl, create, update, destroy, stats, PER_PAGE };
