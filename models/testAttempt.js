'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // A submitted attempt doubles as its own result: score/counts are computed
  // once at submit time and stored here rather than in a separate table.
  class TestAttempt extends Model {
    static associate(models) {
      TestAttempt.belongsTo(models.Test, { foreignKey: 'test_id' });
      TestAttempt.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  TestAttempt.init(
    {
      test_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      // [{ question_id, selected_option, is_correct, marks_obtained }, ...]
      answers: DataTypes.JSON,
      total_questions: { type: DataTypes.INTEGER, defaultValue: 0 },
      correct_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      wrong_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      unattempted_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      score: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
      status: { type: DataTypes.STRING(20), defaultValue: 'completed' },
      started_at: DataTypes.DATE,
      submitted_at: DataTypes.DATE,
    },
    { sequelize, modelName: 'TestAttempt', tableName: 'test_attempts' }
  );
  return TestAttempt;
};
