'use strict';
const categoryRepo = require('../../repositories/admin/category.repository');
const { slugify } = require('../../helpers/slugify');

async function getList(search) {
  return categoryRepo.list(search);
}

async function createCategory(body) {
  let slug = (body.slug || '').trim() ? slugify(body.slug) : slugify(body.name);
  const existing = await categoryRepo.findBySlug(slug);
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  return categoryRepo.create({
    name: body.name.trim(),
    slug,
    display_order: parseInt(body.display_order, 10) || 0,
    status: body.status === 'on' || body.status === 'true' || body.status === '1',
  });
}

async function updateCategory(id, body) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }

  let slug = category.slug;
  if ((body.slug || '').trim() && slugify(body.slug) !== category.slug) {
    slug = slugify(body.slug);
    const existing = await categoryRepo.findBySlug(slug, id);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  return categoryRepo.update(category, {
    name: body.name.trim(),
    slug,
    display_order: parseInt(body.display_order, 10) || 0,
    status: body.status === 'on' || body.status === 'true' || body.status === '1',
  });
}

async function deleteCategory(id) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  const postCount = await categoryRepo.countPosts(id);
  if (postCount > 0) {
    const err = new Error(
      `Cannot delete "${category.name}" — it has ${postCount} post(s). Move or delete those posts first.`
    );
    err.status = 400;
    throw err;
  }
  return categoryRepo.destroy(category);
}

async function toggleStatus(id) {
  const category = await categoryRepo.findById(id);
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  category.status = !category.status;
  await category.save();
  return category;
}

module.exports = { getList, createCategory, updateCategory, deleteCategory, toggleStatus };
