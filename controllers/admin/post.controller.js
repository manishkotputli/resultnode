'use strict';
const db = require('../../models');
const postService = require('../../services/admin/post.service');
const { buildPagination } = require('../../helpers/pagination');
const { groupDynamicFields } = require('../../helpers/dynamicFields');

async function index(req, res, next) {
  try {
    const { posts, total, page, perPage } = await postService.getList(req.query);
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    const pagination = buildPagination(page, total, perPage, '/admin/posts');

    res.render('admin/posts/index', {
      title: 'Posts',
      active: 'posts',
      posts,
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
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    res.render('admin/posts/form', {
      title: 'Add Post',
      active: 'add-post',
      mode: 'create',
      categories,
      post: null,
      fieldGroups: [],
      formAction: '/admin/posts',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    if (!req.body.title || !req.body.category_id) {
      req.flash('error', 'Title and Category are required.');
      return res.redirect('/admin/posts/create');
    }
    const post = await postService.createPost(req.body);
    req.flash('success', 'Post created successfully.');
    res.redirect(`/admin/posts/${post.id}/edit`);
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const data = await postService.getForEdit(req.params.id);
    if (!data) {
      req.flash('error', 'Post not found.');
      return res.redirect('/admin/posts');
    }
    const categories = await db.Category.findAll({ order: [['display_order', 'ASC']] });
    res.render('admin/posts/form', {
      title: 'Edit Post',
      active: 'posts',
      mode: 'edit',
      categories,
      post: data.post,
      fieldGroups: groupDynamicFields(data.fields),
      formAction: `/admin/posts/${data.post.id}/update`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.title || !req.body.category_id) {
      req.flash('error', 'Title and Category are required.');
      return res.redirect(`/admin/posts/${req.params.id}/edit`);
    }
    await postService.updatePost(req.params.id, req.body);
    req.flash('success', 'Post updated successfully.');
    res.redirect(`/admin/posts/${req.params.id}/edit`);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await postService.deletePost(req.params.id);
    req.flash('success', 'Post deleted successfully.');
    res.redirect('/admin/posts');
  } catch (err) {
    next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    await postService.toggleStatus(req.params.id);
    res.redirect(req.get('Referer') || '/admin/posts');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, createForm, store, editForm, update, destroy, toggleStatus };
