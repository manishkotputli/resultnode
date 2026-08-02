'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('home_sections', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING, allowNull: false },
      category_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT',
      },
      color_class: { type: Sequelize.STRING, defaultValue: 't-blue' },
      post_limit: { type: Sequelize.INTEGER, defaultValue: 10 },
      ordering: { type: Sequelize.INTEGER, defaultValue: 1 },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('home_sections');
  },
};
