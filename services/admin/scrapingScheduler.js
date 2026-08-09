'use strict';
/**
 * Optional automatic scraping scheduler, built on `node-cron`.
 *
 * This is NOT wired into app.js by default — automated scraping means
 * Puppeteer launching a real Chromium browser on a timer, which is heavy
 * and only makes sense once you've tested individual websites manually
 * (Websites > Run Now) and confirmed their selectors work.
 *
 * To enable it, add this near the bottom of app.js, after the server starts
 * listening:
 *
 *   const { startScheduler } = require('./services/admin/scrapingScheduler');
 *   startScheduler();
 */
const cron = require('node-cron');
const db = require('../../models');
const websiteService = require('./scrapingWebsite.service');

const FIXED_CRON = {
  every_1m: '*/1 * * * *',
  every_5m: '*/5 * * * *',
  every_10m: '*/10 * * * *',
  every_30m: '*/30 * * * *',
  hourly: '0 * * * *',
  every_2h: '0 */2 * * *',
  every_6h: '0 */6 * * *',
  every_12h: '0 */12 * * *',
  daily: '0 0 * * *',
  weekly: '0 0 * * 0',
  monthly: '0 0 1 * *',
};

const scheduledTasks = new Map(); // websiteId -> cron task

function cronExpressionFor(website) {
  if (website.schedule_type === 'custom') return website.cron_expression;
  return FIXED_CRON[website.schedule_type] || null;
}

async function runWebsiteSafely(id) {
  try {
    const result = await websiteService.runNow(id);
    console.log(`[scraper] website #${id}: ${result.imported} imported, ${result.skipped} skipped`);
  } catch (err) {
    console.error(`[scraper] website #${id} failed:`, err.message);
  }
}

async function startScheduler() {
  const websites = await db.ScrapingWebsite.findAll({ where: { is_active: true } });

  websites.forEach((website) => {
    const expr = cronExpressionFor(website);
    if (!expr || !cron.validate(expr)) return;

    const task = cron.schedule(expr, () => runWebsiteSafely(website.id));
    scheduledTasks.set(website.id, task);
    console.log(`[scraper] scheduled "${website.name}" -> ${expr}`);
  });

  console.log(`[scraper] scheduler started with ${scheduledTasks.size} active job(s)`);
}

function stopScheduler() {
  scheduledTasks.forEach((task) => task.stop());
  scheduledTasks.clear();
}

module.exports = { startScheduler, stopScheduler };
