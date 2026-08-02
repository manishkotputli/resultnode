'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      prefix: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
