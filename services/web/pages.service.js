'use strict';
const pagesRepo = require('../../repositories/web/pages.repository');

async function submitContact(data) {
  return pagesRepo.saveContactMessage(data);
}

async function getFaqPageData() {
  return pagesRepo.getAllFaqs();
}

module.exports = { submitContact, getFaqPageData };
