'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scraping_logs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      scraping_website_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'scraping_websites', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      post_title: Sequelize.STRING,
      detail_url: Sequelize.STRING,
      scraped_data: Sequelize.JSON,
      status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
      post_id: {
        type: Sequelize.INTEGER,
        references: { model: 'posts', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      scraped_at: Sequelize.DATE,
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('scraping_logs');
  },
};
