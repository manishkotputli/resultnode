'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Each user adds their own bank/wallet/cash accounts to log
  // income-expense entries against.
  class Bank extends Model {
    static associate(models) {
      Bank.belongsTo(models.User, { foreignKey: 'user_id' });
      Bank.hasMany(models.IncomeExpense, { foreignKey: 'bank_id' });
    }
  }
  Bank.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      account_number: DataTypes.STRING,
      opening_balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'Bank', tableName: 'banks',timestamps: false }
  );
  return Bank;
};
