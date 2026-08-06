'use strict';
const service = require('../../services/admin/blogCategory.service');

async function index(req, res, next) {
  try {
    const categories = await service.getList((req.query.search || '').trim());
    res.render('admin/blog-categories/index', {
      title: 'Blog Categories',
      active: 'blog-categories',
      categories,
      search: req.query.search || '',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    await service.createCategory(req.body);
    req.flash('success', 'Blog category created successfully.');
    res.redirect('/admin/blog-categories');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/blog-categories');
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await service.updateCategory(req.params.id, req.body);
    req.flash('success', 'Blog category updated successfully.');
    res.redirect('/admin/blog-categories');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/blog-categories');
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.deleteCategory(req.params.id);
    req.flash('success', 'Blog category deleted successfully.');
    res.redirect('/admin/blog-categories');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/blog-categories');
    }
    next(err);
  }
}

module.exports = { index, store, update, destroy };
