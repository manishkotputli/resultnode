'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tests', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      test_series_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'test_series', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      test_number: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      duration_minutes: Sequelize.INTEGER,
      negative_marking: Sequelize.DECIMAL(4, 2),
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tests');
  },
};