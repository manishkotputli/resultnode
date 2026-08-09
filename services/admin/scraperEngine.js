'use strict';
/**
 * Generic, selector-driven scraper built on Puppeteer.
 *
 * Each ScrapingWebsite stores CSS selectors (set by the admin in the
 * Websites form) describing how to find the listing on `base_url`:
 *   selectors.list_selector   -> selector matching each list item (e.g. "table tr", "ul li a")
 *   selectors.title_selector  -> selector (relative to the item) for the title text
 *   selectors.link_selector   -> selector (relative to the item) for the detail link (falls back to the item itself if it's an <a>)
 *   selectors.date_selector   -> optional selector for a date string shown in the listing
 *
 * This intentionally does NOT hardcode any specific website's markup -
 * every real Sarkari-result-style site has different HTML, so the admin
 * supplies selectors per website via the UI (Websites > Add/Edit).
 *
 * NOTE: Puppeteer needs to download a Chromium binary on `npm install`,
 * which requires internet access to Google's CDN. That step (and actually
 * running this scraper against a live website) could not be executed or
 * tested inside the sandbox this code was written in - it will work once
 * `npm install` completes on your own machine/server.
 */
const puppeteer = require('puppeteer');

async function scrapeListing(website) {
  let selectors = website.selectors || {};
  if (typeof selectors === 'string') {
    try {
      selectors = JSON.parse(selectors);
    } catch (e) {
      selectors = {};
    }
  }
  if (!selectors.list_selector || !selectors.title_selector) {
    const err = new Error('This website has no selectors configured yet. Edit it and set at least a List Selector and Title Selector.');
    err.status = 400;
    throw err;
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
    );
    await page.goto(website.base_url, { waitUntil: 'networkidle2', timeout: 45000 });

    const items = await page.evaluate((sel) => {
      const results = [];
      document.querySelectorAll(sel.list_selector).forEach((el) => {
        const titleEl = sel.title_selector ? el.querySelector(sel.title_selector) : el;
        const linkEl = sel.link_selector ? el.querySelector(sel.link_selector) : el;
        const dateEl = sel.date_selector ? el.querySelector(sel.date_selector) : null;

        const title = titleEl ? titleEl.textContent.trim() : '';
        let link = linkEl ? linkEl.getAttribute('href') : null;
        const dateText = dateEl ? dateEl.textContent.trim() : null;

        if (title && link) {
          results.push({ title, link, dateText });
        }
      });
      return results;
    }, selectors);

    // Resolve relative links against the base URL.
    const base = new URL(website.base_url);
    return items.map((it) => ({
      title: it.title,
      detail_url: new URL(it.link, base).href,
      dateText: it.dateText || null,
    }));
  } finally {
    await browser.close();
  }
}

/**
 * Optionally fetch the full content of a single detail page, if the website
 * has a `detail_content_selector` configured. Returns plain HTML of that
 * element (kept simple - not sanitized, review before publishing).
 */
async function scrapeDetail(url, contentSelector) {
  if (!contentSelector) return null;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    const html = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.innerHTML.trim() : null;
    }, contentSelector);
    return html;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeListing, scrapeDetail };
