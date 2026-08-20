'use strict';

const sitemapService = require('../../services/web/sitemap.service');


async function index(req, res, next) {

  try {

    const xml = await sitemapService.generateSitemap(req);

    res.status(200);

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',

      // Browser/CDN cache
      'Cache-Control': 'public, max-age=3600',
    });

    return res.send(xml);

  } catch (err) {

    next(err);

  }

}


module.exports = {
  index,
};