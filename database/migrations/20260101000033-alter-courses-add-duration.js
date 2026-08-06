'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'duration_hours', { type: Sequelize.DECIMAL(6, 1), allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'duration_hours');
  },
};