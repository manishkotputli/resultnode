'use strict';
const coursesRepo = require('../../repositories/web/courses.repository');
const dashboardRepo = require('../../repositories/web/dashboard.repository');

async function listCourses() {
  return coursesRepo.getActiveCourses();
}

async function getCourseDetail(slug, userId) {
  const course = await coursesRepo.findBySlug(slug);
  if (!course) return null;
  const owned = userId ? !!(await coursesRepo.findAlreadyPurchased(userId, course.id)) : false;
  return { course, owned };
}

async function buyCourse(slug, userId) {
  const course = await coursesRepo.findBySlug(slug);
  if (!course) return null;
  const already = await coursesRepo.findAlreadyPurchased(userId, course.id);
  if (already) return already;
  const price = course.discount_price || course.price;
  return dashboardRepo.createPurchase({ userId, type: 'course', id: course.id, amount: price });
}

module.exports = { listCourses, getCourseDetail, buyCourse };
