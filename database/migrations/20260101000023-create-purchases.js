'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchases', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      purchasable_type: { type: Sequelize.STRING, allowNull: false },
      purchasable_id: { type: Sequelize.INTEGER, allowNull: false },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
      payment_method: Sequelize.STRING,
      transaction_id: Sequelize.STRING,
      purchased_at: Sequelize.DATE,
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('purchases', ['purchasable_type', 'purchasable_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('purchases');
  },
};
