'use strict';
const service = require('../../services/admin/comment.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { comments, total, page, perPage } = await service.getList(req.query);
    const pagination = buildPagination(page, total, perPage, '/admin/comments');
    res.render('admin/comments/index', {
      title: 'Comments',
      active: 'comments',
      comments,
      total,
      pagination,
      filters: { type: req.query.type || '', status: req.query.status || '' },
    });
  } catch (err) {
    next(err);
  }
}

async function toggleApproval(req, res, next) {
  try {
    await service.toggleApproval(req.params.id);
    res.redirect(req.get('Referer') || '/admin/comments');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await service.deleteComment(req.params.id);
    req.flash('success', 'Comment deleted successfully.');
    res.redirect('/admin/comments');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/comments');
    }
    next(err);
  }
}

module.exports = { index, toggleApproval, destroy };
