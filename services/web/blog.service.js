'use strict';
const blogRepo = require('../../repositories/web/blog.repository');

async function getBlogListing() {
  const blogs = await blogRepo.getPublishedBlogs(14);
  return {
    featured: blogs[0],
    grid1: blogs.slice(1, 5),
    grid2: blogs.slice(5, 8),
    grid3: blogs.slice(8, 11),
  };
}

async function getBlogDetail(slug, userId) {
  const blog = await blogRepo.findBlogBySlug(slug);
  if (!blog) return null;
  await blogRepo.incrementBlogViews(blog.id);
  const [relatedBlogs, comments, liked] = await Promise.all([
    blogRepo.getRelatedBlogs(blog.category_id, blog.id, 6),
    blogRepo.getApprovedComments(blog.id),
    blogRepo.hasLiked(blog.id, userId),
  ]);
  return { blog, relatedBlogs, comments, liked };
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
