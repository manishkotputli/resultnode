'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'role_id' });
      User.hasMany(models.Blog, { foreignKey: 'author_id' });
      User.hasMany(models.Purchase, { foreignKey: 'user_id' });
      User.hasMany(models.Bank, { foreignKey: 'user_id' });
      User.hasMany(models.IncomeExpenseCategory, { foreignKey: 'user_id' });
      User.hasMany(models.IncomeExpense, { foreignKey: 'user_id' });
      User.hasMany(models.Comment, { foreignKey: 'user_id' });
      User.hasMany(models.Like, { foreignKey: 'user_id' });
    }
  }

  User.init(
    {
      role_id: { type: DataTypes.INTEGER, allowNull: false },
      // e.g. US-000001 / SA-000001 - built from the role's prefix + zero-padded id
      user_code: { type: DataTypes.STRING(20), unique: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      username: { type: DataTypes.STRING, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING },
      profile_photo: { type: DataTypes.STRING },
      address: { type: DataTypes.TEXT },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      email_verified_at: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: { attributes: {} },
      },
      hooks: {
        async afterCreate(user, options) {
          if (!user.user_code) {
            const role = await sequelize.models.Role.findByPk(user.role_id, { transaction: options.transaction });
            const prefix = role ? role.prefix : 'US';
            user.user_code = `${prefix}-${String(user.id).padStart(6, '0')}`;
            await user.save({ hooks: false, transaction: options.transaction });
          }
        },
      },
    }
  );

  return User;
};
