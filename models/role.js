'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, { foreignKey: 'role_id' });
      Role.hasMany(models.SidebarMenuPermission, { foreignKey: 'role_id' });
    }
  }

  Role.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      // Short code used to build human-readable user codes, e.g. US-000001
      prefix: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    },
    { sequelize, modelName: 'Role', tableName: 'roles',timestamps: false }
  );

  return Role;
};
