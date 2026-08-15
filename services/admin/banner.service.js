'use strict';
const repo = require('../../repositories/admin/banner.repository');

async function getList(search) {
  return repo.list(search);
}

async function createBanner(body, file) {
  const imagePath = file ? `/uploads/banners/${file.filename}` : null;

  // Validation: At least Text or Image should be present
  if (!body.text && !imagePath) {
    const err = new Error('Either Banner text or an Image is required.');
    err.status = 400;
    throw err;
  }

  return repo.create({
    text: body.text ? body.text.trim() : null,
    url: body.url || null,
    color: body.color || null,
    image: imagePath,
    status: body.status === 'on' || body.status === 'true' || body.status === '1' || body.status === true,
  });
}

async function updateBanner(id, body, file) {
  const banner = await repo.findById(id);
  if (!banner) {
    const err = new Error('Banner not found');
    err.status = 404;
    throw err;
  }

  const imagePath = file ? `/uploads/banners/${file.filename}` : banner.image;

  if (!body.text && !imagePath) {
    const err = new Error('Either Banner text or an Image is required.');
    err.status = 400;
    throw err;
  }

  return repo.update(banner, {
    text: body.text ? body.text.trim() : null,
    url: body.url || null,
    color: body.color || null,
    image: imagePath,
    status: body.status === 'on' || body.status === 'true' || body.status === '1' || body.status === true,
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