'use strict';
const { QueryTypes } = require('sequelize');
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


async function getLatestSetting() {
  return await db.Setting.findOne();
}

async function getActiveTeamMembers() {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.phone, 
      u.profile_photo, 
      u.role_id, 
      r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.is_active = 1 
      AND u.role_id IN (2, 3, 4)
    ORDER BY u.id ASC
  `;

  return await db.sequelize.query(query, {
    type: QueryTypes.SELECT
  });
}
module.exports = { saveContactMessage, getAllFaqs,getLatestSetting,getActiveTeamMembers };
