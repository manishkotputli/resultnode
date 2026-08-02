'use strict';

// Simple page-window builder for the pagination partial (mirrors the look
// of Laravel's ->links(), minus the exact Bootstrap markup which the site's
// own CSS never styled anyway).
function buildPagination(currentPage, totalItems, perPage, baseUrl) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const windowSize = 2;
  const pages = [];
  for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
    pages.push(p);
  }
  return {
    page,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    pages,
    baseUrl,
  };
}

module.exports = { buildPagination };
