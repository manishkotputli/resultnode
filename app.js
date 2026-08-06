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
   Cross-process startup lock
   (global.__SERVER_STARTED__ only works within
   a single process — Hostinger/Passenger can spawn
   multiple processes for the same app, so we need a
   filesystem-based lock that works across processes)
---------------------------------------- */

const LOCK_FILE = path.join(__dirname, 'storage', '.startup.lock');
const LOCK_STALE_MS = 60 * 1000; // if a lock is older than this, assume the old process died and allow retake

function acquireStartupLock() {
    try {
        fs.mkdirSync(path.dirname(LOCK_FILE), { recursive: true });

        if (fs.existsSync(LOCK_FILE)) {
            const stats = fs.statSync(LOCK_FILE);
            const age = Date.now() - stats.mtimeMs;

            if (age < LOCK_STALE_MS) {
                // Another process already started (or is starting) recently
                return false;
            }

            // Stale lock, remove it and continue
            fs.unlinkSync(LOCK_FILE);
        }

        // 'wx' = fail if file already exists (atomic create)
        fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
        return true;

    } catch (err) {
        // If file already exists (race condition), another process won
        return false;
    }
}

function releaseStartupLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
        }
    } catch (err) {
        // ignore
    }
}

process.on('exit', releaseStartupLock);
process.on('SIGINT', () => { releaseStartupLock(); process.exit(0); });
process.on('SIGTERM', () => { releaseStartupLock(); process.exit(0); });

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
   Start Server
---------------------------------------- */

async function startServer() {
    try {

        await sequelize.authenticate();
        console.log("✅ Database Connected");

        // Only ONE process (across all workers) should run migrations + listen
        const gotLock = acquireStartupLock();

        if (!gotLock) {
            console.log("⚠️ Another process already handled startup (migrations/listen). Skipping in this process.");
            return;
        }

        if (process.env.ENV === "production") {

            const NODE_BIN = process.execPath;

            console.log("========================================");
            console.log("Node Binary :", NODE_BIN);
            console.log("========================================");

            console.log("🚀 Running Database Migrations...");

            try {

                const output = execSync(
                    `"${NODE_BIN}" node_modules/sequelize-cli/lib/sequelize db:migrate`,
                    {
                        cwd: __dirname,
                        env: {
                            ...process.env,
                            NODE_ENV: "production",
                            ENV: "production",
                        },
                        encoding: "utf8",
                        stdio: "pipe",
                    }
                );

                console.log(output);

            } catch (e) {

                console.log("========================================");
                console.log("❌ MIGRATION FAILED");
                console.log("stdout:");
                console.log(e.stdout?.toString() || "");

                console.log("stderr:");
                console.log(e.stderr?.toString() || "");

                console.log("message:");
                console.log(e.message);

                console.log("========================================");

                releaseStartupLock();
                throw e;
            }

            if (process.env.RUN_SEED === "true") {

                console.log("🌱 Running Database Seeders...");

                try {

                    const output = execSync(
                        `"${NODE_BIN}" node_modules/sequelize-cli/lib/sequelize db:seed:all`,
                        {
                            cwd: __dirname,
                            env: {
                                ...process.env,
                                NODE_ENV: "production",
                                ENV: "production",
                            },
                            encoding: "utf8",
                            stdio: "pipe",
                        }
                    );

                    console.log(output);

                } catch (e) {

                    console.log("========================================");
                    console.log("❌ SEED FAILED");

                    console.log("stdout:");
                    console.log(e.stdout?.toString() || "");

                    console.log("stderr:");
                    console.log(e.stderr?.toString() || "");

                    console.log("message:");
                    console.log(e.message);

                    console.log("========================================");

                    releaseStartupLock();
                    throw e;
                }
            }

            console.log("✅ Database Ready");

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
        }

        if (!global.__SERVER_STARTED__) {
            global.__SERVER_STARTED__ = true;

            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        }

    } catch (err) {

        console.error("❌ Startup Error");
        console.error(err);

        releaseStartupLock();
        process.exit(1);
    }
}


startServer();

module.exports = app;