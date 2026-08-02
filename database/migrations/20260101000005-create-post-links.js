'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_links', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      post_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'posts', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      label: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.STRING, allowNull: false },
      order_no: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('post_links');
  },
};
