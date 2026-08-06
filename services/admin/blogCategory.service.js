'use strict';
const repo = require('../../repositories/admin/blogCategory.repository');
const { slugify } = require('../../helpers/slugify');

async function getList(search) {
  return repo.list(search);
}

async function allForSelect() {
  return repo.allForSelect();
}

async function createCategory(body) {
  if (!body.name) {
    const err = new Error('Category name is required.');
    err.status = 400;
    throw err;
  }
  let slug = (body.slug || '').trim() ? slugify(body.slug) : slugify(body.name);
  const existing = await repo.findBySlug(slug);
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  return repo.create({ name: body.name.trim(), slug });
}

async function updateCategory(id, body) {
  const cat = await repo.findById(id);
  if (!cat) {
    const err = new Error('Blog category not found');
    err.status = 404;
    throw err;
  }
  if (!body.name) {
    const err = new Error('Category name is required.');
    err.status = 400;
    throw err;
  }
  let slug = cat.slug;
  if ((body.slug || '').trim() && slugify(body.slug) !== cat.slug) {
    slug = slugify(body.slug);
    const existing = await repo.findBySlug(slug, id);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }
  return repo.update(cat, { name: body.name.trim(), slug });
}

async function deleteCategory(id) {
  const cat = await repo.findById(id);
  if (!cat) {
    const err = new Error('Blog category not found');
    err.status = 404;
    throw err;
  }
  const blogCount = await repo.countBlogs(id);
  if (blogCount > 0) {
    const err = new Error(`Cannot delete "${cat.name}" — it has ${blogCount} blog post(s).`);
    err.status = 400;
    throw err;
  }
  return repo.destroy(cat);
}

module.exports = { getList, allForSelect, createCategory, updateCategory, deleteCategory };
