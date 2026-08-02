'use strict';

function notFoundHandler(req, res) {
  res.status(404).render('errors/error', { status: 404, message: 'Page Not Found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).render('errors/error', {
    status,
    message: status === 500 ? 'Something went wrong. Please try again.' : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
