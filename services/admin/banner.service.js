'use strict';
const repo = require('../../repositories/admin/banner.repository');

async function getList(search) {
  return repo.list(search);
}

async function createBanner(body) {
  if (!body.text) {
    const err = new Error('Banner text is required.');
    err.status = 400;
    throw err;
  }
  return repo.create({
    text: body.text.trim(),
    url: body.url || null,
    color: body.color || null,
    status: body.status === 'on' || body.status === 'true' || body.status === '1',
  });
}

async function updateBanner(id, body) {
  const banner = await repo.findById(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.status = 404;
    throw err;
  }
  if (!body.text) {
    const err = new Error('Banner text is required.');
    err.status = 400;
    throw err;
  }
  return repo.update(banner, {
    text: body.text.trim(),
    url: body.url || null,
    color: body.color || null,
    status: body.status === 'on' || body.status === 'true' || body.status === '1',
  });
}

async function deleteBanner(id) {
  const banner = await repo.findById(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(banner);
}

async function toggleStatus(id) {
  const banner = await repo.findById(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.status = 404;
    throw err;
  }
  banner.status = !banner.status;
  await banner.save();
  return banner;
}

module.exports = { getList, createBanner, updateBanner, deleteBanner, toggleStatus };
