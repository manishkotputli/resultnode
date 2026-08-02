'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
