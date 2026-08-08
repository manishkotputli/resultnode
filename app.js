'use strict';

require('dotenv').config();

console.log('================================');
console.log('ENV =', process.env.ENV);
console.log('LOCAL_DB_USER =', process.env.LOCAL_DB_USERNAME);
console.log('PROD_DB_USER =', process.env.PROD_DB_USERNAME);
console.log('================================');

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
const { execSync } = require('child_process');

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
   Logging
---------------------------------------- */

const logDir = path.join(__dirname, 'storage', 'logs');

fs.mkdirSync(logDir, {
    recursive: true
});

const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    {
        flags: 'a'
    }
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
   Body Parser
---------------------------------------- */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

/* ---------------------------------------
   Static Files
---------------------------------------- */

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

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
   GLOBAL MIDDLEWARE
---------------------------------------- */

/*
 * IMPORTANT:
 * Keep this OUTSIDE startServer().
 *
 * This makes it available when Hostinger/
 * Passenger loads module.exports = app.
 */
app.use(globals);

/* ---------------------------------------
   ADMIN ROUTES
---------------------------------------- */

app.use('/admin', adminRoutes);

/* ---------------------------------------
   MAINTENANCE MODE
---------------------------------------- */

app.use(maintenanceMode);

/* ---------------------------------------
   WEB ROUTES
---------------------------------------- */

app.use('/', webRoutes);

/* ---------------------------------------
   TEST ROUTE
---------------------------------------- */

/*
 * Temporary test route.
 *
 * Open:
 * https://sarkariresultess.com/test
 *
 * If it shows "Express is working",
 * Express + route loading is working.
 *
 * You can remove this later.
 */
app.get('/test', (req, res) => {
    res.send('Express is working');
});

/* ---------------------------------------
   404 HANDLER
---------------------------------------- */

app.use(notFoundHandler);

/* ---------------------------------------
   ERROR HANDLER
---------------------------------------- */

app.use(errorHandler);

/* =======================================
   DATABASE + MIGRATION STARTUP
======================================= */

async function startServer() {
    try {

        /* ---------------------------------------
           Database Connection
        ---------------------------------------- */

        await sequelize.authenticate();

        console.log('✅ Database Connected');

        /* ---------------------------------------
           Production Migrations
        ---------------------------------------- */

        if (process.env.ENV === 'production') {

            const NODE_BIN = process.execPath;

            console.log('========================================');
            console.log('Node Binary :', NODE_BIN);
            console.log('========================================');

            console.log('🚀 Running Database Migrations...');

            try {

                const output = execSync(
                    `"${NODE_BIN}" node_modules/sequelize-cli/lib/sequelize db:migrate`,
                    {
                        cwd: __dirname,

                        env: {
                            ...process.env,
                            NODE_ENV: 'production',
                            ENV: 'production'
                        },

                        encoding: 'utf8',

                        stdio: 'pipe'
                    }
                );

                console.log(output);

            } catch (e) {

                console.log('========================================');
                console.log('❌ MIGRATION FAILED');

                console.log('stdout:');
                console.log(
                    e.stdout?.toString() || ''
                );

                console.log('stderr:');
                console.log(
                    e.stderr?.toString() || ''
                );

                console.log('message:');
                console.log(e.message);

                console.log('========================================');

                throw e;
            }

            /* ---------------------------------------
               Seeders
            ---------------------------------------- */

            if (process.env.RUN_SEED === 'true') {

                console.log(
                    '🌱 Running Database Seeders...'
                );

                try {

                    const output = execSync(
                        `"${NODE_BIN}" node_modules/sequelize-cli/lib/sequelize db:seed:all`,
                        {
                            cwd: __dirname,

                            env: {
                                ...process.env,
                                NODE_ENV: 'production',
                                ENV: 'production'
                            },

                            encoding: 'utf8',

                            stdio: 'pipe'
                        }
                    );

                    console.log(output);

                } catch (e) {

                    console.log('========================================');
                    console.log('❌ SEED FAILED');

                    console.log('stdout:');
                    console.log(
                        e.stdout?.toString() || ''
                    );

                    console.log('stderr:');
                    console.log(
                        e.stderr?.toString() || ''
                    );

                    console.log('message:');
                    console.log(e.message);

                    console.log('========================================');

                    throw e;
                }
            }
        }

        console.log('✅ Database Ready');

        /* ---------------------------------------
           Direct Node Server
        ---------------------------------------- */

        /*
         * IMPORTANT:
         *
         * app.listen() only runs when this
         * file is directly executed:
         *
         * node app.js
         *
         * Hostinger/Passenger can instead
         * require/export this app.
         */
        if (require.main === module) {

            app.listen(PORT, () => {

                console.log(
                    `🚀 Server running on port ${PORT}`
                );

            });
        }

    } catch (err) {

        console.error('❌ Startup Error');

        console.error(err);

        process.exit(1);
    }
}

/* ---------------------------------------
   Start only when directly executed
---------------------------------------- */

if (require.main === module) {
    startServer();
}

/* ---------------------------------------
   Export Express App
---------------------------------------- */

module.exports = app;