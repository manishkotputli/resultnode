'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate() {}
  }

  Banner.init(
    {
      text: { type: DataTypes.STRING, allowNull: false },
      url: { type: DataTypes.STRING },
      color: { type: DataTypes.STRING },
      image: {
      type: DataTypes.STRING,
      allowNull: true
    },
      status: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'Banner', tableName: 'banners',timestamps: false }
  );

  return Banner;
};
