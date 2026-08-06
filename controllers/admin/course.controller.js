'use strict';
const courseService = require('../../services/admin/course.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { items, total, page, perPage } = await courseService.getList(req.query);
    const pagination = buildPagination(page, total, perPage, '/admin/courses');
    res.render('admin/courses/index', {
      title: 'Courses',
      active: 'courses',
      courses: items,
      total,
      pagination,
      filters: { search: req.query.search || '', status: req.query.status || '' },
    });
  } catch (err) {
    next(err);
  }
}

function createForm(req, res) {
  res.render('admin/courses/form', {
    title: 'Add Course',
    active: 'courses',
    mode: 'create',
    course: null,
    formAction: '/admin/courses',
  });
}

async function store(req, res, next) {
  try {
    await courseService.create(req.body, req.file);
    req.flash('success', 'Course created successfully.');
    res.redirect('/admin/courses');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/courses/create');
    }
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const course = await courseService.getById(req.params.id);
    if (!course) {
      req.flash('error', 'Course not found.');
      return res.redirect('/admin/courses');
    }
    res.render('admin/courses/form', {
      title: 'Edit Course',
      active: 'courses',
      mode: 'edit',
      course,
      formAction: `/admin/courses/${course.id}/update`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await courseService.update(req.params.id, req.body, req.file);
    req.flash('success', 'Course updated successfully.');
    res.redirect('/admin/courses');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/courses/${req.params.id}/edit`);
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await courseService.remove(req.params.id);
    req.flash('success', 'Course deleted successfully.');
    res.redirect('/admin/courses');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/courses');
    }
    next(err);
  }
}

// ---- Lessons ----

async function lessonsIndex(req, res, next) {
  try {
    const { course, lessons, total, page, nextNumber } = await courseService.getLessons(req.params.courseId, req.query);
    const pagination = buildPagination(page, total, 25, `/admin/courses/${course.id}/lessons`);
    res.render('admin/courses/lessons', {
      title: `Lessons - ${course.title}`,
      active: 'courses',
      course,
      lessons,
      total,
      pagination,
      nextLessonNumber: nextNumber,
    });
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/courses');
    }
    next(err);
  }
}

async function storeLesson(req, res, next) {
  try {
    await courseService.addLesson(req.params.courseId, req.body);
    req.flash('success', 'Lesson added successfully.');
    res.redirect(`/admin/courses/${req.params.courseId}/lessons`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/courses/${req.params.courseId}/lessons`);
    }
    next(err);
  }
}

async function updateLesson(req, res, next) {
  try {
    await courseService.editLesson(req.params.lessonId, req.body);
    req.flash('success', 'Lesson updated successfully.');
    res.redirect(`/admin/courses/${req.params.courseId}/lessons`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/courses/${req.params.courseId}/lessons`);
    }
    next(err);
  }
}

async function destroyLesson(req, res, next) {
  try {
    await courseService.removeLesson(req.params.lessonId);
    req.flash('success', 'Lesson deleted successfully.');
    res.redirect(`/admin/courses/${req.params.courseId}/lessons`);
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/courses/${req.params.courseId}/lessons`);
    }
    next(err);
  }
}

module.exports = {
  index, createForm, store, editForm, update, destroy,
  lessonsIndex, storeLesson, updateLesson, destroyLesson,
};
