'use strict';
const db = require('../../models');
const postRepo = require('../../repositories/admin/post.repository');
const { slugify } = require('../../helpers/slugify');

function parseLinksFromBody(body) {
  const labels = [].concat(body.links_label || []);
  const urls = [].concat(body.links_url || []);
  const links = [];
  labels.forEach((label, i) => {
    const url = urls[i];
    if (label && label.trim() && url && url.trim()) {
      links.push({ label: label.trim(), url: url.trim(), order_no: i });
    }
  });
  return links;
}

function parseDynamicFieldsFromBody(body) {
  const groups = [].concat(body.fields_group || []);
  const labels = [].concat(body.fields_label || []);
  const types = [].concat(body.fields_type || []);
  const values = [].concat(body.fields_value || []);
  const fields = [];
  labels.forEach((label, i) => {
    if (label && label.trim()) {
      fields.push({
        group_name: (groups[i] || 'Details').trim(),
        field_label: label.trim(),
        field_type: types[i] || 'text',
        field_value: values[i] || '',
        sort_order: i,
      });
    }
  });
  return fields;
}

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await postRepo.list({
    page,
    search: (query.search || '').trim(),
    categorySlug: query.category || '',
    status: query.status || '',
  });
  return { posts: rows, total: count, page, perPage };
}

async function getForEdit(id) {
  const post = await postRepo.findById(id);
  if (!post) return null;
  const fields = await postRepo.findDynamicFields(id);
  return { post, fields };
}

async function createPost(body) {
  let slug = (body.slug || '').trim() ? slugify(body.slug) : slugify(body.title);
  const existing = await postRepo.findBySlug(slug);
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const links = parseLinksFromBody(body);
  const fields = parseDynamicFieldsFromBody(body);

  return db.sequelize.transaction(async (t) => {
    const post = await postRepo.create(
      {
        category_id: body.category_id,
        title: body.title.trim(),
        slug,
        short_description: body.short_description || null,
        full_description: body.full_description || null,
        post_date: body.post_date || null,
        updated_date: body.updated_date || null,
        status: body.status === 'on' || body.status === 'true' || body.status === '1',
        is_marquee: body.is_marquee === 'on',
        is_top: body.is_top === 'on',
        highlight_color: body.highlight_color || null,
        meta_title: body.meta_title || null,
        meta_keywords: body.meta_keywords || null,
        meta_description: body.meta_description || null,
      },
      t
    );
    await postRepo.replaceLinks(post.id, links, t);
    await postRepo.replaceDynamicFields(post.id, fields, t);
    return post;
  });
}

async function updatePost(id, body) {
  const post = await postRepo.findById(id);
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }

  let slug = post.slug;
  if ((body.slug || '').trim() && slugify(body.slug) !== post.slug) {
    slug = slugify(body.slug);
    const existing = await postRepo.findBySlug(slug, id);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const links = parseLinksFromBody(body);
  const fields = parseDynamicFieldsFromBody(body);

  return db.sequelize.transaction(async (t) => {
    await postRepo.update(
      post,
      {
        category_id: body.category_id,
        title: body.title.trim(),
        slug,
        short_description: body.short_description || null,
        full_description: body.full_description || null,
        post_date: body.post_date || null,
        updated_date: body.updated_date || null,
        status: body.status === 'on' || body.status === 'true' || body.status === '1',
        is_marquee: body.is_marquee === 'on',
        is_top: body.is_top === 'on',
        highlight_color: body.highlight_color || null,
        meta_title: body.meta_title || null,
        meta_keywords: body.meta_keywords || null,
        meta_description: body.meta_description || null,
      },
      t
    );
    await postRepo.replaceLinks(post.id, links, t);
    await postRepo.replaceDynamicFields(post.id, fields, t);
    return post;
  });
}

async function deletePost(id) {
  const post = await postRepo.findById(id);
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  return db.sequelize.transaction((t) => postRepo.destroy(post, t));
}

async function toggleStatus(id) {
  const post = await postRepo.findById(id);
  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }
  post.status = !post.status;
  await post.save();
  return post;
}

module.exports = { getList, getForEdit, createPost, updatePost, deletePost, toggleStatus };
