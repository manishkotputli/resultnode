'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scraping_websites', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      base_url: { type: Sequelize.STRING, allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      last_scraped_at: Sequelize.DATE,
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('scraping_websites');
  },
};
