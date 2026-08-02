'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Drives the future admin sidebar (Result, Income-Expense, Course,
  // Test Series...) - self-referential for submenus.
  class SidebarMenu extends Model {
    static associate(models) {
      SidebarMenu.belongsTo(models.SidebarMenu, { foreignKey: 'parent_id', as: 'parent' });
      SidebarMenu.hasMany(models.SidebarMenu, { foreignKey: 'parent_id', as: 'children' });
      SidebarMenu.hasMany(models.SidebarMenuPermission, { foreignKey: 'sidebar_menu_id' });
    }
  }
  SidebarMenu.init(
    {
      parent_id: { type: DataTypes.INTEGER },
      name: { type: DataTypes.STRING, allowNull: false },
      icon: DataTypes.STRING,
      route: DataTypes.STRING,
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'SidebarMenu', tableName: 'sidebar_menus' }
  );
  return SidebarMenu;
};
