'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TestQuestion extends Model {
    static associate(models) {
      TestQuestion.belongsTo(models.Test, { foreignKey: 'test_id' });
    }
  }
  TestQuestion.init(
    {
      test_id: { type: DataTypes.INTEGER, allowNull: false },
      question_text: { type: DataTypes.TEXT, allowNull: false },
      option_a: { type: DataTypes.STRING, allowNull: false },
      option_b: { type: DataTypes.STRING, allowNull: false },
      option_c: { type: DataTypes.STRING, allowNull: false },
      option_d: { type: DataTypes.STRING, allowNull: false },
      // 'A' | 'B' | 'C' | 'D'
      correct_option: { type: DataTypes.STRING(1), allowNull: false },
      marks: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 1 },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, modelName: 'TestQuestion', tableName: 'test_questions' ,timestamps: false}
  );
  return TestQuestion;
};
