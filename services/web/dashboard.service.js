'use strict';
const dashboardRepo = require('../../repositories/web/dashboard.repository');
const coursesRepo = require('../../repositories/web/courses.repository');

async function getOverview(userId) {
  const [allPurchases, recentPurchases, totals, purchasedCourseIds] = await Promise.all([
    dashboardRepo.getPurchases(userId),
    dashboardRepo.getPurchasesWithTitles(userId, 5),
    dashboardRepo.getEntryTotals(userId),
    coursesRepo.getPurchasedCourseIds(userId),
  ]);
  const suggestedCourses = await coursesRepo.getSuggested(purchasedCourseIds, 4);
  return {
    purchaseCount: allPurchases.length,
    recentPurchases,
    suggestedCourses,
    totals: { ...totals, balance: totals.income - totals.expense },
  };
}

async function getPurchases(userId) {
  return dashboardRepo.getPurchasesWithTitles(userId);
}

async function getFinanceSettings(userId) {
  const [banks, categories] = await Promise.all([
    dashboardRepo.getBanks(userId),
    dashboardRepo.getCategories(userId),
  ]);
  return { banks, categories };
}

async function addBank(userId, data) {
  return dashboardRepo.createBank({ userId, name: data.name, accountNumber: data.account_number, openingBalance: data.opening_balance });
}

async function addCategory(userId, data) {
  return dashboardRepo.createCategory({ userId, name: data.name, type: Number(data.type) });
}

async function getIncomeExpense(userId) {
  const [entries, categories, banks, totals] = await Promise.all([
    dashboardRepo.getEntries(userId),
    dashboardRepo.getCategories(userId),
    dashboardRepo.getBanks(userId),
    dashboardRepo.getEntryTotals(userId),
  ]);
  return { entries, categories, banks, totals, balance: totals.income - totals.expense };
}

async function addEntry(userId, data) {
  return dashboardRepo.createEntry({
    userId,
    categoryId: data.category_id,
    bankId: data.bank_id || null,
    type: Number(data.type),
    title: data.title,
    amount: data.amount,
    note: data.note,
    date: data.transaction_date,
  });
}


async function getReceipt(userId, purchaseId) {
  const purchase = await dashboardRepo.getPurchaseById(userId, purchaseId);
  if (!purchase) {
    const err = new Error('Receipt not found');
    err.status = 404;
    throw err;
  }
  return purchase;
}
module.exports = {
  getOverview, getReceipt, getPurchases, getFinanceSettings, addBank, addCategory, getIncomeExpense, addEntry,
};