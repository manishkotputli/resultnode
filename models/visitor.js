'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // General site-wide visit log (existing table, kept as-is).
  class Visitor extends Model {
    static associate() {}
  }
  Visitor.init(
    {
      ip: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      browser: DataTypes.STRING,
      device: DataTypes.STRING,
      page_url: DataTypes.STRING,
      hour: DataTypes.INTEGER,
      visit_date: DataTypes.DATEONLY,
      visits: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { sequelize, modelName: 'Visitor', tableName: 'visitors' }
  );
  return Visitor;
};
