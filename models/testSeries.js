'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TestSeries extends Model {
    static associate(models) {
      TestSeries.hasMany(models.Test, { foreignKey: 'test_series_id' });
    }
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
      // Fallback duration/negative-marking for tests in this series that
      // don't set their own override (see Test.duration_minutes/negative_marking).
      default_duration_minutes: DataTypes.INTEGER,
      default_negative_marking: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0 },
    },
    { sequelize, modelName: 'TestSeries', tableName: 'test_series' }
  );
  return TestSeries;
};
