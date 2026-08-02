'use strict';
const db = require('../../models');

async function saveContactMessage({ name, email, subject, message }) {
  return db.ContactMessage.create({ name, email, subject, message });
}

async function getAllFaqs() {
  return db.Faq.findAll({
    where: { status: true },
    include: [{ model: db.FaqAnswer, as: 'answers' }, { model: db.Category }],
    order: [['ordering', 'ASC']],
  });
}

module.exports = { saveContactMessage, getAllFaqs };
