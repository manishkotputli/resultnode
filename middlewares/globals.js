'use strict';
const db = require('../models');
const { formatDate, timeAgo } = require('../helpers/format');

// Mirrors AppServiceProvider::boot() in the Laravel app: site_setting is
// shared with every view, and navCategories is composed for every view too.
module.exports = async function globals(req, res, next) {
  try {
    const [setting, navCategories] = await Promise.all([
      db.Setting.findOne(),
      db.Category.findAll({ where: { status: true }, order: [['display_order', 'ASC'], ['id', 'ASC']] }),
    ]);
    res.locals.site_setting = setting;
    res.locals.navCategories = navCategories;
    res.locals.currentUser = req.session.user || null;
    res.locals.currentPath = req.path;
    res.locals.formatDate = formatDate;
    res.locals.timeAgo = timeAgo;
    res.locals.messages = { success: req.flash('success'), error: req.flash('error') };
    next();
  } catch (err) {
   console.error("========== MYSQL ERROR ==========");
    console.error(err);
    console.error(err.message);
    console.error(err.original);
    console.error(err.parent);
    console.error("================================");
    next(err);
  }
};
