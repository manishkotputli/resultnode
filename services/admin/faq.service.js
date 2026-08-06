'use strict';
const repo = require('../../repositories/admin/faq.repository');

function parseAnswersFromBody(body) {
  const texts = [].concat(body.answers_text || []);
  const answers = [];
  texts.forEach((text, i) => {
    if (text && text.trim()) {
      answers.push({ answer: text.trim(), ordering: i });
    }
  });
  return answers;
}

async function getList(search) {
  return repo.list(search);
}

async function getForEdit(id) {
  return repo.findById(id);
}

async function createFaq(body) {
  if (!body.question) {
    const err = new Error('Question is required.');
    err.status = 400;
    throw err;
  }
  const answers = parseAnswersFromBody(body);
  const faq = await repo.create({
    category_id: body.category_id || null,
    question: body.question.trim(),
    ordering: parseInt(body.ordering, 10) || 0,
    status: body.status === 'on' || body.status === 'true' || body.status === '1',
  });
  await repo.replaceAnswers(faq.id, answers);
  return faq;
}

async function updateFaq(id, body) {
  const faq = await repo.findById(id);
  if (!faq) {
    const err = new Error('FAQ not found');
    err.status = 404;
    throw err;
  }
  if (!body.question) {
    const err = new Error('Question is required.');
    err.status = 400;
    throw err;
  }
  const answers = parseAnswersFromBody(body);
  await repo.update(faq, {
    category_id: body.category_id || null,
    question: body.question.trim(),
    ordering: parseInt(body.ordering, 10) || 0,
    status: body.status === 'on' || body.status === 'true' || body.status === '1',
  });
  await repo.replaceAnswers(faq.id, answers);
  return faq;
}

async function deleteFaq(id) {
  const faq = await repo.findById(id);
  if (!faq) {
    const err = new Error('FAQ not found');
    err.status = 404;
    throw err;
  }
  return repo.destroy(faq);
}

module.exports = { getList, getForEdit, createFaq, updateFaq, deleteFaq };
