'use strict';
/**
 * Pre-configures SarkariResult.com as 6 ScrapingWebsite entries — one per
 * homepage category box. Selectors were taken from the site's real HTML
 * (each category box on the homepage has its own unique CSS class).
 *
 * Run with: npx sequelize-cli db:seed --seed 20260101000010-sarkariresult-websites.js
 * (or however you normally run a single seeder in this project)
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const BASE_URL = 'https://www.sarkariresult.com/';
    const DETAIL_SELECTOR = '.gb-container-b39c368c';

    const entries = [
      { name: 'SarkariResult - Latest Job', category: 'latest-jobs', box: 'gb-container-c7488d9a' },
      { name: 'SarkariResult - Result', category: 'result', box: 'gb-container-0b76599a' },
      { name: 'SarkariResult - Admit Card', category: 'admit-card', box: 'gb-container-e64d3148' },
      { name: 'SarkariResult - Answer Key', category: 'answer-key', box: 'gb-container-d19ddc59' },
      { name: 'SarkariResult - Syllabus', category: 'syllabus', box: 'gb-container-b48dca36' },
      { name: 'SarkariResult - Admission', category: 'admission', box: 'gb-container-51daea0e' },
    ];

    const rows = entries.map((e) => ({
      name: e.name,
      base_url: BASE_URL,
      is_active: true,
      last_scraped_at: null,
      categories: JSON.stringify([e.category]),
      scraper_type: 'puppeteer',
      schedule_type: 'manual',
      cron_expression: null,
      selectors: JSON.stringify({
        list_selector: `.${e.box} li`,
        title_selector: 'a',
        link_selector: 'a',
        date_selector: null,
        detail_content_selector: DETAIL_SELECTOR,
      }),
      next_run_at: null,
      last_status: null,
      last_error: null,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('scraping_websites', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('scraping_websites', { base_url: 'https://www.sarkariresult.com/' });
  },
};
