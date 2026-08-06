'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_questions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      test_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'tests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      question_text: { type: Sequelize.TEXT, allowNull: false },
      option_a: { type: Sequelize.STRING, allowNull: false },
      option_b: { type: Sequelize.STRING, allowNull: false },
      option_c: { type: Sequelize.STRING, allowNull: false },
      option_d: { type: Sequelize.STRING, allowNull: false },
      correct_option: { type: Sequelize.STRING(1), allowNull: false },
      marks: { type: Sequelize.DECIMAL(4, 2), allowNull: false, defaultValue: 1 },
      display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('test_questions');
  },
};