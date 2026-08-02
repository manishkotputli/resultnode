'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const cats = await queryInterface.sequelize.query('SELECT id, slug FROM categories', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const catId = (slug) => cats.find((c) => c.slug === slug).id;

    const posts = [
      {
        category_id: catId('result'),
        title: 'RAS 2027 Final Result Declared',
        slug: 'ras-2027-final-result-declared',
        short_description: 'RPSC has declared the RAS 2027 final result. Check your result and cut-off marks here.',
        full_description:
          '<p>Rajasthan Public Service Commission (RPSC) has declared the final result for Rajasthan Administrative Service (RAS) 2027 Combined Competitive Examination. Candidates who appeared in the interview round can check their result using the link below.</p>',
        post_date: '2026-08-01',
        updated_date: '2026-08-01',
        status: true,
        is_marquee: true,
        is_top: true,
        highlight_color: '#c00000',
        views_count: 0,
        clicks_count: 0,
        meta_title: 'RAS 2027 Final Result - RPSC',
        meta_description: 'Check RAS 2027 final result declared by RPSC.',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: catId('latest-jobs'),
        title: 'SSC CGL 2027 Notification - 12000+ Posts',
        slug: 'ssc-cgl-2027-notification',
        short_description: 'SSC has released the CGL 2027 notification for over 12000 vacancies. Apply online before the last date.',
        full_description:
          '<p>Staff Selection Commission (SSC) has released the official notification for Combined Graduate Level (CGL) Examination 2027, inviting online applications for various Group B and Group C posts.</p>',
        post_date: '2026-07-15',
        updated_date: '2026-07-20',
        status: true,
        is_marquee: true,
        is_top: true,
        highlight_color: '#0033cc',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: catId('admit-card'),
        title: 'UPSC Civil Services Prelims 2027 Admit Card Released',
        slug: 'upsc-cse-prelims-2027-admit-card',
        short_description: 'UPSC has released the admit card for Civil Services Preliminary Examination 2027.',
        full_description: '<p>Union Public Service Commission (UPSC) has released the e-admit card for the Civil Services (Preliminary) Examination 2027. Candidates can download it from the official website.</p>',
        post_date: '2026-07-25',
        updated_date: '2026-07-25',
        status: true,
        is_marquee: true,
        is_top: false,
        highlight_color: '#0a8a3e',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: catId('answer-key'),
        title: 'Railway Group D 2027 Provisional Answer Key Out',
        slug: 'railway-group-d-2027-answer-key',
        short_description: 'RRB has released the provisional answer key for Group D CBT. Raise objections before the deadline.',
        full_description: '<p>Railway Recruitment Board (RRB) has published the provisional answer key for the Group D Computer Based Test 2027. Candidates can raise objections online within the given window.</p>',
        post_date: '2026-07-28',
        updated_date: '2026-07-28',
        status: true,
        created_at: now,
        updated_at: now,
      },
      {
        category_id: catId('syllabus'),
        title: 'IBPS PO 2027 Syllabus & Exam Pattern',
        slug: 'ibps-po-2027-syllabus',
        short_description: 'Detailed IBPS PO 2027 prelims and mains syllabus with section-wise topics.',
        full_description: '<p>Institute of Banking Personnel Selection (IBPS) has released the detailed syllabus for the Probationary Officer (PO) recruitment 2027, covering both preliminary and mains stages.</p>',
        post_date: '2026-07-10',
        updated_date: '2026-07-10',
        status: true,
        is_top: true,
        highlight_color: '#7a1fa2',
        created_at: now,
        updated_at: now,
      },
      {
        category_id: catId('admission'),
        title: 'DU UG Admission 2027 - CUET Based Merit List',
        slug: 'du-ug-admission-2027-merit-list',
        short_description: 'Delhi University has released the first CUET-based merit list for UG admissions 2027.',
        full_description: '<p>Delhi University has released the first merit list for undergraduate admissions 2027 based on CUET UG scores. Candidates can check their allotted college and course.</p>',
        post_date: '2026-07-22',
        updated_date: '2026-07-22',
        status: true,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('posts', posts);

    const inserted = await queryInterface.sequelize.query('SELECT id, slug FROM posts', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const postId = (slug) => inserted.find((p) => p.slug === slug).id;
    const rasId = postId('ras-2027-final-result-declared');
    const sscId = postId('ssc-cgl-2027-notification');

    // Important Links (existing post_links mechanism - unchanged)
    await queryInterface.bulkInsert('post_links', [
      { post_id: rasId, label: 'Download Result PDF', url: 'https://rpsc.rajasthan.gov.in/', order_no: 1, created_at: now, updated_at: now },
      { post_id: rasId, label: 'Official Website', url: 'https://rpsc.rajasthan.gov.in/', order_no: 2, created_at: now, updated_at: now },
      { post_id: sscId, label: 'Apply Online', url: 'https://ssc.nic.in/', order_no: 1, created_at: now, updated_at: now },
      { post_id: sscId, label: 'Download Notification', url: 'https://ssc.nic.in/', order_no: 2, created_at: now, updated_at: now },
      { post_id: sscId, label: 'Official Website', url: 'https://ssc.nic.in/', order_no: 3, created_at: now, updated_at: now },
    ]);

    // Dynamic fields (EAV) - this is the generic system replacing fixed
    // columns like organization/post_name/fees/age that used to force a
    // migration for every new post type.
    await queryInterface.bulkInsert('dynamic_fields', [
      // RAS 2027 - Basic Info
      { table_name: 'post', record_id: rasId, group_name: 'Basic Info', field_label: 'Organization', field_type: 'text', field_value: 'RPSC (Rajasthan Public Service Commission)', sort_order: 1, created_at: now, updated_at: now },
      { table_name: 'post', record_id: rasId, group_name: 'Basic Info', field_label: 'Post Name', field_type: 'text', field_value: 'Rajasthan Administrative Service (RAS)', sort_order: 2, created_at: now, updated_at: now },
      { table_name: 'post', record_id: rasId, group_name: 'Basic Info', field_label: 'Total Posts', field_type: 'text', field_value: '905', sort_order: 3, created_at: now, updated_at: now },
      // RAS 2027 - Important Dates
      { table_name: 'post', record_id: rasId, group_name: 'Important Dates', field_label: 'Interview Concluded', field_type: 'date', field_value: '2026-06-20', sort_order: 1, created_at: now, updated_at: now },
      { table_name: 'post', record_id: rasId, group_name: 'Important Dates', field_label: 'Result Declared', field_type: 'date', field_value: '2026-08-01', sort_order: 2, created_at: now, updated_at: now },
      // RAS 2027 - How To Check Result (single rich block)
      { table_name: 'post', record_id: rasId, group_name: 'How To Check Result', field_label: 'Steps', field_type: 'richtext', field_value: '<ol><li>Visit the official RPSC website.</li><li>Click on the RAS 2027 Final Result link.</li><li>Search your roll number in the PDF.</li><li>Download and keep a copy for future reference.</li></ol>', sort_order: 1, created_at: now, updated_at: now },

      // SSC CGL 2027 - Basic Info
      { table_name: 'post', record_id: sscId, group_name: 'Basic Info', field_label: 'Organization', field_type: 'text', field_value: 'Staff Selection Commission (SSC)', sort_order: 1, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Basic Info', field_label: 'Total Posts', field_type: 'text', field_value: '12048', sort_order: 2, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Basic Info', field_label: 'Job Location', field_type: 'text', field_value: 'All India', sort_order: 3, created_at: now, updated_at: now },
      // SSC CGL 2027 - Important Dates
      { table_name: 'post', record_id: sscId, group_name: 'Important Dates', field_label: 'Application Start', field_type: 'date', field_value: '2026-07-15', sort_order: 1, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Important Dates', field_label: 'Last Date to Apply', field_type: 'date', field_value: '2026-08-14', sort_order: 2, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Important Dates', field_label: 'Tier 1 Exam Date', field_type: 'date', field_value: '2026-09-20', sort_order: 3, created_at: now, updated_at: now },
      // SSC CGL 2027 - Application Fee
      { table_name: 'post', record_id: sscId, group_name: 'Application Fee', field_label: 'General / OBC', field_type: 'text', field_value: '\u20b9100/-', sort_order: 1, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Application Fee', field_label: 'SC / ST / PH / Female', field_type: 'text', field_value: '\u20b90/- (Exempted)', sort_order: 2, created_at: now, updated_at: now },
      // SSC CGL 2027 - Age Limit
      { table_name: 'post', record_id: sscId, group_name: 'Age Limit', field_label: 'Minimum Age', field_type: 'text', field_value: '18 Years', sort_order: 1, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Age Limit', field_label: 'Maximum Age', field_type: 'text', field_value: '32 Years', sort_order: 2, created_at: now, updated_at: now },
      { table_name: 'post', record_id: sscId, group_name: 'Age Limit', field_label: 'Age Relaxation', field_type: 'text', field_value: 'As per Govt rules', sort_order: 3, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('dynamic_fields', { table_name: 'post' }, {});
    await queryInterface.bulkDelete('post_links', null, {});
    await queryInterface.bulkDelete('posts', null, {});
  },
};
