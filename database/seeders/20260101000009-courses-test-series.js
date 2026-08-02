'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('courses', [
      {
        title: 'RAS Prelims + Mains Complete Batch',
        slug: 'ras-prelims-mains-complete-batch',
        description: 'Full RAS syllabus coverage with recorded video lectures, notes, and weekly tests.',
        price: 4999.0, discount_price: 2999.0, is_active: true, created_at: now, updated_at: now,
      },
      {
        title: 'SSC CGL Foundation Batch',
        slug: 'ssc-cgl-foundation-batch',
        description: 'Beginner-friendly SSC CGL course covering Maths, Reasoning, English and GK.',
        price: 2999.0, discount_price: 1499.0, is_active: true, created_at: now, updated_at: now,
      },
    ]);
    await queryInterface.bulkInsert('test_series', [
      {
        title: 'SSC CGL Mock Test Series (30 Tests)',
        slug: 'ssc-cgl-mock-test-series-30-tests',
        description: '30 full-length SSC CGL mock tests with detailed solutions and All-India rank.',
        price: 999.0, discount_price: 499.0, is_active: true, created_at: now, updated_at: now,
      },
      {
        title: 'RAS Prelims Test Series (20 Tests)',
        slug: 'ras-prelims-test-series-20-tests',
        description: '20 RAS-pattern prelims mock tests based on the latest syllabus.',
        price: 799.0, discount_price: 399.0, is_active: true, created_at: now, updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('courses', null, {});
    await queryInterface.bulkDelete('test_series', null, {});
  },
};
