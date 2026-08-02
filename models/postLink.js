'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostLink extends Model {
    static associate(models) {
      PostLink.belongsTo(models.Post, { foreignKey: 'post_id' });
    }
  }

  PostLink.init(
    {
      post_id: { type: DataTypes.INTEGER, allowNull: false },
      label: { type: DataTypes.STRING, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      order_no: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, modelName: 'PostLink', tableName: 'post_links' }
  );

  return PostLink;
};
