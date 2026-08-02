'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sidebar_menu_permissions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      role_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      sidebar_menu_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'sidebar_menus', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      can_view: { type: Sequelize.BOOLEAN, defaultValue: false },
      can_add: { type: Sequelize.BOOLEAN, defaultValue: false },
      can_edit: { type: Sequelize.BOOLEAN, defaultValue: false },
      can_delete: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('sidebar_menu_permissions', ['role_id', 'sidebar_menu_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('sidebar_menu_permissions');
  },
};
