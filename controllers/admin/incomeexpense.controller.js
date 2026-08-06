'use strict';
const incomeExpenseService = require('../../services/admin/incomeExpense.service');

async function index(req, res, next) {
  try {
    const {
      entries, total, page, perPage, stats, banks, banksTotal, bankPage, banksPerPage,
      users, allBanks, allCategories,
    } = await incomeExpenseService.getList(req.query);

    res.render('admin/income-expense/index', {
      title: 'Income & Expense',
      active: 'income-expense',
      entries, 
      total,
      page,
      perPage,
      stats,
      banks,
      banksTotal,
      bankPage,
      banksPerPage,
      users,
      allBanks,
      allCategories,
      filters: {
        search: req.query.search || '',
        type: req.query.type || '',
        user: req.query.user || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function storeEntry(req, res, next) {
  try {
    await incomeExpenseService.addEntry(req.body);
    req.flash('success', 'Entry added successfully.');
    res.redirect('/admin/income-expense');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/income-expense');
    }
    next(err);
  }
}

async function updateEntry(req, res, next) {
  try {
    await incomeExpenseService.editEntry(req.params.id, req.body);
    req.flash('success', 'Entry updated successfully.');
    res.redirect('/admin/income-expense');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/income-expense');
    }
    next(err);
  }
}

async function destroyEntry(req, res, next) {
  try {
    await incomeExpenseService.removeEntry(req.params.id);
    req.flash('success', 'Entry deleted successfully.');
    res.redirect('/admin/income-expense');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/income-expense');
    }
    next(err);
  }
}

async function storeBank(req, res, next) {
  try {
    await incomeExpenseService.addBank(req.body);
    req.flash('success', 'Account added successfully.');
    res.redirect('/admin/income-expense');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/income-expense');
    }
    next(err);
  }
}

async function updateBank(req, res, next) {
  try {
    await incomeExpenseService.editBank(req.params.id, req.body);
    req.flash('success', 'Account updated successfully.');
    res.redirect('/admin/income-expense');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/income-expense');
    }
    next(err);
  }
}

async function destroyBank(req, res, next) {
  try {
    await incomeExpenseService.removeBank(req.params.id);
    req.flash('success', 'Account removed successfully.');
    res.redirect('/admin/income-expense');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/income-expense');
    }
    next(err);
  }
}

module.exports = { index, storeEntry, updateEntry, destroyEntry, storeBank, updateBank, destroyBank };