'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Polymorphic: purchasable_type ('course'|'test_series') + purchasable_id.
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Purchase.init(
    {
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      purchasable_type: { type: DataTypes.STRING, allowNull: false },
      purchasable_id: { type: DataTypes.INTEGER, allowNull: false },
      order_id: { type: DataTypes.STRING, unique: true },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      // TODO: wire a real gateway (Razorpay/PayU/etc). For now "buy" marks
      // this completed immediately so the flow is fully testable end-to-end.
      payment_status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
      payment_method: DataTypes.STRING,
      transaction_id: DataTypes.STRING,
      purchased_at: DataTypes.DATE,
    },
    { sequelize, modelName: 'Purchase', tableName: 'purchases',timestamps: false }
  );
  return Purchase;
};
