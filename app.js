'use strict';

require('dotenv').config();

console.log("================================");
console.log("ENV =", process.env.ENV);
console.log("LOCAL_DB_USER =", process.env.LOCAL_DB_USERNAME);
console.log("PROD_DB_USER =", process.env.PROD_DB_USERNAME);
console.log("================================");

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
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

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
fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);

app.use(morgan('dev'));
app.use(morgan('combined', { stream: accessLogStream }));

/* ---------------------------------------
   Security
---------------------------------------- */

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.use(compression());
app.use(cors());

/* ---------------------------------------
   Body Parser
---------------------------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------------------------------
   Static Files
---------------------------------------- */

app.use(express.static(path.join(__dirname, 'public')));

/* ---------------------------------------
   Session
---------------------------------------- */

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'change_this_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
    })
);

app.use(flash());

/* ---------------------------------------
   Global Middleware
---------------------------------------- */

app.use(globals);

/* ---------------------------------------
   Routes
---------------------------------------- */

app.use('/admin', adminRoutes);

app.use(maintenanceMode);

app.use('/', webRoutes);

/* ---------------------------------------
   Error Handler
---------------------------------------- */

app.use(notFoundHandler);
app.use(errorHandler);

/* ---------------------------------------
   Start Server
---------------------------------------- */

async function startServer() {

    try {

        await sequelize.authenticate();

        console.log("✅ Database Connected");

        if (process.env.ENV === "production") {

            console.log("🚀 Running Database Migrations...");

            execSync(
                "node node_modules/sequelize-cli/lib/sequelize db:migrate",
                {
                    stdio: "inherit",
                    env: {
                        ...process.env,
                        NODE_ENV: "production",
                    },
                }
            );

            /**
             * Seed only if explicitly enabled
             *
             * RUN_SEED=true
             */
            if (process.env.RUN_SEED === "true") {

                console.log("🌱 Running Database Seeders...");

                execSync(
                    "node node_modules/sequelize-cli/lib/sequelize db:seed:all",
                    {
                        stdio: "inherit",
                        env: {
                            ...process.env,
                            NODE_ENV: "production",
                        },
                    }
                );
            }

            console.log("✅ Database Ready");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (err) {

        console.error("❌ Startup Error");
        console.error(err);

        process.exit(1);
    }

}

startServer();

module.exports = app;