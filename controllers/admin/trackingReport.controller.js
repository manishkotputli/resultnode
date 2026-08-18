'use strict';
const service = require('../../services/admin/trackingReport.service');

async function index(req, res, next) {
  try {
    const data = await service.getDashboardData(req.session.admin.id, req.query);
    res.render('admin/tracking-report/index', {
      title: 'Tracking Report',
      active: 'tracking-report',
      data,
    });
  } catch (err) {
    next(err);
  }
}

// AJAX/data endpoint — used by the date filter to refresh the dashboard
// without a full page reload. Returns the exact same payload shape used
// to render the page initially.
async function data(req, res, next) {
  try {
    const data = await service.getDashboardData(req.session.admin.id, req.query);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = { index, data };
