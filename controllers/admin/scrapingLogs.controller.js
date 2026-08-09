'use strict';
const db = require('../../models');
const service = require('../../services/admin/scrapedContent.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const query = { ...req.query, status: req.query.status || '' };
    const { items, total, page, perPage } = await service.getList(query);
    const websites = await db.ScrapingWebsite.findAll({ order: [['name', 'ASC']] });
    const pagination = buildPagination(page, total, perPage, '/admin/scraping/logs');
    res.render('admin/scraping/logs/index', {
      title: 'Scraping Logs',
      active: 'scraping-logs',
      items,
      total,
      websites,
      pagination,
      filters: {
        status: req.query.status || '',
        website: req.query.website || '',
        search: req.query.search || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { index };
