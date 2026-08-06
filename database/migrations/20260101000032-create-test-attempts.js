'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_attempts', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      test_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'tests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      answers: { type: Sequelize.JSON, allowNull: true },
      total_questions: { type: Sequelize.INTEGER, defaultValue: 0 },
      correct_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      wrong_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      unattempted_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      score: { type: Sequelize.DECIMAL(6, 2), defaultValue: 0 },
      status: { type: Sequelize.STRING(20), defaultValue: 'completed' },
      started_at: Sequelize.DATE,
      submitted_at: Sequelize.DATE,
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('test_attempts');
  },
};