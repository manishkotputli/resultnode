'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const cats = await queryInterface.sequelize.query('SELECT id, slug FROM categories', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const resultCatId = cats.find((c) => c.slug === 'result').id;

    await queryInterface.bulkInsert('faqs', [
      { category_id: resultCatId, question: 'How do I check my result?', ordering: 1, status: true, created_at: now, updated_at: now },
      { category_id: null, question: 'How do I apply for a government job listed here?', ordering: 1, status: true, created_at: now, updated_at: now },
      { category_id: null, question: 'How do I download my admit card?', ordering: 2, status: true, created_at: now, updated_at: now },
    ]);

    const faqs = await queryInterface.sequelize.query('SELECT id, question FROM faqs', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const faqId = (q) => faqs.find((f) => f.question === q).id;

    await queryInterface.bulkInsert('faq_answers', [
      { faq_id: faqId('How do I check my result?'), answer: 'Open the Result post for your exam, then click the "Download Result PDF" link under Important Links.\nSearch your roll number in the PDF using Ctrl+F.', image: '1764784115.jpg', ordering: 1, created_at: now, updated_at: now },
      { faq_id: faqId('How do I apply for a government job listed here?'), answer: 'Open the job notification post, read the eligibility and important dates, then click "Apply Online" under Important Links before the last date.', image: null, ordering: 1, created_at: now, updated_at: now },
      { faq_id: faqId('How do I download my admit card?'), answer: 'Visit the Admit Card category, open your exam\'s post, and click the admit card download link.\nKeep a printed copy for the exam day.', image: '1764784377.jpg', ordering: 1, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('faq_answers', null, {});
    await queryInterface.bulkDelete('faqs', null, {});
  },
};
