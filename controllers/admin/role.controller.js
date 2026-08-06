'use strict';
const roleService = require('../../services/admin/role.service');

async function index(req, res, next) {
  try {
    const roles = await roleService.getList((req.query.search || '').trim());
    res.render('admin/roles/index', {
      title: 'Roles & Permissions',
      active: 'roles',
      roles,
      search: req.query.search || '',
    });
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    await roleService.createRole(req.body);
    req.flash('success', 'Role created successfully.');
    res.redirect('/admin/roles');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/roles');
    }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await roleService.updateRole(req.params.id, req.body);
    req.flash('success', 'Role updated successfully.');
    res.redirect('/admin/roles');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/roles');
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await roleService.deleteRole(req.params.id);
    req.flash('success', 'Role deleted successfully.');
    res.redirect('/admin/roles');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/roles');
    }
    next(err);
  }
}

module.exports = { index, store, update, destroy };
