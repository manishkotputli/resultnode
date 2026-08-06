'use strict';
const repo = require('../../repositories/admin/contactMessage.repository');

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await repo.list({ page, status: query.status || '' });
  return { messages: rows, total: count, page, perPage };
}

async function markRead(id) {
  const message = await repo.findById(id);
  if (!message) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }
  if (!message.is_read) {
    message.is_read = true;
    await message.save();
  }
  return message;
}

async function toggleRead(id) {
  const message = await repo.findById(id);
  if (!message) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }
  message.is_read = !message.is_read;
  await message.save();
  return message;
}

async function deleteMessage(id) {
  const message = await repo.findById(id);
  if (!message) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(message);
}

module.exports = { getList, markRead, toggleRead, deleteMessage };
