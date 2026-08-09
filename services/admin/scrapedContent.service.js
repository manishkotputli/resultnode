'use strict';
const db = require('../../models');
const contentRepo = require('../../repositories/admin/scrapedContent.repository');
const postRepo = require('../../repositories/admin/post.repository');
const { slugify } = require('../../helpers/slugify');

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await contentRepo.list({
    page,
    status: query.status !== undefined ? query.status : 'draft',
    websiteId: query.website || '',
    search: (query.search || '').trim(),
  });
  return { items: rows, total: count, page, perPage };
}

async function getById(id) {
  return contentRepo.findById(id);
}

async function updateContent(id, body) {
  const log = await contentRepo.findById(id);
  if (!log) {
    const err = new Error('Scraped item not found');
    err.status = 404;
    throw err;
  }
  const scraped_data = {
    ...log.scraped_data,
    title: body.title || log.scraped_data.title,
    category_id: body.category_id || null,
    short_description: body.short_description || null,
    full_description: body.full_description || null,
    meta_title: body.meta_title || null,
    meta_description: body.meta_description || null,
    tags: body.tags || null,
  };
  await contentRepo.update(log, {
    post_title: scraped_data.title,
    scraped_data,
    status: 'draft',
  });
  return log;
}

async function publish(id) {
  const log = await contentRepo.findById(id);
  if (!log) {
    const err = new Error('Scraped item not found');
    err.status = 404;
    throw err;
  }
  const data = log.scraped_data || {};
  if (!data.category_id) {
    const err = new Error('Assign a Category before publishing (Edit this item first).');
    err.status = 400;
    throw err;
  }

  let slug = slugify(data.title || log.post_title);
  const existingSlug = await postRepo.findBySlug(slug);
  if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const post = await postRepo.create({
    category_id: data.category_id,
    title: data.title || log.post_title,
    slug,
    short_description: data.short_description || null,
    full_description: data.full_description || null,
    post_date: new Date(),
    status: true,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
  });

  await contentRepo.update(log, { status: 'published', post_id: post.id });
  return post;
}

async function reject(id) {
  const log = await contentRepo.findById(id);
  if (!log) {
    const err = new Error('Scraped item not found');
    err.status = 404;
    throw err;
  }
  return contentRepo.update(log, { status: 'rejected' });
}

async function remove(id) {
  const log = await contentRepo.findById(id);
  if (!log) {
    const err = new Error('Scraped item not found');
    err.status = 404;
    throw err;
  }
  return contentRepo.destroy(log);
}

async function bulkAction(ids, action) {
  const results = [];
  for (const id of ids) {
    try {
      if (action === 'publish') await publish(id);
      else if (action === 'reject') await reject(id);
      else if (action === 'delete') await remove(id);
      results.push({ id, ok: true });
    } catch (err) {
      results.push({ id, ok: false, error: err.message });
    }
  }
  return results;
}

module.exports = { getList, getById, updateContent, publish, reject, remove, bulkAction };
