'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Post, { foreignKey: 'category_id' });
      Category.hasMany(models.HomeSection, { foreignKey: 'category_id' });
      Category.hasMany(models.Faq, { foreignKey: 'category_id' });
    }
  }

  Category.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      status: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'Category', tableName: 'categories' }
  );

  return Category;
};
