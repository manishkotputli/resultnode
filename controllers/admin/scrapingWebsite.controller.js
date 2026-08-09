'use strict';
const db = require('../../models');
const service = require('../../services/admin/scrapingWebsite.service');

async function index(req, res, next) {
  try {
    const websites = await service.getList();
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    res.render('admin/scraping/websites/index', {
      title: 'Scraping Websites',
      active: 'scraping-websites',
      websites,
      categories,
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    await service.createWebsite(req.body);
    req.flash('success', 'Website added successfully.');
    res.redirect('/admin/scraping/websites');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/scraping/websites');
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await service.updateWebsite(req.params.id, req.body);
    req.flash('success', 'Website updated successfully.');
    res.redirect('/admin/scraping/websites');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/scraping/websites');
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.deleteWebsite(req.params.id);
    req.flash('success', 'Website deleted successfully.');
    res.redirect('/admin/scraping/websites');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/scraping/websites');
    }
    next(err);
  }
}

async function runNow(req, res, next) {
  try {
    const result = await service.runNow(req.params.id);
    req.flash('success', `Scrape finished: ${result.imported} new item(s) imported, ${result.skipped} duplicate(s) skipped.`);
    res.redirect('/admin/scraping/websites');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/scraping/websites');
    }
    req.flash('error', `Scrape failed: ${err.message}`);
    res.redirect('/admin/scraping/websites');
  }
}

module.exports = { index, store, update, destroy, runNow };
