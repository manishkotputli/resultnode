'use strict';
const userService = require('../../services/admin/user.service');
const roleService = require('../../services/admin/role.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { users, total, page, perPage } = await userService.getList(req.query);
    const roles = await roleService.allForSelect();
    const pagination = buildPagination(page, total, perPage, '/admin/users');

    res.render('admin/users/index', {
      title: 'Users',
      active: 'users',
      users,
      total,
      roles,
      pagination,
      filters: {
        search: req.query.search || '',
        role: req.query.role || '',
        status: req.query.status || '',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createForm(req, res, next) {
  try {
    const roles = await roleService.allForSelect();
    res.render('admin/users/form', {
      title: 'Add User',
      active: 'users',
      mode: 'create',
      roles,
      user: null,
      formAction: '/admin/users',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    await userService.createUser(req.body);
    req.flash('success', 'User created successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/users/create');
    }
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/admin/users');
    }
    const roles = await roleService.allForSelect();
    res.render('admin/users/form', {
      title: 'Edit User',
      active: 'users',
      mode: 'edit',
      roles,
      user,
      formAction: `/admin/users/${user.id}/update`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await userService.updateUser(req.params.id, req.body, req.session.admin.id);
    req.flash('success', 'User updated successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/users/${req.params.id}/edit`);
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await userService.deleteUser(req.params.id, req.session.admin.id);
    req.flash('success', 'User deleted successfully.');
    res.redirect('/admin/users');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/users');
    }
    next(err);
  }
}

async function toggleStatus(req, res, next) {
  try {
    await userService.toggleStatus(req.params.id, req.session.admin.id);
    res.redirect(req.get('Referer') || '/admin/users');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(req.get('Referer') || '/admin/users');
    }
    next(err);
  }
}

module.exports = { index, createForm, store, editForm, update, destroy, toggleStatus };
