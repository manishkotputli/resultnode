'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Test extends Model {
    static associate(models) {
      // Explicit alias: Sequelize's auto-inflection wrongly singularizes
      // "TestSeries" to "TestSery" (it's an invariant noun), so pin it.
      Test.belongsTo(models.TestSeries, { foreignKey: 'test_series_id', as: 'TestSeries' });
      Test.hasMany(models.TestQuestion, { foreignKey: 'test_id' });
      Test.hasMany(models.TestAttempt, { foreignKey: 'test_id' });
    }
  }
  Test.init(
    {
      test_series_id: { type: DataTypes.INTEGER, allowNull: false },
      test_number: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      duration_minutes: DataTypes.INTEGER,
      // Overrides the parent TestSeries.default_negative_marking when set.
      negative_marking: DataTypes.DECIMAL(4, 2),
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'Test', tableName: 'tests' }
  );
  return Test;
};
