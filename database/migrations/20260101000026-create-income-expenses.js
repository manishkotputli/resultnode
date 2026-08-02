'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('income_expenses', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'income_expense_categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      bank_id: {
        type: Sequelize.INTEGER,
        references: { model: 'banks', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      type: { type: Sequelize.TINYINT, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      note: Sequelize.TEXT,
      transaction_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('income_expenses');
  },
};
