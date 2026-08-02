'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    static associate(models) {
      Faq.belongsTo(models.Category, { foreignKey: 'category_id' });
      Faq.hasMany(models.FaqAnswer, { foreignKey: 'faq_id', as: 'answers' });
    }
  }
  Faq.init(
    {
      category_id: { type: DataTypes.INTEGER },
      question: { type: DataTypes.STRING, allowNull: false },
      ordering: { type: DataTypes.INTEGER, defaultValue: 0 },
      status: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'Faq', tableName: 'faqs' }
  );
  return Faq;
};
