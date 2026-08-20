'use strict';

const sitemapRepo = require('../../repositories/web/sitemap.repository');


/*
|--------------------------------------------------------------------------
| Get Base URL
|--------------------------------------------------------------------------
*/

function getBaseUrl(req) {

  const configuredUrl =
    process.env.APP_URL ||
    process.env.SITE_URL ||
    `${req.protocol}://${req.get('host')}`;

  return configuredUrl.replace(/\/+$/, '');
}


/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

function formatDate(date) {

  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}


/*
|--------------------------------------------------------------------------
| Escape XML
|--------------------------------------------------------------------------
*/

function escapeXml(value) {

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}


/*
|--------------------------------------------------------------------------
| Add URL Helper
|--------------------------------------------------------------------------
*/

function addUrl(
  urls,
  {
    loc,
    lastmod = null,
    changefreq = 'weekly',
    priority = '0.7',
  }
) {

  if (!loc) {
    return;
  }

  urls.push({
    loc,
    lastmod,
    changefreq,
    priority,
  });
}


/*
|--------------------------------------------------------------------------
| Sitemap Data
|--------------------------------------------------------------------------
*/

async function getSitemapData(req) {

  const baseUrl = getBaseUrl(req);

  const [
    blogs,
    blogCategories,

    posts,
    postCategories,

    courses,
    testSeries,
  ] = await Promise.all([

    sitemapRepo.getPublishedBlogs(),
    sitemapRepo.getBlogCategories(),

    sitemapRepo.getPublishedPosts(),
    sitemapRepo.getPostCategories(),

    sitemapRepo.getActiveCourses(),
    sitemapRepo.getActiveTestSeries(),

  ]);


  const urls = [];


  /*
  |--------------------------------------------------------------------------
  | Static Pages
  |--------------------------------------------------------------------------
  */

  addUrl(urls, {
    loc: `${baseUrl}/`,
    lastmod: formatDate(new Date()),
    changefreq: 'daily',
    priority: '1.0',
  });


  /*
  |--------------------------------------------------------------------------
  | Blog Main Page
  |--------------------------------------------------------------------------
  */

  addUrl(urls, {
    loc: `${baseUrl}/blogs`,
    lastmod: formatDate(new Date()),
    changefreq: 'daily',
    priority: '0.8',
  });


  /*
  |--------------------------------------------------------------------------
  | Post Main Page
  |--------------------------------------------------------------------------
  */

  addUrl(urls, {
    loc: `${baseUrl}/latest-jobs`,
    lastmod: formatDate(new Date()),
    changefreq: 'daily',
    priority: '0.9',
  });


  /*
  |--------------------------------------------------------------------------
  | BLOG CATEGORIES
  |--------------------------------------------------------------------------
  */

  blogCategories.forEach((category) => {

    if (!category.slug) {
      return;
    }

    addUrl(urls, {
      loc: `${baseUrl}/blog/category/${encodeURIComponent(category.slug)}`,
      changefreq: 'weekly',
      priority: '0.7',
    });

  });


  /*
  |--------------------------------------------------------------------------
  | BLOG POSTS
  |--------------------------------------------------------------------------
  */

  blogs.forEach((blog) => {

    if (!blog.slug) {
      return;
    }

    addUrl(urls, {
      loc: `${baseUrl}/blog/${encodeURIComponent(blog.slug)}`,
      lastmod: formatDate(blog.published_at),
      changefreq: 'weekly',
      priority: '0.8',
    });

  });


  /*
  |--------------------------------------------------------------------------
  | POST CATEGORIES
  |--------------------------------------------------------------------------
  */

  postCategories.forEach((category) => {

    if (!category.slug) {
      return;
    }

    addUrl(urls, {
      loc: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
      changefreq: 'daily',
      priority: '0.8',
    });

  });


  /*
  |--------------------------------------------------------------------------
  | POSTS
  |--------------------------------------------------------------------------
  */

  posts.forEach((post) => {

    if (!post.slug) {
      return;
    }

    const lastmod =
      post.updated_date ||
      post.post_date ||
      null;

    addUrl(urls, {
      loc: `${baseUrl}/post/${encodeURIComponent(post.slug)}`,
      lastmod: formatDate(lastmod),
      changefreq: 'daily',
      priority: '0.9',
    });

  });


  /*
  |--------------------------------------------------------------------------
  | COURSES
  |--------------------------------------------------------------------------
  */

  courses.forEach((course) => {

    if (!course.slug) {
      return;
    }

    addUrl(urls, {
      loc: `${baseUrl}/course/${encodeURIComponent(course.slug)}`,
      changefreq: 'weekly',
      priority: '0.7',
    });

  });


  /*
  |--------------------------------------------------------------------------
  | TEST SERIES
  |--------------------------------------------------------------------------
  */

  testSeries.forEach((series) => {

    if (!series.slug) {
      return;
    }

    addUrl(urls, {
      loc: `${baseUrl}/test-series/${encodeURIComponent(series.slug)}`,
      changefreq: 'weekly',
      priority: '0.7',
    });

  });


  return {
    baseUrl,
    urls,
  };
}


/*
|--------------------------------------------------------------------------
| Generate XML
|--------------------------------------------------------------------------
*/

function generateXml(urls) {

  const body = urls
    .map((url) => {

      return `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${
      url.lastmod
        ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>`
        : ''
    }
    ${
      url.changefreq
        ? `<changefreq>${url.changefreq}</changefreq>`
        : ''
    }
    ${
      url.priority
        ? `<priority>${url.priority}</priority>`
        : ''
    }
  </url>`;

    })
    .join('');


  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}


/*
|--------------------------------------------------------------------------
| Generate Sitemap
|--------------------------------------------------------------------------
*/

async function generateSitemap(req) {

  const {
    urls,
  } = await getSitemapData(req);

  return generateXml(urls);
}


module.exports = {
  getSitemapData,
  generateSitemap,
};