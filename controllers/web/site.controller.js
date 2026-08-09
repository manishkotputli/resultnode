'use strict';
const siteService = require('../../services/web/site.service');

async function home(req, res, next) {
  try {
    const data = await siteService.getHomeData();
    res.render('web/home', { title: res.locals.site_setting?.site_title || 'Sarkari Result', ...data });
  } catch (err) {
    next(err);
  }
}

async function categoryPage(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await siteService.getCategoryPage(req.params.slug, page);
    if (!data) return res.status(404).render('errors/error', { status: 404, message: 'Category Not Found' });
    res.render('web/category', { title: data.category.name, ...data });
  } catch (err) {
    next(err);
  }
}

async function postDetail(req, res, next) {
  try {
    const viewerCtx = {
      userId: req.session.user ? req.session.user.id : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
    };
    const data = await siteService.getPostDetail(req.params.slug, viewerCtx);
if (!data) return res.status(404).render('errors/error', { status: 404, message: 'Post Not Found' });
const fallbackDescription = (data.post.short_description || '').replace(/<[^>]*>/g, '').trim().slice(0, 160);
res.render('web/post-detail', {
  title: data.post.meta_title || data.post.title,
  metaDescription: data.post.meta_description || fallbackDescription,
  metaKeywords: data.post.meta_keywords || '',
  ...data,
});
  } catch (err) {
    next(err);
  }
}

async function trackLinkClick(req, res, next) {
  try {
    const link = await require('../../models').PostLink.findByPk(req.params.linkId);
    if (!link) return res.redirect('/');
    const viewerCtx = {
      userId: req.session.user ? req.session.user.id : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
    };
    await siteService.trackLinkClick(link.post_id, viewerCtx);
    res.redirect(link.url);
  } catch (err) {
    next(err);
  }
}

module.exports = { home, categoryPage, postDetail, trackLinkClick };
