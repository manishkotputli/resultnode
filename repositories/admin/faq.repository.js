'use strict';
const db = require('../../models');
const { Op } = require('sequelize');

async function list(search = '') {
  const where = {};
  if (search) where.question = { [Op.like]: `%${search}%` };
  return db.Faq.findAll({
    where,
    include: [{ model: db.Category, attributes: ['id', 'name'] }],
    order: [['ordering', 'ASC'], ['id', 'DESC']],
  });
}

async function findById(id) {
  return db.Faq.findByPk(id, {
    include: [{ model: db.FaqAnswer, as: 'answers', separate: true, order: [['ordering', 'ASC']] }],
  });
}

async function create(data) {
  return db.Faq.create(data);
}

async function update(faq, data) {
  return faq.update(data);
}

async function destroy(faq) {
  await db.FaqAnswer.destroy({ where: { faq_id: faq.id } });
  return faq.destroy();
}

async function replaceAnswers(faqId, answers) {
  await db.FaqAnswer.destroy({ where: { faq_id: faqId } });
  if (!answers || !answers.length) return;
  const rows = answers.map((a, i) => ({
    faq_id: faqId,
    answer: a.answer,
    ordering: a.ordering != null ? a.ordering : i,
  }));
  await db.FaqAnswer.bulkCreate(rows);
}

module.exports = { list, findById, create, update, destroy, replaceAnswers };
