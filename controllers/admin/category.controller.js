'use strict';
const categoryService = require('../../services/admin/category.service');

async function index(req, res, next) {
  try {
    const categories = await categoryService.getList((req.query.search || '').trim());
    res.render('admin/categories/index', {
      title: 'Categories',
      active: 'categories',
      categories,
      search: req.query.search || '',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    if (!req.body.name) {
      req.flash('error', 'Category name is required.');
      return res.redirect('/admin/categories');
    }
    await categoryService.createCategory(req.body);
    req.flash('success', 'Category created successfully.');
    res.redirect('/admin/categories');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/categories');
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.name) {
      req.flash('error', 'Category name is required.');
      return res.redirect('/admin/categories');
    }
    await categoryService.updateCategory(req.params.id, req.body);
    req.flash('success', 'Category updated successfully.');
    res.redirect('/admin/categories');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/categories');
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    req.flash('success', 'Category deleted successfully.');
    res.redirect('/admin/categories');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/categories');
    }
    next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    await categoryService.toggleStatus(req.params.id);
    res.redirect(req.get('Referer') || '/admin/categories');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, store, update, destroy, toggleStatus };
