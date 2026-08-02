'use strict';
const moment = require('moment');

// Mirrors Laravel's ->format('d M Y') used throughout the blade views.
function formatDate(date, fmt = 'DD MMM YYYY') {
  if (!date) return '';
  return moment(date).format(fmt);
}

function timeAgo(date) {
  if (!date) return '';
  return moment(date).fromNow();
}

// ~200 words/minute, same convention implied by the existing word_count/read_time blog fields.
function calcReadTime(content) {
  if (!content) return 1;
  const words = String(content).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function wordCount(content) {
  if (!content) return 0;
  return String(content).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

module.exports = { formatDate, timeAgo, calcReadTime, wordCount };
