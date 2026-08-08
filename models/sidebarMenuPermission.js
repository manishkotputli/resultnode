'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SidebarMenuPermission extends Model {
    static associate(models) {
      SidebarMenuPermission.belongsTo(models.Role, { foreignKey: 'role_id' });
      SidebarMenuPermission.belongsTo(models.SidebarMenu, { foreignKey: 'sidebar_menu_id' });
    }
  }
  SidebarMenuPermission.init(
    {
      role_id: { type: DataTypes.INTEGER, allowNull: false },
      sidebar_menu_id: { type: DataTypes.INTEGER, allowNull: false },
      can_view: { type: DataTypes.BOOLEAN, defaultValue: false },
      can_add: { type: DataTypes.BOOLEAN, defaultValue: false },
      can_edit: { type: DataTypes.BOOLEAN, defaultValue: false },
      can_delete: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize, modelName: 'SidebarMenuPermission', tableName: 'sidebar_menu_permissions',timestamps: false,
      indexes: [{ unique: true, fields: ['role_id', 'sidebar_menu_id'] }],
    }
  );
  return SidebarMenuPermission;
};
