'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

const PER_PAGE = 15;
const TESTS_PER_PAGE = 20;
const QUESTIONS_PER_PAGE = 20;
const ATTEMPTS_PER_PAGE = 20;

async function list({ page = 1, search = '', status = '' } = {}) {
  const where = {};
  if (search) where.title = { [Op.like]: `%${search}%` };
  if (status === 'active') where.is_active = true;
  if (status === 'inactive') where.is_active = false;

  const offset = (page - 1) * PER_PAGE;
  const { rows, count } = await db.TestSeries.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: PER_PAGE,
    offset,
  });

  const series = rows.map((r) => r.get({ plain: true }));
  if (series.length) {
    const ids = series.map((s) => s.id);
    const counts = await db.Test.findAll({
      attributes: ['test_series_id', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cnt']],
      where: { test_series_id: { [Op.in]: ids } },
      group: ['test_series_id'],
      raw: true,
    });
    const countMap = {};
    counts.forEach((c) => { countMap[c.test_series_id] = Number(c.cnt); });
    series.forEach((s) => { s.testCount = countMap[s.id] || 0; });
  }

  return { rows: series, count, perPage: PER_PAGE };
}

async function findById(id) {
  return db.TestSeries.findByPk(id);
}

async function findBySlug(slug, excludeId) {
  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  return db.TestSeries.findOne({ where });
}

async function create(data) {
  return db.TestSeries.create(data);
}

async function update(testSeries, data) {
  return testSeries.update(data);
}

async function destroy(testSeries) {
  return testSeries.destroy();
}

// ---- Tests (nested under a series) ----

async function listTests(testSeriesId, { page = 1, perPage = TESTS_PER_PAGE } = {}) {
  const offset = (page - 1) * perPage;
  const { rows, count } = await db.Test.findAndCountAll({
    where: { test_series_id: testSeriesId },
    order: [['test_number', 'ASC']],
    limit: perPage,
    offset,
  });

  const tests = rows.map((t) => t.get({ plain: true }));
  if (tests.length) {
    const ids = tests.map((t) => t.id);
    const [qCounts, aCounts] = await Promise.all([
      db.TestQuestion.findAll({
        attributes: ['test_id', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cnt']],
        where: { test_id: { [Op.in]: ids } },
        group: ['test_id'],
        raw: true,
      }),
      db.TestAttempt.findAll({
        attributes: ['test_id', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cnt']],
        where: { test_id: { [Op.in]: ids } },
        group: ['test_id'],
        raw: true,
      }),
    ]);
    const qMap = {}; qCounts.forEach((c) => { qMap[c.test_id] = Number(c.cnt); });
    const aMap = {}; aCounts.forEach((c) => { aMap[c.test_id] = Number(c.cnt); });
    tests.forEach((t) => { t.questionCount = qMap[t.id] || 0; t.attemptCount = aMap[t.id] || 0; });
  }

  return { tests, total: count };
}

async function findTestById(id) {
  return db.Test.findByPk(id, { include: [{ model: db.TestSeries, as: 'TestSeries' }] });
}

async function createTest(data) {
  return db.Test.create(data);
}

async function updateTest(test, data) {
  return test.update(data);
}

async function deleteTest(id) {
  return db.Test.destroy({ where: { id } });
}

async function nextTestNumber(testSeriesId) {
  const max = await db.Test.max('test_number', { where: { test_series_id: testSeriesId } });
  return (max || 0) + 1;
}

// ---- Questions (nested under a test) ----

async function listQuestions(testId, { page = 1, perPage = QUESTIONS_PER_PAGE } = {}) {
  const offset = (page - 1) * perPage;
  const { rows, count } = await db.TestQuestion.findAndCountAll({
    where: { test_id: testId },
    order: [['display_order', 'ASC'], ['id', 'ASC']],
    limit: perPage,
    offset,
  });
  return { questions: rows, total: count };
}

async function findQuestionById(id) {
  return db.TestQuestion.findByPk(id);
}

async function createQuestion(data) {
  return db.TestQuestion.create(data);
}

async function updateQuestion(question, data) {
  return question.update(data);
}

async function deleteQuestion(id) {
  return db.TestQuestion.destroy({ where: { id } });
}

async function nextQuestionOrder(testId) {
  const max = await db.TestQuestion.max('display_order', { where: { test_id: testId } });
  return (max || 0) + 1;
}

// ---- Attempts / Results (read-mostly, scoped to a series) ----

async function listAttempts({ testSeriesId, testId = '', userId = '', page = 1, perPage = ATTEMPTS_PER_PAGE } = {}) {
  const where = {};
  if (testId) where.test_id = testId;
  if (userId) where.user_id = Number(userId);

  const offset = (page - 1) * perPage;
  const { rows, count } = await db.TestAttempt.findAndCountAll({
    where,
    include: [
      {
        model: db.Test,
        where: { test_series_id: testSeriesId },
        include: [{ model: db.TestSeries, as: 'TestSeries', attributes: ['id', 'title'] }],
      },
      { model: db.User, attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
    limit: perPage,
    offset,
  });
  return { attempts: rows, total: count };
}

async function findAttemptById(id) {
  return db.TestAttempt.findByPk(id, {
    include: [
      { model: db.Test, include: [{ model: db.TestSeries, as: 'TestSeries' }] },
      { model: db.User, attributes: ['id', 'name', 'email'] },
    ],
  });
}

async function deleteAttempt(id) {
  return db.TestAttempt.destroy({ where: { id } });
}

module.exports = {
  list, findById, findBySlug, create, update, destroy, PER_PAGE,
  listTests, findTestById, createTest, updateTest, deleteTest, nextTestNumber,
  listQuestions, findQuestionById, createQuestion, updateQuestion, deleteQuestion, nextQuestionOrder,
  listAttempts, findAttemptById, deleteAttempt,
};
