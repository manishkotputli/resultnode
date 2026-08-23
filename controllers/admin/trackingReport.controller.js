'use strict';

const service = require('../../services/admin/trackingReport.service');

/* ==========================================================================
 * Helpers
 * ========================================================================== */

function getAdminId(req) {
  return (
    req &&
    req.session &&
    req.session.admin &&
    req.session.admin.id
  );
}

/* ==========================================================================
 * Page
 * ========================================================================== */

async function index(req, res, next) {
  try {
    const adminId =
      getAdminId(req);

    if (!adminId) {
      return res.redirect('/admin/login');
    }

    const data =
      await service.getDashboardData(
        adminId,
        req.query || {}
      );

    return res.render(
      'admin/tracking-report/index',
      {
        title: 'Tracking Report',

        active: 'tracking-report',

        data,
      }
    );
  } catch (error) {
    return next(error);
  }
}

/* ==========================================================================
 * AJAX / JSON endpoint
 * ========================================================================== */

async function data(req, res, next) {
  try {
    const adminId =
      getAdminId(req);

    if (!adminId) {
      return res.status(401).json({
        ok: false,
        error: 'Admin session expired.',
      });
    }

    const dashboardData =
      await service.getDashboardData(
        adminId,
        req.query || {}
      );

    return res.json({
      ok: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error(
      'Tracking Report AJAX Error:',
      error
    );

    return res.status(500).json({
      ok: false,

      error:
        process.env.NODE_ENV === 'production'
          ? 'Unable to load tracking report.'
          : error.message,
    });
  }
}

module.exports = {
  index,
  data,
};