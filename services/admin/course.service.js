'use strict';
const repo = require('../../repositories/admin/course.repository');
const { slugify } = require('../../helpers/slugify');

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const { rows, count, perPage } = await repo.list({
    page,
    search: (query.search || '').trim(),
    status: query.status || '',
  });
  return { items: rows, total: count, page, perPage };
}

async function getById(id) {
  return repo.findById(id);
}

function validate(body) {
  if (!body.title || !body.price) {
    const err = new Error('Title and Price are required.');
    err.status = 400;
    throw err;
  }
}

async function create(body, file) {
  validate(body);
  let slug = (body.slug || '').trim() ? slugify(body.slug) : slugify(body.title);
  const existing = await repo.findBySlug(slug);
  if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  return repo.create({
    title: body.title.trim(),
    slug,
    description: body.description || null,
    thumbnail: file ? `/uploads/course/${file.filename}` : null,
    price: parseFloat(body.price),
    discount_price: body.discount_price ? parseFloat(body.discount_price) : null,
    is_active: body.is_active === 'on' || body.is_active === undefined,
    duration_hours: body.duration_hours ? parseFloat(body.duration_hours) : null,
  });
}

async function update(id, body, file) {
  const item = await repo.findById(id);
  if (!item) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  validate(body);

  let slug = item.slug;
  if ((body.slug || '').trim() && slugify(body.slug) !== item.slug) {
    slug = slugify(body.slug);
    const existing = await repo.findBySlug(slug, id);
    if (existing) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const data = {
    title: body.title.trim(),
    slug,
    description: body.description || null,
    price: parseFloat(body.price),
    discount_price: body.discount_price ? parseFloat(body.discount_price) : null,
    is_active: body.is_active === 'on',
    duration_hours: body.duration_hours ? parseFloat(body.duration_hours) : null,
  };
  if (file) data.thumbnail = `/uploads/course/${file.filename}`;

  return repo.update(item, data);
}

async function remove(id) {
  const item = await repo.findById(id);
  if (!item) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(item);
}

// ---- Lessons ----

async function getLessons(courseId, query) {
  const course = await repo.findById(courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  const page = parseInt(query.page, 10) || 1;
  const [{ lessons, total }, nextNumber] = await Promise.all([
    repo.listLessons(courseId, { page }),
    repo.nextLessonNumber(courseId),
  ]);
  return { course, lessons, total, page, nextNumber };
}

function validateLesson(body) {
  if (!body.title || !body.lesson_number) {
    const err = new Error('Title and Lesson Number are required.');
    err.status = 400;
    throw err;
  }
}

async function addLesson(courseId, body) {
  const course = await repo.findById(courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  validateLesson(body);
  return repo.createLesson({
    course_id: Number(courseId),
    lesson_number: parseInt(body.lesson_number, 10),
    title: body.title.trim(),
    video_url: body.video_url ? body.video_url.trim() : null,
    notes: body.notes || null,
    duration_minutes: body.duration_minutes ? parseInt(body.duration_minutes, 10) : null,
    is_free_preview: body.is_free_preview === 'on',
  });
}

async function editLesson(id, body) {
  const lesson = await repo.findLessonById(id);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.status = 404;
    throw err;
  }
  validateLesson(body);
  return repo.updateLesson(lesson, {
    lesson_number: parseInt(body.lesson_number, 10),
    title: body.title.trim(),
    video_url: body.video_url ? body.video_url.trim() : null,
    notes: body.notes || null,
    duration_minutes: body.duration_minutes ? parseInt(body.duration_minutes, 10) : null,
    is_free_preview: body.is_free_preview === 'on',
  });
}

async function removeLesson(id) {
  const lesson = await repo.findLessonById(id);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.status = 404;
    throw err;
  }
  return repo.deleteLesson(id);
}

module.exports = {
  getList, getById, create, update, remove,
  getLessons, addLesson, editLesson, removeLesson,
};
