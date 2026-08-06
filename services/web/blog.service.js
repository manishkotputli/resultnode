'use strict';
const blogRepo = require('../../repositories/web/blog.repository');

async function getBlogListing(query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const sort = query.sort === 'popular' ? 'popular' : 'latest';
  const search = query.q ? query.q.trim() : null;
  const categorySlug = query.category || null;

  const [{ blogs, totalPages, totalCount, currentPage }, categories, popularBlogs] = await Promise.all([
    blogRepo.getPublishedBlogs({ page, perPage: 4, categorySlug, search, sort }),
    blogRepo.getCategoriesWithCount(),
    blogRepo.getPopularBlogs(4),
  ]);

  return { blogs, totalPages, totalCount, currentPage, categories, popularBlogs, activeCategory: categorySlug, sort, search };
}

async function getBlogDetail(slug, userId) {
  const blog = await blogRepo.findBlogBySlug(slug);
  if (!blog) return null;
  await blogRepo.incrementBlogViews(blog.id);
  const [relatedBlogs, comments, liked, categories, popularBlogs] = await Promise.all([
    blogRepo.getRelatedBlogs(blog.category_id, blog.id, 3),
    blogRepo.getApprovedComments(blog.id),
    blogRepo.hasLiked(blog.id, userId),
    blogRepo.getCategoriesWithCount(),
    blogRepo.getPopularBlogs(4),
  ]);
  return { blog, relatedBlogs, comments, liked, categories, popularBlogs };
}

async function postComment(slug, userId, content) {
  const blog = await blogRepo.findBlogBySlug(slug);
  if (!blog) return null;
  return blogRepo.addComment({ blogId: blog.id, userId, content });
}

async function toggleLike(slug, userId) {
  const blog = await blogRepo.findBlogBySlug(slug);
  if (!blog) return null;
  return blogRepo.toggleLike({ blogId: blog.id, userId });
}

module.exports = { getBlogListing, getBlogDetail, postComment, toggleLike };