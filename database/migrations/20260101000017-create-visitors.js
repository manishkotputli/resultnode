'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visitors', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      ip: Sequelize.STRING,
      user_agent: Sequelize.STRING,
      browser: Sequelize.STRING,
      device: Sequelize.STRING,
      page_url: Sequelize.STRING,
      hour: Sequelize.INTEGER,
      visit_date: Sequelize.DATEONLY,
      visits: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('visitors');
  },
};
