'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('faqs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      question: { type: Sequelize.STRING, allowNull: false },
      ordering: { type: Sequelize.INTEGER, defaultValue: 0 },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('faqs');
  },
};
