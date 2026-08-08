'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseLesson extends Model {
    static associate(models) {
      CourseLesson.belongsTo(models.Course, { foreignKey: 'course_id' });
    }
  }
  CourseLesson.init(
    {
      course_id: { type: DataTypes.INTEGER, allowNull: false },
      lesson_number: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      video_url: DataTypes.STRING,
      notes: DataTypes.TEXT,
      duration_minutes: DataTypes.INTEGER,
      is_free_preview: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'CourseLesson', tableName: 'course_lessons',timestamps: false }
  );
  return CourseLesson;
};
