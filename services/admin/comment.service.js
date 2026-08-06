'use strict';
const repo = require('../../repositories/admin/comment.repository');

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await repo.list({
    page,
    type: query.type || '',
    status: query.status || '',
  });
  return { comments: rows, total: count, page, perPage };
}

async function toggleApproval(id) {
  const comment = await repo.findById(id);
  if (!comment) {
    const err = new Error('Comment not found');
    err.status = 404;
    throw err;
  }
  comment.is_approved = !comment.is_approved;
  await comment.save();
  return comment;
}

async function deleteComment(id) {
  const comment = await repo.findById(id);
  if (!comment) {
    const err = new Error('Comment not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(comment);
}

module.exports = { getList, toggleApproval, deleteComment };
