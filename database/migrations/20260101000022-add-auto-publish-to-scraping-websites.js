'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('scraping_websites', 'auto_publish', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('scraping_websites', 'auto_publish');
  },
};
