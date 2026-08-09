'use strict';
const db = require('../../models');
const service = require('../../services/admin/scrapedContent.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { items, total, page, perPage } = await service.getList(req.query);
    const websites = await db.ScrapingWebsite.findAll({ order: [['name', 'ASC']] });
    const pagination = buildPagination(page, total, perPage, '/admin/scraping/content');
    res.render('admin/scraping/content/index', {
      title: 'Scraped Content',
      active: 'scraping-content',
      items,
      total,
      websites,
      pagination,
      filters: {
        status: req.query.status !== undefined ? req.query.status : 'draft',
        website: req.query.website || '',
        search: req.query.search || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const item = await service.getById(req.params.id);
    if (!item) {
      req.flash('error', 'Scraped item not found.');
      return res.redirect('/admin/scraping/content');
    }
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    res.render('admin/scraping/content/edit', {
      title: 'Review Scraped Content',
      active: 'scraping-content',
      item,
      categories,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await service.updateContent(req.params.id, req.body);
    req.flash('success', 'Scraped content updated.');
    res.redirect(`/admin/scraping/content/${req.params.id}/edit`);
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/scraping/content');
    }
    next(err);
  }
}

async function publish(req, res, next) {
  try {
    await service.publish(req.params.id);
    req.flash('success', 'Published successfully — now live as a normal post.');
    res.redirect('/admin/scraping/content');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(req.get('Referer') || '/admin/scraping/content');
    }
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    await service.reject(req.params.id);
    req.flash('success', 'Item rejected.');
    res.redirect('/admin/scraping/content');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.remove(req.params.id);
    req.flash('success', 'Item deleted.');
    res.redirect('/admin/scraping/content');
  } catch (err) {
    next(err);
  }
}

async function bulk(req, res, next) {
  try {
    const ids = [].concat(req.body.ids || []);
    const action = req.body.bulk_action;
    if (!ids.length) {
      req.flash('error', 'No items selected.');
      return res.redirect('/admin/scraping/content');
    }
    const results = await service.bulkAction(ids, action);
    const okCount = results.filter((r) => r.ok).length;
    req.flash('success', `${okCount} of ${ids.length} item(s) processed.`);
    res.redirect('/admin/scraping/content');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, editForm, update, publish, reject, destroy, bulk };
