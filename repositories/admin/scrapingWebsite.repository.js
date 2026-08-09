'use strict';
const db = require('../../models');

async function list() {
  return db.ScrapingWebsite.findAll({
    attributes: {
      include: [[db.Sequelize.fn('COUNT', db.Sequelize.col('ScrapingLogs.id')), 'itemCount']],
    },
    include: [{ model: db.ScrapingLog, attributes: [] }],
    group: ['ScrapingWebsite.id'],
    order: [['id', 'DESC']],
  });
}

async function allActive() {
  return db.ScrapingWebsite.findAll({ where: { is_active: true } });
}

async function findById(id) {
  return db.ScrapingWebsite.findByPk(id);
}

async function create(data) {
  return db.ScrapingWebsite.create(data);
}

async function update(website, data) {
  return website.update(data);
}

async function destroy(website) {
  await db.ScrapingLog.destroy({ where: { scraping_website_id: website.id } });
  return website.destroy();
}

module.exports = { list, allActive, findById, create, update, destroy };
