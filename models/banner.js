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
      status: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: 'Banner', tableName: 'banners' }
  );

  return Banner;
};
