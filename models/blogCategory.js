'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BlogCategory extends Model {
    static associate(models) {
      BlogCategory.hasMany(models.Blog, { foreignKey: 'category_id' });
    }
  }
  BlogCategory.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { sequelize, modelName: 'BlogCategory', tableName: 'blog_categories' }
  );
  return BlogCategory;
};
