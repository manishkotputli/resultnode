'use strict';
const db = require('../../models');

async function createPurchase({ userId, type, id, amount }) {
  const purchase = await db.Purchase.create({
    user_id: userId,
    purchasable_type: type,
    purchasable_id: id,
    amount,
    payment_status: 'completed', // TODO: replace with real gateway callback
    payment_method: 'demo',
    transaction_id: `DEMO-${Date.now()}`,
    purchased_at: new Date(),
  });
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderId = `ORD-${datePart}-${String(purchase.id).padStart(5, '0')}`;
  await purchase.update({ order_id: orderId });
  return purchase;
}

async function getPurchases(userId) {
  return db.Purchase.findAll({ where: { user_id: userId }, order: [['created_at', 'DESC']] });
}

// Purchase is polymorphic (purchasable_type/purchasable_id) so Sequelize can't
// eager-load the title directly - resolve it with two small batch queries.
async function getPurchasesWithTitles(userId, limit) {
  const purchases = await db.Purchase.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: limit || undefined,
  });
  const courseIds = purchases.filter((p) => p.purchasable_type === 'course').map((p) => p.purchasable_id);
  const testIds = purchases.filter((p) => p.purchasable_type === 'test_series').map((p) => p.purchasable_id);
  const [courses, testSeries] = await Promise.all([
    courseIds.length ? db.Course.findAll({ where: { id: courseIds } }) : [],
    testIds.length ? db.TestSeries.findAll({ where: { id: testIds } }) : [],
  ]);
  return purchases.map((p) => {
    const source = p.purchasable_type === 'course' ? courses : testSeries;
    const match = source.find((s) => s.id === p.purchasable_id);
    return {
      ...p.toJSON(),
      title: match ? match.title : `${p.purchasable_type === 'course' ? 'Course' : 'Test Series'} #${p.purchasable_id}`,
      linkUrl: match ? `/${p.purchasable_type === 'course' ? 'courses' : 'test-series'}/${match.slug}` : '#',
    };
  });
}

async function getBanks(userId) {
  return db.Bank.findAll({ where: { user_id: userId, is_active: true }, order: [['id', 'ASC']] });
}

async function createBank({ userId, name, accountNumber, openingBalance }) {
  return db.Bank.create({ user_id: userId, name, account_number: accountNumber, opening_balance: openingBalance || 0 });
}

async function getCategories(userId) {
  return db.IncomeExpenseCategory.findAll({ where: { user_id: userId }, order: [['id', 'ASC']] });
}

async function createCategory({ userId, name, type }) {
  return db.IncomeExpenseCategory.create({ user_id: userId, name, type });
}

async function getEntries(userId) {
  return db.IncomeExpense.findAll({
    where: { user_id: userId },
    include: [{ model: db.IncomeExpenseCategory }, { model: db.Bank }],
    order: [['transaction_date', 'DESC'], ['id', 'DESC']],
  });
}

async function createEntry({ userId, categoryId, bankId, type, title, amount, note, date }) {
  return db.IncomeExpense.create({
    user_id: userId, category_id: categoryId, bank_id: bankId || null,
    type, title, amount, note, transaction_date: date,
  });
}

async function getEntryTotals(userId) {
  const income = await db.IncomeExpense.sum('amount', { where: { user_id: userId, type: 1 } });
  const expense = await db.IncomeExpense.sum('amount', { where: { user_id: userId, type: 2 } });
  return { income: income || 0, expense: expense || 0 };
}

module.exports = {
  createPurchase, getPurchases, getPurchasesWithTitles, getBanks, createBank,
  getCategories, createCategory, getEntries, createEntry, getEntryTotals,
};