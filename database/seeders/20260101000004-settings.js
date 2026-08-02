'use strict';
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('settings', [
      {
        site_title: 'Sarkari Result',
        tagline: 'Result, Admit Card, Answer Key & Sarkari Naukri Updates',
        home_note: 'Bookmark this page for the latest Sarkari Result updates.',
        logo: 'logo_1764781561.jpg',
        favicon: 'favicon_1764863856.png',
        footer_text: 'This is an informational portal. Please verify all details on the official website before applying.',
        footer_copyright: 'All Rights Reserved.',
        contact_email: 'contact@example.com',
        contact_phone: '+91-00000-00000',
        contact_hours: 'Mon - Sat, 10:00 AM - 6:00 PM',
        contact_address: 'New Delhi, India',
        maintenance_mode: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('settings', null, {});
  },
};
