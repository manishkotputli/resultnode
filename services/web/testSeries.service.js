'use strict';
const testSeriesRepo = require('../../repositories/web/testSeries.repository');
const dashboardRepo = require('../../repositories/web/dashboard.repository');

async function listTestSeries() {
  return testSeriesRepo.getActiveTestSeries();
}

async function getTestSeriesDetail(slug, userId) {
  const testSeries = await testSeriesRepo.findBySlug(slug);
  if (!testSeries) return null;
  const owned = userId ? !!(await testSeriesRepo.findAlreadyPurchased(userId, testSeries.id)) : false;
  return { testSeries, owned };
}

async function buyTestSeries(slug, userId) {
  const testSeries = await testSeriesRepo.findBySlug(slug);
  if (!testSeries) return null;
  const already = await testSeriesRepo.findAlreadyPurchased(userId, testSeries.id);
  if (already) return already;
  const price = testSeries.discount_price || testSeries.price;
  return dashboardRepo.createPurchase({ userId, type: 'test_series', id: testSeries.id, amount: price });
}

module.exports = { listTestSeries, getTestSeriesDetail, buyTestSeries };
