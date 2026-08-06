'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 15;
const LESSONS_PER_PAGE = 25;

async function list({ page = 1, search = '', status = '' } = {}) {
  const where = {};
  if (search) where.title = { [Op.like]: `%${search}%` };
  if (status === 'active') where.is_active = true;
  if (status === 'inactive') where.is_active = false;

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.Course.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
  });

  const courses = rows.map((r) => r.get({ plain: true }));
  if (courses.length) {
    const ids = courses.map((c) => c.id);
    const counts = await db.CourseLesson.findAll({
      attributes: ['course_id', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cnt']],
      where: { course_id: { [Op.in]: ids } },
      group: ['course_id'],
      raw: true,
    });
    const countMap = {};
    counts.forEach((c) => { countMap[c.course_id] = Number(c.cnt); });
    courses.forEach((c) => { c.lessonCount = countMap[c.id] || 0; });
  }

  return { rows: courses, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.Course.findByPk(id);
}

async function findBySlug(slug, excludeId) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.Course.findOne({ where });
}

async function create(data) {
  return db.Course.create(data);
}

async function update(course, data) {
  return course.update(data);
}

async function destroy(course) {
  return course.destroy();
}

// ---- Lessons (nested under a course) ----

async function listLessons(courseId, { page = 1, perPage = LESSONS_PER_PAGE } = {}) {
  const offset = (page - 1) * perPage;
  const { rows, count } = await db.CourseLesson.findAndCountAll({
    where: { course_id: courseId },
    order: [['lesson_number', 'ASC']],
    limit: perPage,
    offset,
  });
  return { lessons: rows, total: count };
}

async function findLessonById(id) {
  return db.CourseLesson.findByPk(id);
}

async function createLesson(data) {
  return db.CourseLesson.create(data);
}

async function updateLesson(lesson, data) {
  return lesson.update(data);
}

async function deleteLesson(id) {
  return db.CourseLesson.destroy({ where: { id } });
}

async function nextLessonNumber(courseId) {
  const max = await db.CourseLesson.max('lesson_number', { where: { course_id: courseId } });
  return (max || 0) + 1;
}

module.exports = {
  list, findById, findBySlug, create, update, destroy, PER_PAGE,
  listLessons, findLessonById, createLesson, updateLesson, deleteLesson, nextLessonNumber,
};
