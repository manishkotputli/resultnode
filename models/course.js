'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.hasMany(models.CourseLesson, { foreignKey: 'course_id' });
    }
  }
  Course.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: DataTypes.TEXT,
      thumbnail: DataTypes.STRING,
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      discount_price: DataTypes.DECIMAL(10, 2),
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      duration_hours: DataTypes.DECIMAL(6, 1),
    },
    { sequelize, modelName: 'Course', tableName: 'courses' }
  );
  return Course;
};
