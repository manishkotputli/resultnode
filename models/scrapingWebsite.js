'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScrapingWebsite extends Model {
    static associate(models) {
      ScrapingWebsite.hasMany(models.ScrapingLog, { foreignKey: 'scraping_website_id' });
    }
  }
  ScrapingWebsite.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      base_url: { type: DataTypes.STRING, allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      last_scraped_at: DataTypes.DATE,
    },
    { sequelize, modelName: 'ScrapingWebsite', tableName: 'scraping_websites' }
  );
  return ScrapingWebsite;
};
