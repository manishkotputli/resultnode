'use strict';
const websiteRepo = require('../../repositories/admin/scrapingWebsite.repository');
const contentRepo = require('../../repositories/admin/scrapedContent.repository');
const engine = require('./scraperEngine');

const SCHEDULE_MINUTES = {
  every_1m: 1,
  every_5m: 5,
  every_10m: 10,
  every_30m: 30,
  hourly: 60,
  every_2h: 120,
  every_6h: 360,
  every_12h: 720,
  daily: 1440,
  weekly: 10080,
  monthly: 43200,
};

function computeNextRun(scheduleType) {
  const minutes = SCHEDULE_MINUTES[scheduleType];
  if (!minutes) return null; // manual / custom (custom is driven by cron_expression via node-cron directly)
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function getList() {
  return websiteRepo.list();
}

async function getById(id) {
  return websiteRepo.findById(id);
}

function validate(body) {
  if (!body.name || !body.base_url) {
    const err = new Error('Website Name and URL are required.');
    err.status = 400;
    throw err;
  }
}

function buildData(body) {
  const categories = [].concat(body.categories || []).filter(Boolean);
  const selectors = {
    list_selector: body.list_selector || null,
    title_selector: body.title_selector || null,
    link_selector: body.link_selector || null,
    date_selector: body.date_selector || null,
    detail_content_selector: body.detail_content_selector || null,
  };
  return {
    name: body.name.trim(),
    base_url: body.base_url.trim(),
    is_active: body.is_active === 'on' || body.is_active === undefined,
    categories,
    scraper_type: body.scraper_type || 'puppeteer',
    schedule_type: body.schedule_type || 'manual',
    cron_expression: body.schedule_type === 'custom' ? (body.cron_expression || null) : null,
    selectors,
    next_run_at: computeNextRun(body.schedule_type),
  };
}

async function createWebsite(body) {
  validate(body);
  return websiteRepo.create(buildData(body));
}

async function updateWebsite(id, body) {
  const website = await websiteRepo.findById(id);
  if (!website) {
    const err = new Error('Website not found');
    err.status = 404;
    throw err;
  }
  validate(body);
  return websiteRepo.update(website, buildData(body));
}

async function deleteWebsite(id) {
  const website = await websiteRepo.findById(id);
  if (!website) {
    const err = new Error('Website not found');
    err.status = 404;
    throw err;
  }
  return websiteRepo.destroy(website);
}

/**
 * Runs one scrape pass for a website: fetches the listing, skips items
 * already seen (duplicate detail_url for this website), and inserts new
 * ScrapingLog rows with status 'draft' for admin review.
 */
async function runNow(id) {
  const website = await websiteRepo.findById(id);
  if (!website) {
    const err = new Error('Website not found');
    err.status = 404;
    throw err;
  }

  await websiteRepo.update(website, { last_status: 'running', last_error: null });

  let imported = 0;
  let skipped = 0;

  try {
    const items = await engine.scrapeListing(website);

    for (const item of items) {
      const existing = await contentRepo.findByDetailUrl(website.id, item.detail_url);
      if (existing) {
        skipped += 1;
        continue; // duplicate detection: skip already-seen items
      }

      let full_description = null;
      const detailSelector = website.selectors && website.selectors.detail_content_selector;
      if (detailSelector) {
        try {
          full_description = await engine.scrapeDetail(item.detail_url, detailSelector);
        } catch (e) {
          full_description = null; // detail fetch failing shouldn't fail the whole run
        }
      }

      await contentRepo.create({
        scraping_website_id: website.id,
        post_title: item.title,
        detail_url: item.detail_url,
        status: 'draft',
        scraped_at: new Date(),
        scraped_data: {
          title: item.title,
          detail_url: item.detail_url,
          date_text: item.dateText,
          category_id: null,
          short_description: null,
          full_description,
          meta_title: null,
          meta_description: null,
          tags: null,
        },
      });
      imported += 1;
    }

    await websiteRepo.update(website, {
      last_scraped_at: new Date(),
      last_status: 'success',
      last_error: null,
      next_run_at: computeNextRun(website.schedule_type),
    });

    return { imported, skipped, total: items.length };
  } catch (err) {
    await websiteRepo.update(website, {
      last_status: 'failed',
      last_error: String(err.message || err).slice(0, 1000),
    });
    throw err;
  }
}

module.exports = { getList, getById, createWebsite, updateWebsite, deleteWebsite, runNow, SCHEDULE_MINUTES };
