'use strict';
const db = require('../../models');

async function getActiveTestSeries() {
  return db.TestSeries.findAll({ where: { is_active: true }, order: [['id', 'DESC']] });
}

async function findBySlug(slug) {
  return db.TestSeries.findOne({ where: { slug, is_active: true } });
}

async function findAlreadyPurchased(userId, testSeriesId) {
  return db.Purchase.findOne({
    where: { user_id: userId, purchasable_type: 'test_series', purchasable_id: testSeriesId, payment_status: 'completed' },
  });
}

module.exports = { getActiveTestSeries, findBySlug, findAlreadyPurchased };
