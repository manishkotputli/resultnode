'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TestSeries extends Model {
    static associate() {}
  }
  TestSeries.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: DataTypes.TEXT,
      thumbnail: DataTypes.STRING,
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount_price: DataTypes.DECIMAL(10, 2),
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'TestSeries', tableName: 'test_series' }
  );
  return TestSeries;
};
