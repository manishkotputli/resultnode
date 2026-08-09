'use strict';
const pagesRepo = require('../../repositories/web/pages.repository');

async function submitContact(data) {
  return pagesRepo.saveContactMessage(data);
}

async function getFaqPageData() {
  return pagesRepo.getAllFaqs();
}



async function getContactPageData() {
  const [site_setting, team_members] = await Promise.all([
    pagesRepo.getLatestSetting(),
    pagesRepo.getActiveTeamMembers()
  ]);

  return { site_setting, team_members };
}
module.exports = { submitContact, getFaqPageData, getContactPageData };
