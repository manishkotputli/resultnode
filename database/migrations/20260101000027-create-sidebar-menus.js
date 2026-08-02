'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sidebar_menus', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      parent_id: {
        type: Sequelize.INTEGER,
        references: { model: 'sidebar_menus', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      icon: Sequelize.STRING,
      route: Sequelize.STRING,
      order: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('sidebar_menus');
  },
};
