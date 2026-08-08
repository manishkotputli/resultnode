'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Existing table, extended with status + post_id so scraped content lands
  // as a draft here first and only becomes a real Post once published from
  // the (future) admin side, per the user's explicit requirement.
  class ScrapingLog extends Model {
    static associate(models) {
      ScrapingLog.belongsTo(models.ScrapingWebsite, { foreignKey: 'scraping_website_id' });
      ScrapingLog.belongsTo(models.Post, { foreignKey: 'post_id' });
    }
  }
  ScrapingLog.init(
    {
      scraping_website_id: { type: DataTypes.INTEGER, allowNull: false },
      post_title: DataTypes.STRING,
      detail_url: DataTypes.STRING,
      // Full scraped payload, same shape as a post's fields + dynamic fields
      scraped_data: DataTypes.JSON,
      status: { type: DataTypes.STRING(20), defaultValue: 'draft' }, // draft | published | rejected
      post_id: { type: DataTypes.INTEGER },
      scraped_at: DataTypes.DATE,
    },
    { sequelize, modelName: 'ScrapingLog', tableName: 'scraping_logs',timestamps: false }
  );
  return ScrapingLog;
};
