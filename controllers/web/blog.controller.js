'use strict';
const blogService = require('../../services/web/blog.service');

async function list(req, res, next) {
  try {
    const data = await blogService.getBlogListing(req.query);
    res.render('web/blog-list', { title: 'Blog', ...data });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    const data = await blogService.getBlogDetail(req.params.slug, userId);
    if (!data) return res.status(404).render('errors/error', { status: 404, message: 'Blog Not Found' });
    res.render('web/blog-detail', { title: data.blog.title, ...data });
  } catch (err) {
    next(err);
  }
}

async function comment(req, res, next) {
  try {
    if (!req.session.user) {
      req.flash('error', 'Please login to comment.');
      return res.redirect('/login');
    }
    const content = (req.body.content || '').trim();
    if (content) {
      await blogService.postComment(req.params.slug, req.session.user.id, content);
    }
    res.redirect(`/blog/${req.params.slug}#comments`);
  } catch (err) {
    next(err);
  }
}

async function like(req, res, next) {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'Login required' });
    const result = await blogService.toggleLike(req.params.slug, req.session.user.id);
    res.json(result || { liked: false });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, comment, like };