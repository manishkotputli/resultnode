'use strict';

module.exports = function maintenanceMode(req, res, next) {
  const setting = res.locals.site_setting;
  if (setting && setting.maintenance_mode) {
    return res.status(503).render('web/maintenance', {
      title: setting.maintenance_title || 'Site Under Maintenance',
      message: setting.maintenance_message || "We'll be back shortly.",
      layout: false,
    });
  }
  next();
};
