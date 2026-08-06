'use strict';
const repo = require('../../repositories/admin/testSeries.repository');
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
    thumbnail: file ? `/uploads/test-series/${file.filename}` : null,
    price: parseFloat(body.price),
    discount_price: body.discount_price ? parseFloat(body.discount_price) : null,
    is_active: body.is_active === 'on' || body.is_active === undefined,
    default_duration_minutes: body.default_duration_minutes ? parseInt(body.default_duration_minutes, 10) : null,
    default_negative_marking: body.default_negative_marking ? parseFloat(body.default_negative_marking) : 0,
  });
}

async function update(id, body, file) {
  const item = await repo.findById(id);
  if (!item) {
    const err = new Error('Test series not found');
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
    default_duration_minutes: body.default_duration_minutes ? parseInt(body.default_duration_minutes, 10) : null,
    default_negative_marking: body.default_negative_marking ? parseFloat(body.default_negative_marking) : 0,
  };
  if (file) data.thumbnail = `/uploads/test-series/${file.filename}`;

  return repo.update(item, data);
}

async function remove(id) {
  const item = await repo.findById(id);
  if (!item) {
    const err = new Error('Test series not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(item);
}

// ---- Tests ----

async function getTests(seriesId, query) {
  const series = await repo.findById(seriesId);
  if (!series) {
    const err = new Error('Test series not found');
    err.status = 404;
    throw err;
  }
  const page = parseInt(query.page, 10) || 1;
  const [{ tests, total }, nextNumber] = await Promise.all([
    repo.listTests(seriesId, { page }),
    repo.nextTestNumber(seriesId),
  ]);
  return { series, tests, total, page, nextNumber };
}

function validateTest(body) {
  if (!body.title || !body.test_number) {
    const err = new Error('Title and Test Number are required.');
    err.status = 400;
    throw err;
  }
}

async function addTest(seriesId, body) {
  const series = await repo.findById(seriesId);
  if (!series) {
    const err = new Error('Test series not found');
    err.status = 404;
    throw err;
  }
  validateTest(body);
  return repo.createTest({
    test_series_id: Number(seriesId),
    test_number: parseInt(body.test_number, 10),
    title: body.title.trim(),
    duration_minutes: body.duration_minutes ? parseInt(body.duration_minutes, 10) : null,
    negative_marking: body.negative_marking !== '' && body.negative_marking !== undefined ? parseFloat(body.negative_marking) : null,
    is_active: body.is_active === 'on' || body.is_active === undefined,
  });
}

async function editTest(id, body) {
  const test = await repo.findTestById(id);
  if (!test) {
    const err = new Error('Test not found');
    err.status = 404;
    throw err;
  }
  validateTest(body);
  return repo.updateTest(test, {
    test_number: parseInt(body.test_number, 10),
    title: body.title.trim(),
    duration_minutes: body.duration_minutes ? parseInt(body.duration_minutes, 10) : null,
    negative_marking: body.negative_marking !== '' && body.negative_marking !== undefined ? parseFloat(body.negative_marking) : null,
    is_active: body.is_active === 'on',
  });
}

async function removeTest(id) {
  const test = await repo.findTestById(id);
  if (!test) {
    const err = new Error('Test not found');
    err.status = 404;
    throw err;
  }
  return repo.deleteTest(id);
}

// ---- Questions ----

async function getQuestions(testId, query) {
  const test = await repo.findTestById(testId);
  if (!test) {
    const err = new Error('Test not found');
    err.status = 404;
    throw err;
  }
  const page = parseInt(query.page, 10) || 1;
  const { questions, total } = await repo.listQuestions(testId, { page });
  return { test, questions, total, page };
}

function validateQuestion(body) {
  if (!body.question_text || !body.option_a || !body.option_b || !body.option_c || !body.option_d || !body.correct_option) {
    const err = new Error('Question text, all four options and the correct option are required.');
    err.status = 400;
    throw err;
  }
  if (!['A', 'B', 'C', 'D'].includes(String(body.correct_option).toUpperCase())) {
    const err = new Error('Correct option must be A, B, C or D.');
    err.status = 400;
    throw err;
  }
}

async function addQuestion(testId, body) {
  const test = await repo.findTestById(testId);
  if (!test) {
    const err = new Error('Test not found');
    err.status = 404;
    throw err;
  }
  validateQuestion(body);
  return repo.createQuestion({
    test_id: Number(testId),
    question_text: body.question_text.trim(),
    option_a: body.option_a.trim(),
    option_b: body.option_b.trim(),
    option_c: body.option_c.trim(),
    option_d: body.option_d.trim(),
    correct_option: String(body.correct_option).toUpperCase(),
    marks: body.marks ? parseFloat(body.marks) : 1,
    display_order: body.display_order ? parseInt(body.display_order, 10) : await repo.nextQuestionOrder(testId),
  });
}

async function editQuestion(id, body) {
  const question = await repo.findQuestionById(id);
  if (!question) {
    const err = new Error('Question not found');
    err.status = 404;
    throw err;
  }
  validateQuestion(body);
  return repo.updateQuestion(question, {
    question_text: body.question_text.trim(),
    option_a: body.option_a.trim(),
    option_b: body.option_b.trim(),
    option_c: body.option_c.trim(),
    option_d: body.option_d.trim(),
    correct_option: String(body.correct_option).toUpperCase(),
    marks: body.marks ? parseFloat(body.marks) : 1,
    display_order: body.display_order ? parseInt(body.display_order, 10) : question.display_order,
  });
}

async function removeQuestion(id) {
  const question = await repo.findQuestionById(id);
  if (!question) {
    const err = new Error('Question not found');
    err.status = 404;
    throw err;
  }
  return repo.deleteQuestion(id);
}

// ---- Attempts / Results ----

async function getAttempts(seriesId, query) {
  const series = await repo.findById(seriesId);
  if (!series) {
    const err = new Error('Test series not found');
    err.status = 404;
    throw err;
  }
  const page = parseInt(query.page, 10) || 1;
  const { tests } = await repo.listTests(seriesId, { page: 1, perPage: 200 });
  const { attempts, total } = await repo.listAttempts({
    testSeriesId: seriesId,
    testId: query.test || '',
    userId: query.user || '',
    page,
  });
  return { series, tests, attempts, total, page };
}

async function getAttemptDetail(id) {
  const attempt = await repo.findAttemptById(id);
  if (!attempt) {
    const err = new Error('Attempt not found');
    err.status = 404;
    throw err;
  }
  return attempt;
}

async function removeAttempt(id) {
  const attempt = await repo.findAttemptById(id);
  if (!attempt) {
    const err = new Error('Attempt not found');
    err.status = 404;
    throw err;
  }
  return repo.deleteAttempt(id);
}

module.exports = {
  getList, getById, create, update, remove,
  getTests, addTest, editTest, removeTest,
  getQuestions, addQuestion, editQuestion, removeQuestion,
  getAttempts, getAttemptDetail, removeAttempt,
};
