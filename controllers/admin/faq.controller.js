'use strict';
const db = require('../../models');
const service = require('../../services/admin/faq.service');

async function index(req, res, next) {
  try {
    const faqs = await service.getList((req.query.search || '').trim());
    res.render('admin/faqs/index', {
      title: 'FAQs',
      active: 'faqs',
      faqs,
      search: req.query.search || '',
    });
  } catch (err) {
    next(err);
  }
}

async function createForm(req, res, next) {
  try {
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    res.render('admin/faqs/form', {
      title: 'Add FAQ',
      active: 'faqs',
      mode: 'create',
      categories,
      faq: null,
      formAction: '/admin/faqs',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    await service.createFaq(req.body);
    req.flash('success', 'FAQ created successfully.');
    res.redirect('/admin/faqs');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/faqs/create');
    }
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const faq = await service.getForEdit(req.params.id);
    if (!faq) {
      req.flash('error', 'FAQ not found.');
      return res.redirect('/admin/faqs');
    }
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    res.render('admin/faqs/form', {
      title: 'Edit FAQ',
      active: 'faqs',
      mode: 'edit',
      categories,
      faq,
      formAction: `/admin/faqs/${faq.id}/update`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await service.updateFaq(req.params.id, req.body);
    req.flash('success', 'FAQ updated successfully.');
    res.redirect('/admin/faqs');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/faqs/${req.params.id}/edit`);
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.deleteFaq(req.params.id);
    req.flash('success', 'FAQ deleted successfully.');
    res.redirect('/admin/faqs');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/faqs');
    }
    next(err);
  }
}

module.exports = { index, createForm, store, editForm, update, destroy };
