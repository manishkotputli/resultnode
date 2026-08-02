'use strict';
const dashboardService = require('../../services/web/dashboard.service');

async function index(req, res, next) {
  try {
    const data = await dashboardService.getOverview(req.session.user.id);
    res.render('web/dashboard/index', { title: 'My Account', ...data });
  } catch (err) {
    next(err);
  }
}

async function purchases(req, res, next) {
  try {
    const purchases = await dashboardService.getPurchases(req.session.user.id);
    res.render('web/dashboard/purchases', { title: 'My Purchases', purchases });
  } catch (err) {
    next(err);
  }
}

async function financeSettings(req, res, next) {
  try {
    const data = await dashboardService.getFinanceSettings(req.session.user.id);
    res.render('web/dashboard/finance-settings', { title: 'Banks & Categories', ...data });
  } catch (err) {
    next(err);
  }
}

async function addBank(req, res, next) {
  try {
    await dashboardService.addBank(req.session.user.id, req.body);
    req.flash('success', 'Bank added.');
    res.redirect('/dashboard/finance-settings');
  } catch (err) {
    next(err);
  }
}

async function addCategory(req, res, next) {
  try {
    await dashboardService.addCategory(req.session.user.id, req.body);
    req.flash('success', 'Category added.');
    res.redirect('/dashboard/finance-settings');
  } catch (err) {
    next(err);
  }
}

async function incomeExpense(req, res, next) {
  try {
    const data = await dashboardService.getIncomeExpense(req.session.user.id);
    res.render('web/dashboard/income-expense', { title: 'Income & Expense', ...data });
  } catch (err) {
    next(err);
  }
}

async function addEntry(req, res, next) {
  try {
    await dashboardService.addEntry(req.session.user.id, req.body);
    req.flash('success', 'Entry added.');
    res.redirect('/dashboard/income-expense');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, purchases, financeSettings, addBank, addCategory, incomeExpense, addEntry };
