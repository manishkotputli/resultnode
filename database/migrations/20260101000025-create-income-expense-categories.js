'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('income_expense_categories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.TINYINT, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('income_expense_categories');
  },
};
