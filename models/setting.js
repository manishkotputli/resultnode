'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // Single-row settings table, matches the full Laravel settings migration
  // set (base + tagline/home_note/update_settings_table additions).
  class Setting extends Model {
    static associate() {}
  }
  Setting.init(
    {
      site_title: DataTypes.STRING,
      tagline: DataTypes.STRING,
      home_note: DataTypes.TEXT,
      meta_title: DataTypes.STRING,
      meta_description: DataTypes.TEXT,
      meta_keywords: DataTypes.TEXT,
      logo: DataTypes.STRING,
      favicon: DataTypes.STRING,
      footer_logo: DataTypes.STRING,
      footer_text: DataTypes.TEXT,
      footer_copyright: DataTypes.STRING,
      contact_email: DataTypes.STRING,
      contact_phone: DataTypes.STRING,
      contact_address: DataTypes.TEXT,
      contact_hours: DataTypes.STRING,
      google_map_embed: DataTypes.TEXT,
      whatsapp_number: DataTypes.STRING,
      facebook_url: DataTypes.STRING,
      twitter_url: DataTypes.STRING,
      instagram_url: DataTypes.STRING,
      youtube_url: DataTypes.STRING,
      linkedin_url: DataTypes.STRING,
      telegram_url: DataTypes.STRING,
      android_app_url: DataTypes.STRING,
      ios_app_url: DataTypes.STRING,
      google_analytics: DataTypes.TEXT,
      google_tag_manager: DataTypes.TEXT,
      facebook_pixel: DataTypes.TEXT,
      header_script: DataTypes.TEXT,
      footer_script: DataTypes.TEXT,
      adsense_header: DataTypes.TEXT,
      adsense_footer: DataTypes.TEXT,
      adsense_sidebar: DataTypes.TEXT,
      smtp_host: DataTypes.STRING,
      smtp_port: DataTypes.STRING,
      smtp_username: DataTypes.STRING,
      smtp_password: DataTypes.STRING,
      maintenance_mode: { type: DataTypes.BOOLEAN, defaultValue: false },
      maintenance_title: DataTypes.STRING,
      maintenance_message: DataTypes.TEXT,
    },
    { sequelize, modelName: 'Setting', tableName: 'settings' }
  );
  return Setting;
};
