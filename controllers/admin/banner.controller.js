'use strict';
const service = require('../../services/admin/banner.service');

async function index(req, res, next) {
  try {
    const banners = await service.getList((req.query.search || '').trim());
    res.render('admin/banners/index', {
      title: 'Banners',
      active: 'banners',
      banners,
      search: req.query.search || '',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    // Pass req.file alongside req.body for image upload
    await service.createBanner(req.body, req.file);
    req.flash('success', 'Banner created successfully.');
    res.redirect('/admin/banners');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/banners');
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    // Pass req.file alongside req.body for image upload update
    await service.updateBanner(req.params.id, req.body, req.file);
    req.flash('success', 'Banner updated successfully.');
    res.redirect('/admin/banners');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/banners');
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.deleteBanner(req.params.id);
    req.flash('success', 'Banner deleted successfully.');
    res.redirect('/admin/banners');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/banners');
    }
    next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    await service.toggleStatus(req.params.id);
    res.redirect(req.get('Referer') || '/admin/banners');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, store, update, destroy, toggleStatus };