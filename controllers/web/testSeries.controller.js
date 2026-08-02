'use strict';
const testSeriesService = require('../../services/web/testSeries.service');

async function list(req, res, next) {
  try {
    const testSeriesList = await testSeriesService.listTestSeries();
    res.render('web/test-series/list', { title: 'Test Series', testSeriesList });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    const data = await testSeriesService.getTestSeriesDetail(req.params.slug, userId);
    if (!data) return res.status(404).render('errors/error', { status: 404, message: 'Test Series Not Found' });
    res.render('web/test-series/detail', { title: data.testSeries.title, ...data });
  } catch (err) {
    next(err);
  }
}

async function buy(req, res, next) {
  try {
    if (!req.session.user) {
      req.flash('error', 'Please login to purchase a test series.');
      return res.redirect('/login');
    }
    await testSeriesService.buyTestSeries(req.params.slug, req.session.user.id);
    req.flash('success', 'Test series purchased successfully!');
    res.redirect('/dashboard/purchases');
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, buy };
