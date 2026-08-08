'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FaqAnswer extends Model {
    static associate(models) {
      FaqAnswer.belongsTo(models.Faq, { foreignKey: 'faq_id' });
    }
  }
  FaqAnswer.init(
    {
      faq_id: { type: DataTypes.INTEGER, allowNull: false },
      answer: { type: DataTypes.TEXT, allowNull: false },
      image: { type: DataTypes.STRING },
      ordering: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, modelName: 'FaqAnswer', tableName: 'faq_answers',timestamps: false }
  );
  return FaqAnswer;
};
