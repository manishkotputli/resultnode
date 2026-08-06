'use strict';
const db = require('../../models');
const blogService = require('../../services/admin/blog.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { blogs, total, page, perPage } = await blogService.getList(req.query);
    const categories = await db.BlogCategory.findAll({ order: [['name', 'ASC']] });
    const pagination = buildPagination(page, total, perPage, '/admin/blogs');

    res.render('admin/blogs/index', {
      title: 'Blog Posts',
      active: 'blogs',
      blogs,
      total,
      categories,
      pagination,
      filters: {
        search: req.query.search || '',
        category: req.query.category || '',
        status: req.query.status || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createForm(req, res, next) {
  try {
    const categories = await db.BlogCategory.findAll({ order: [['name', 'ASC']] });
    res.render('admin/blogs/form', {
      title: 'Add Blog Post',
      active: 'add-blog',
      mode: 'create',
      categories,
      blog: null,
      formAction: '/admin/blogs',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const blog = await blogService.createBlog(req.body, req.file);
    req.flash('success', 'Blog post created successfully.');
    res.redirect(`/admin/blogs/${blog.id}/edit`);
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/blogs/create');
    }
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const blog = await blogService.getById(req.params.id);
    if (!blog) {
      req.flash('error', 'Blog post not found.');
      return res.redirect('/admin/blogs');
    }
    const categories = await db.BlogCategory.findAll({ order: [['name', 'ASC']] });
    res.render('admin/blogs/form', {
      title: 'Edit Blog Post',
      active: 'blogs',
      mode: 'edit',
      categories,
      blog,
      formAction: `/admin/blogs/${blog.id}/update`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await blogService.updateBlog(req.params.id, req.body, req.file);
    req.flash('success', 'Blog post updated successfully.');
    res.redirect(`/admin/blogs/${req.params.id}/edit`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/blogs/${req.params.id}/edit`);
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await blogService.deleteBlog(req.params.id);
    req.flash('success', 'Blog post deleted successfully.');
    res.redirect('/admin/blogs');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/blogs');
    }
    next(err);
  }
}

module.exports = { index, createForm, store, editForm, update, destroy };
