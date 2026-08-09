'use strict';
const { Model } = require('sequelize');

// mysql2 auto-parses native JSON columns into JS objects, but depending on
// driver/Sequelize version combos a JSON column can also come back as a raw
// string. These getters normalize either case so every reader in the app
// (views, services, the scraper engine) always gets a real object.
function safeJsonGetter(field) {
  return function () {
    const raw = this.getDataValue(field);
    if (raw == null) return raw;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return raw;
  };
}

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

      // Which post categories this site's scraped items should map to (array of category slugs).
      categories: { type: DataTypes.JSON, get: safeJsonGetter('categories') },

      // 'puppeteer' (JS-rendered sites) | 'cheerio' (static HTML, faster/lighter)
      scraper_type: { type: DataTypes.STRING(20), defaultValue: 'puppeteer' },

      // manual | every_1m | every_5m | every_10m | every_30m | hourly | every_2h |
      // every_6h | every_12h | daily | weekly | monthly | custom
      schedule_type: { type: DataTypes.STRING(20), defaultValue: 'manual' },
      cron_expression: DataTypes.STRING(50),

      // { list_selector, title_selector, link_selector, date_selector }
      // CSS selectors the scraper uses to find the listing items on base_url.
      selectors: { type: DataTypes.JSON, get: safeJsonGetter('selectors') },

      next_run_at: DataTypes.DATE,
      last_status: DataTypes.STRING(20), // success | failed | running
      last_error: DataTypes.TEXT,
    },
    { sequelize, modelName: 'ScrapingWebsite', tableName: 'scraping_websites',timestamps:false }
  );
  return ScrapingWebsite;
};
