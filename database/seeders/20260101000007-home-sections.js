'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const cats = await queryInterface.sequelize.query('SELECT id, slug FROM categories', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const catId = (slug) => cats.find((c) => c.slug === slug).id;

    await queryInterface.bulkInsert('home_sections', [
      { title: 'Latest Jobs', category_id: catId('latest-jobs'), color_class: 't-blue', post_limit: 10, ordering: 1, status: true, created_at: now, updated_at: now },
      { title: 'Result', category_id: catId('result'), color_class: 't-red', post_limit: 10, ordering: 2, status: true, created_at: now, updated_at: now },
      { title: 'Admit Card', category_id: catId('admit-card'), color_class: 't-green', post_limit: 10, ordering: 3, status: true, created_at: now, updated_at: now },
      { title: 'Answer Key', category_id: catId('answer-key'), color_class: 't-purple', post_limit: 10, ordering: 4, status: true, created_at: now, updated_at: now },
      { title: 'Syllabus', category_id: catId('syllabus'), color_class: 't-blue', post_limit: 10, ordering: 5, status: true, created_at: now, updated_at: now },
      { title: 'Admission', category_id: catId('admission'), color_class: 't-red', post_limit: 10, ordering: 6, status: true, created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('home_sections', null, {});
  },
};
