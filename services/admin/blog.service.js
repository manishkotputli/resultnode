'use strict';
const db = require('../../models');
const repo = require('../../repositories/admin/blog.repository');
const { slugify } = require('../../helpers/slugify');

function computeWordStats(content) {
  const text = String(content || '').replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  const word_count = words.length;
  const read_time = Math.max(1, Math.ceil(word_count / 200));
  return { word_count, read_time };
}

function resolveThumbnail(body, file, existing) {
  if (file) return `/uploads/blog/${file.filename}`;
  if (body.thumbnail_url && body.thumbnail_url.trim()) return body.thumbnail_url.trim();
  return existing || null;
}
async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await repo.list({
    page,
    search: (query.search || '').trim(),
    categoryId: query.category || '',
    status: query.status || '',
  });
  return { blogs: rows, total: count, page, perPage };
}

async function getById(id) {
  return repo.findById(id);
}

async function createBlog(body, file) {
  if (!body.title) {
    const err = new Error('Title is required.');
    err.status = 400;
    throw err;
  }
  let slug = (body.slug || '').trim() ? slugify(body.slug) : slugify(body.title);
  const existing = await repo.findBySlug(slug);
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const { word_count, read_time } = computeWordStats(body.content);
  const status = body.status === 'published' ? 'published' : 'draft';

  return repo.create({
    title: body.title.trim(),
    slug,
    short_description: body.short_description || null,
    content: body.content || null,
    thumbnail: resolveThumbnail(body, file, null),
    category_id: body.category_id || null,
    tags: body.tags || null,
    meta_title: body.meta_title || null,
    meta_keywords: body.meta_keywords || null,
    meta_description: body.meta_description || null,
    noindex: body.noindex === 'on',
    nofollow: body.nofollow === 'on',
    canonical_url: body.canonical_url || null,
    word_count,
    read_time,
    is_featured: body.is_featured === 'on',
    status,
    published_at: status === 'published' ? new Date() : null,
  });
}

async function updateBlog(id, body, file) {
  const blog = await repo.findById(id);
  if (!blog) {
    const err = new Error('Blog post not found');
    err.status = 404;
    throw err;
  }
  if (!body.title) {
    const err = new Error('Title is required.');
    err.status = 400;
    throw err;
  }

  let slug = blog.slug;
  if ((body.slug || '').trim() && slugify(body.slug) !== blog.slug) {
    slug = slugify(body.slug);
    const existing = await repo.findBySlug(slug, id);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const { word_count, read_time } = computeWordStats(body.content);
  const status = body.status === 'published' ? 'published' : 'draft';
  const becomingPublished = status === 'published' && blog.status !== 'published';

  const data = {
    title: body.title.trim(),
    slug,
    short_description: body.short_description || null,
    content: body.content || null,
    category_id: body.category_id || null,
    tags: body.tags || null,
    meta_title: body.meta_title || null,
    meta_keywords: body.meta_keywords || null,
    meta_description: body.meta_description || null,
    noindex: body.noindex === 'on',
    nofollow: body.nofollow === 'on',
    canonical_url: body.canonical_url || null,
    word_count,
    read_time,
    is_featured: body.is_featured === 'on',
    status,
  };
const resolved = resolveThumbnail(body, file, blog.thumbnail);
if (resolved !== blog.thumbnail) data.thumbnail = resolved;
  if (becomingPublished) data.published_at = new Date();

  return repo.update(blog, data);
}

async function deleteBlog(id) {
  const blog = await repo.findById(id);
  if (!blog) {
    const err = new Error('Blog post not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(blog);
}

module.exports = { getList, getById, createBlog, updateBlog, deleteBlog };
