'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('scraping_websites', 'categories', { type: Sequelize.JSON });
    await queryInterface.addColumn('scraping_websites', 'scraper_type', {
      type: Sequelize.STRING(20),
      defaultValue: 'puppeteer', // puppeteer | cheerio
    });
    await queryInterface.addColumn('scraping_websites', 'schedule_type', {
      type: Sequelize.STRING(20),
      defaultValue: 'manual', // manual | every_1m | every_5m | every_10m | every_30m | hourly | every_2h | every_6h | every_12h | daily | weekly | monthly | custom
    });
    await queryInterface.addColumn('scraping_websites', 'cron_expression', { type: Sequelize.STRING(50) });
    await queryInterface.addColumn('scraping_websites', 'selectors', { type: Sequelize.JSON });
    // { list_selector, title_selector, link_selector, date_selector }
    await queryInterface.addColumn('scraping_websites', 'next_run_at', { type: Sequelize.DATE });
    await queryInterface.addColumn('scraping_websites', 'last_status', { type: Sequelize.STRING(20) }); // success | failed | running
    await queryInterface.addColumn('scraping_websites', 'last_error', { type: Sequelize.TEXT });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('scraping_websites', 'categories');
    await queryInterface.removeColumn('scraping_websites', 'scraper_type');
    await queryInterface.removeColumn('scraping_websites', 'schedule_type');
    await queryInterface.removeColumn('scraping_websites', 'cron_expression');
    await queryInterface.removeColumn('scraping_websites', 'selectors');
    await queryInterface.removeColumn('scraping_websites', 'next_run_at');
    await queryInterface.removeColumn('scraping_websites', 'last_status');
    await queryInterface.removeColumn('scraping_websites', 'last_error');
  },
};
