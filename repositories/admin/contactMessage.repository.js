'use strict';
const db = require('../../models');

const PER_PAGE = 20;

async function list({ page = 1, status = '' } = {}) {
  const where = {};
  if (status === 'read') where.is_read = true;
  if (status === 'unread') where.is_read = false;

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.ContactMessage.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
  });
  return { rows, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.ContactMessage.findByPk(id);
}

async function destroy(message) {
  return message.destroy();
}

module.exports = { list, findById, destroy, PER_PAGE };
