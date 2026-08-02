'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('blog_categories', [
      { name: 'Exam Tips', slug: 'exam-tips', created_at: now, updated_at: now },
      { name: 'Career Guidance', slug: 'career-guidance', created_at: now, updated_at: now },
    ]);
    const cats = await queryInterface.sequelize.query('SELECT id, slug FROM blog_categories', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const users = await queryInterface.sequelize.query("SELECT id FROM users WHERE email = 'admin@example.com'", {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const catId = (slug) => cats.find((c) => c.slug === slug).id;
    const authorId = users[0] ? users[0].id : null;

    await queryInterface.bulkInsert('blogs', [
      {
        title: 'How to Prepare for Government Exams in 6 Months',
        slug: 'how-to-prepare-for-government-exams-in-6-months',
        short_description: 'A practical 6-month study plan for competitive government exam aspirants.',
        content:
          '<p>Preparing for a government exam within six months is achievable with the right strategy. Start by understanding the exact syllabus and previous year cut-offs, then build a weekly timetable that balances new topics with revision.</p><p>Mock tests from month three onward help you get used to exam-day time pressure, and a weekly current affairs review keeps your general awareness section strong.</p>',
        category_id: catId('exam-tips'),
        author_id: authorId,
        word_count: 420,
        read_time: 3,
        is_featured: true,
        status: 'published',
        published_at: now,
        created_at: now,
        updated_at: now,
      },
      {
        title: 'Top 5 Mistakes Candidates Make in Interviews',
        slug: 'top-5-mistakes-candidates-make-in-interviews',
        short_description: 'Common interview mistakes that cost good candidates their selection.',
        content:
          '<p>Even well-prepared candidates lose marks in the interview round due to avoidable mistakes - vague answers, poor body language, and not researching the department they are applying to are the most common ones.</p>',
        category_id: catId('career-guidance'),
        author_id: authorId,
        word_count: 310,
        read_time: 2,
        status: 'published',
        published_at: now,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('blogs', null, {});
    await queryInterface.bulkDelete('blog_categories', null, {});
  },
};
