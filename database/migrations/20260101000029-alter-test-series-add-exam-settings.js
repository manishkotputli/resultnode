'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('test_series', 'default_duration_minutes', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('test_series', 'default_negative_marking', { type: Sequelize.DECIMAL(4, 2), allowNull: false, defaultValue: 0 });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('test_series', 'default_duration_minutes');
    await queryInterface.removeColumn('test_series', 'default_negative_marking');
  },
};