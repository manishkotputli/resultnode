'use strict';
const coursesService = require('../../services/web/courses.service');

async function list(req, res, next) {
  try {
    const courses = await coursesService.listCourses();
    res.render('web/courses/list', { title: 'Courses', courses });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const userId = req.session.user ? req.session.user.id : null;
    const data = await coursesService.getCourseDetail(req.params.slug, userId);
    if (!data) return res.status(404).render('errors/error', { status: 404, message: 'Course Not Found' });
    res.render('web/courses/detail', { title: data.course.title, ...data });
  } catch (err) {
    next(err);
  }
}

async function buy(req, res, next) {
  try {
    if (!req.session.user) {
      req.flash('error', 'Please login to purchase a course.');
      return res.redirect('/login');
    }
    await coursesService.buyCourse(req.params.slug, req.session.user.id);
    req.flash('success', 'Course purchased successfully!');
    res.redirect('/dashboard/purchases');
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, buy };
