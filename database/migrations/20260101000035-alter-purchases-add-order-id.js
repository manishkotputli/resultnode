'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('purchases', 'order_id', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addIndex('purchases', ['order_id'], { unique: true, name: 'purchases_order_id_unique' });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('purchases', 'purchases_order_id_unique');
    await queryInterface.removeColumn('purchases', 'order_id');
  },
};
