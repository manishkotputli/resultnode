'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banners', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      text: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.STRING },
      color: { type: Sequelize.STRING },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('banners');
  },
};
