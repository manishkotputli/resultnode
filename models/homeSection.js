'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // Powers the homepage's dynamic multi-column layout (title + colour +
  // N latest posts from one category, e.g. "Latest Jobs" / "Admit Card").
  class HomeSection extends Model {
    static associate(models) {
      HomeSection.belongsTo(models.Category, { foreignKey: 'category_id' });
    }
  }

  HomeSection.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      color_class: { type: DataTypes.STRING, defaultValue: 't-blue' },
      post_limit: { type: DataTypes.INTEGER, defaultValue: 10 },
      ordering: { type: DataTypes.INTEGER, defaultValue: 1 },
      status: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'HomeSection', tableName: 'home_sections',timestamps: false }
  );

  return HomeSection;
};
