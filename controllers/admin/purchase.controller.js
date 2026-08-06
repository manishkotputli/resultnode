'use strict';
const purchaseService = require('../../services/admin/purchase.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { purchases, total, page, perPage, stats, users } = await purchaseService.getList(req.query);
    const pagination = buildPagination(page, total, perPage, '/admin/purchases');
    res.render('admin/purchases/index', {
      title: 'Purchases',
      active: 'purchases',
      purchases,
      total,
      pagination,
      stats,
      users,
      filters: {
        search: req.query.search || '',
        type: req.query.type || '',
        status: req.query.status || '',
        user: req.query.user || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function receipt(req, res, next) {
  try {
    const purchase = await purchaseService.getReceipt(req.params.id);
    res.render('admin/purchases/receipt', {
      title: `Receipt - ${purchase.order_id || purchase.id}`,
      purchase,
    });
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/purchases');
    }
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    await purchaseService.setStatus(req.params.id, req.body.payment_status);
    req.flash('success', 'Purchase status updated.');
    res.redirect('/admin/purchases');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/purchases');
    }
    next(err);
  }
}

module.exports = { index, receipt, updateStatus };
