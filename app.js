'use strict';

require('dotenv').config();

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

const { sequelize } = require('./models');

const globals = require('./middlewares/globals');
const maintenanceMode = require('./middlewares/maintenanceMode');

const {
    notFoundHandler,
    errorHandler
} = require('./middlewares/errorHandler');

const webRoutes = require('./routes/web');
const adminRoutes = require('./routes/admin');

const app = express();

const PORT = process.env.APP_PORT || 3000;


/* ---------------------------------------
   View Engine
---------------------------------------- */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


/* ---------------------------------------
   Logs
---------------------------------------- */

const logDir = path.join(__dirname, 'storage', 'logs');

fs.mkdirSync(logDir, {
    recursive: true
});

const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);

app.use(morgan('dev'));

app.use(
    morgan('combined', {
        stream: accessLogStream
    })
);


/* ---------------------------------------
   Security
---------------------------------------- */

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(compression());
app.use(cors());


/* ---------------------------------------
   Body
---------------------------------------- */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());


/* ---------------------------------------
   Static
---------------------------------------- */

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* ---------------------------------------
   Robots.txt
---------------------------------------- */

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');

    res.send(
`User-agent: *
Allow: /

Sitemap: https://sarkariresultess.com/sitemap.xml`
    );
});
/* ---------------------------------------
   Session
---------------------------------------- */

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            'change_this_secret',

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    })
);

app.use(flash());


/* ---------------------------------------
   Database Connection
---------------------------------------- */

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database Connected');
    })
    .catch((error) => {
        console.error('❌ Database Connection Error');
        console.error(error);
    });


/* ---------------------------------------
   Global Middleware
---------------------------------------- */

app.use(globals);


/* ---------------------------------------
   Admin
---------------------------------------- */

app.use('/admin', adminRoutes);


/* ---------------------------------------
   Maintenance
---------------------------------------- */

app.use(maintenanceMode);


/* ---------------------------------------
   Web Routes
---------------------------------------- */

app.use('/', webRoutes);


/* ---------------------------------------
   404
---------------------------------------- */

app.use(notFoundHandler);


/* ---------------------------------------
   Error Handler
---------------------------------------- */

app.use(errorHandler);


/* ---------------------------------------
   Start Server
---------------------------------------- */

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});


module.exports = app;