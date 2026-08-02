'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      { name: 'Latest Jobs', slug: 'latest-jobs', display_order: 1, status: true, created_at: now, updated_at: now },
      { name: 'Result', slug: 'result', display_order: 2, status: true, created_at: now, updated_at: now },
      { name: 'Admit Card', slug: 'admit-card', display_order: 3, status: true, created_at: now, updated_at: now },
      { name: 'Answer Key', slug: 'answer-key', display_order: 4, status: true, created_at: now, updated_at: now },
      { name: 'Syllabus', slug: 'syllabus', display_order: 5, status: true, created_at: now, updated_at: now },
      { name: 'Admission', slug: 'admission', display_order: 6, status: true, created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
