'use strict';
const service = require('../../services/admin/settings.service');

async function edit(req, res, next) {
  try {
    const setting = await service.getSettings();
    res.render('admin/settings/index', {
      title: 'Settings',
      active: 'settings',
      setting,
      tab: req.query.tab || 'general',
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await service.updateSettings(req.body, req.files);
    req.flash('success', 'Settings updated successfully.');
    res.redirect(`/admin/settings?tab=${req.query.tab || req.body._tab || 'general'}`);
  } catch (err) {
    next(err);
  }
}

module.exports = { edit, update };
