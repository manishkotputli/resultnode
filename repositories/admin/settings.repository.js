'use strict';
const db = require('../../models');

async function get() {
  let setting = await db.Setting.findOne();
  if (!setting) {
    setting = await db.Setting.create({ site_title: 'Sarkari Result' });
  }
  return setting;
}

async function update(setting, data) {
  return setting.update(data);
}

module.exports = { get, update };
