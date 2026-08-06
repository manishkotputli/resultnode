'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

async function list({ search = '', type = '', userId = '', page = 1, perPage = 15 }) {
  const where = {};
  if (type) where.type = Number(type);
  if (userId) where.user_id = Number(userId);
  if (search) where.title = { [Op.like]: `%${search}%` };

  const { rows, count } = await db.IncomeExpense.findAndCountAll({
    where,
    include: [
      { model: db.User, attributes: ['id', 'name', 'email'] },
      { model: db.IncomeExpenseCategory, attributes: ['id', 'name'] },
      { model: db.Bank, attributes: ['id', 'name'] },
    ],
    order: [['transaction_date', 'DESC'], ['id', 'DESC']],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  return { entries: rows, total: count };
}

async function getStats() {
  const income = await db.IncomeExpense.sum('amount', { where: { type: 1 } });
  const expense = await db.IncomeExpense.sum('amount', { where: { type: 2 } });
  const totalBanks = await db.Bank.count({ where: { is_active: true } });
  const totalUsers = await db.IncomeExpense.count({ distinct: true, col: 'user_id' });
  return {
    income: income || 0,
    expense: expense || 0,
    balance: (income || 0) - (expense || 0),
    totalBanks,
    totalUsers,
  };
}

// Paginated bank/wallet accounts for the "Accounts" card grid, each annotated
// with a computed current_balance (opening_balance + income - expense on
// that account) so the card UI can show a real running balance.
async function listBanks({ page = 1, perPage = 8 } = {}) {
  const { rows, count } = await db.Bank.findAndCountAll({
    where: { is_active: true },
    include: [{ model: db.User, attributes: ['id', 'name', 'email'] }],
    order: [['id', 'DESC']],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  // Plain objects so the computed current_balance below is a normal,
  // directly-accessible property in views (not just in .dataValues).
  const banks = rows.map((b) => b.get({ plain: true }));

  if (banks.length) {
    const bankIds = banks.map((b) => b.id);
    const sums = await db.IncomeExpense.findAll({
      attributes: ['bank_id', 'type', [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']],
      where: { bank_id: { [Op.in]: bankIds } },
      group: ['bank_id', 'type'],
      raw: true,
    });
    const agg = {};
    sums.forEach((s) => {
      const bid = s.bank_id;
      if (!agg[bid]) agg[bid] = { income: 0, expense: 0 };
      if (Number(s.type) === 1) agg[bid].income = Number(s.total) || 0;
      else agg[bid].expense = Number(s.total) || 0;
    });
    banks.forEach((b) => {
      const a = agg[b.id] || { income: 0, expense: 0 };
      b.current_balance = Number(b.opening_balance) + a.income - a.expense;
    });
  }

  return { banks, total: count };
}

async function findEntryById(id) {
  return db.IncomeExpense.findByPk(id);
}

async function createEntry(data) {
  return db.IncomeExpense.create(data);
}

async function updateEntry(entry, data) {
  return entry.update(data);
}

async function deleteEntry(id) {
  return db.IncomeExpense.destroy({ where: { id } });
}

async function findBankById(id) {
  return db.Bank.findByPk(id);
}

async function createBank(data) {
  return db.Bank.create(data);
}

async function updateBank(bank, data) {
  return bank.update(data);
}

async function deleteBank(id) {
  return db.Bank.update({ is_active: false }, { where: { id } });
}

async function usersForFilter() {
  return db.User.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
}

// Lightweight, unpaginated lists for populating the Add/Edit Entry modal's
// account and category selects (client-side JS filters these by user/type).
async function allBanksForSelect() {
  return db.Bank.findAll({
    where: { is_active: true },
    attributes: ['id', 'name', 'user_id', 'account_number'],
    order: [['name', 'ASC']],
  });
}

async function allCategoriesForSelect() {
  return db.IncomeExpenseCategory.findAll({
    attributes: ['id', 'name', 'user_id', 'type'],
    order: [['name', 'ASC']],
  });
}

module.exports = {
  list,
  getStats,
  listBanks,
  findEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  findBankById,
  createBank,
  updateBank,
  deleteBank,
  usersForFilter,
  allBanksForSelect,
  allCategoriesForSelect,
};