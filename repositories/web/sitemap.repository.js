'use strict';

const db = require('../../models');

/*
|--------------------------------------------------------------------------
| BLOGS
|--------------------------------------------------------------------------
*/

async function getPublishedBlogs() {
  return db.Blog.findAll({
    attributes: [
      'slug',
      'published_at',
    ],
    where: {
      status: 'published',
    },
    order: [['published_at', 'DESC']],
    raw: true,
  });
}

/*
|--------------------------------------------------------------------------
| BLOG CATEGORIES
|--------------------------------------------------------------------------
*/

async function getBlogCategories() {
  return db.BlogCategory.findAll({
    attributes: [
      'slug',
    ],
    order: [['name', 'ASC']],
    raw: true,
  });
}


/*
|--------------------------------------------------------------------------
| POSTS
|--------------------------------------------------------------------------
*/

async function getPublishedPosts() {
  return db.Post.findAll({
    attributes: [
      'slug',
      'post_date',
      'updated_date',
    ],
    where: {
      status: true,
    },
    order: [
      ['post_date', 'DESC'],
    ],
    raw: true,
  });
}


/*
|--------------------------------------------------------------------------
| POST CATEGORIES
|--------------------------------------------------------------------------
*/

async function getPostCategories() {
  return db.Category.findAll({
    attributes: [
      'slug',
      'display_order',
    ],
    where: {
      status: true,
    },
    order: [
      ['display_order', 'ASC'],
      ['name', 'ASC'],
    ],
    raw: true,
  });
}


/*
|--------------------------------------------------------------------------
| COURSES
|--------------------------------------------------------------------------
| Future / Optional
|--------------------------------------------------------------------------
*/

async function getActiveCourses() {
  return db.Course.findAll({
    attributes: [
      'slug',
    ],
    where: {
      is_active: true,
    },
    raw: true,
  });
}


/*
|--------------------------------------------------------------------------
| TEST SERIES
|--------------------------------------------------------------------------
| Future / Optional
|--------------------------------------------------------------------------
*/

async function getActiveTestSeries() {
  return db.TestSeries.findAll({
    attributes: [
      'slug',
    ],
    where: {
      is_active: true,
    },
    raw: true,
  });
}


module.exports = {
  getPublishedBlogs,
  getBlogCategories,

  getPublishedPosts,
  getPostCategories,

  getActiveCourses,
  getActiveTestSeries,
};