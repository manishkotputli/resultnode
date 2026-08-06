'use strict';
require('dotenv').config();
console.log("ENV =", process.env.ENV);
console.log("LOCAL_DB_USER =", process.env.LOCAL_DB_USERNAME);
console.log("PROD_DB_USER =", process.env.PROD_DB_USERNAME);
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

const globals = require('./middlewares/globals');
const maintenanceMode = require('./middlewares/maintenanceMode');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const webRoutes = require('./routes/web/index');
const adminRoutes = require('./routes/admin/index');

const app = express();
const PORT = process.env.APP_PORT || 3000;
console.log(process.env.ENV);
console.log(process.env.LOCAL_DB_USERNAME);
console.log(process.env.PROD_DB_USERNAME);
// ---- view engine ----
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ---- logging ----
const logDir = path.join(__dirname, 'storage', 'logs');
fs.mkdirSync(logDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

// ---- security / perf ----
// CSP disabled: the ported UI relies heavily on inline style="" attributes
// (marquee/top-box colours, dynamic field values) - enabling a default CSP
// would silently break that styling.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());

// ---- body parsing ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- static files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- sessions + flash ----
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);
app.use(flash());

// ---- globals (site_setting, navCategories, currentUser, formatDate...) ----
app.use(globals);


// ---- routes ----
app.use('/admin', adminRoutes);
app.use(maintenanceMode);
app.use('/', webRoutes);

// ---- errors ----
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
