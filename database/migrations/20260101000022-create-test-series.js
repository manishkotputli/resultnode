'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_series', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: Sequelize.TEXT,
      thumbnail: Sequelize.STRING,
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      discount_price: Sequelize.DECIMAL(10, 2),
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('test_series');
  },
};
