'use strict';
const repo = require('../../repositories/admin/settings.repository');

const TEXT_FIELDS = [
  'site_title', 'tagline', 'home_note', 'meta_title', 'meta_description', 'meta_keywords',
  'footer_text', 'footer_copyright',
  'contact_email', 'contact_phone', 'contact_address', 'contact_hours', 'google_map_embed',
  'whatsapp_number', 'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url',
  'linkedin_url', 'telegram_url', 'android_app_url', 'ios_app_url',
  'google_analytics', 'google_tag_manager', 'facebook_pixel', 'header_script', 'footer_script',
  'adsense_header', 'adsense_footer', 'adsense_sidebar',
  'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
  'maintenance_title', 'maintenance_message',
];

async function getSettings() {
  return repo.get();
}

async function updateSettings(body, files) {
  const setting = await repo.get();
  const data = {};

  TEXT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field] || null;
  });

  data.maintenance_mode = body.maintenance_mode === 'on';

  if (files) {
    if (files.logo && files.logo[0]) data.logo = `/uploads/settings/${files.logo[0].filename}`;
    if (files.favicon && files.favicon[0]) data.favicon = `/uploads/settings/${files.favicon[0].filename}`;
    if (files.footer_logo && files.footer_logo[0]) data.footer_logo = `/uploads/settings/${files.footer_logo[0].filename}`;
  }

  return repo.update(setting, data);
}

module.exports = { getSettings, updateSettings };
