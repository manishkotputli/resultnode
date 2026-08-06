'use strict';
const service = require('../../services/admin/contactMessage.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { messages: contactMessages, total, page, perPage } = await service.getList(req.query);
    const pagination = buildPagination(page, total, perPage, '/admin/contact-messages');
    res.render('admin/contact-messages/index', {
      title: 'Contact Messages',
      active: 'contact-messages',
      contactMessages,
      total,
      pagination,
      filters: { status: req.query.status || '' },
    });
  } catch (err) {
    next(err);
  }
}

async function toggleRead(req, res, next) {
  try {
    await service.toggleRead(req.params.id);
    res.redirect(req.get('Referer') || '/admin/contact-messages');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.deleteMessage(req.params.id);
    req.flash('success', 'Message deleted successfully.');
    res.redirect('/admin/contact-messages');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/contact-messages');
    }
    next(err);
  }
}

module.exports = { index, toggleRead, destroy };
