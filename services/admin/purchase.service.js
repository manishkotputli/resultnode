'use strict';
const repo = require('../../repositories/admin/purchase.repository');
const db = require('../../models');

const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const [{ purchases, total }, stats, users] = await Promise.all([
    repo.list({
      search: (query.search || '').trim(),
      type: query.type || '',
      status: query.status || '',
      userId: query.user || '',
      page,
    }),
    repo.getStats(),
    repo.usersForFilter(),
  ]);
  return { purchases, total, page, perPage: repo.PER_PAGE, stats, users };
}

async function getReceipt(id) {
  const purchase = await repo.findById(id);
  if (!purchase) {
    const err = new Error('Purchase not found');
    err.status = 404;
    throw err;
  }
  return purchase;
}

async function setStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error('Invalid status.');
    err.status = 400;
    throw err;
  }
  const purchase = await db.Purchase.findByPk(id);
  if (!purchase) {
    const err = new Error('Purchase not found');
    err.status = 404;
    throw err;
  }
  return repo.updateStatus(purchase, status);
}

module.exports = { getList, getReceipt, setStatus };
