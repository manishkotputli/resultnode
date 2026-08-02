require('dotenv').config();

/**
 * Sequelize-CLI config. Same file drives migrations, seeders and the app's
 * own connection (see models/index.js). DB_DIALECT switches the whole stack
 * between sqlite (zero-setup default, matches the Laravel app's own default)
 * and mysql/postgres for production.
 */
const dialect = process.env.DB_DIALECT || 'sqlite';

const base = {
  dialect,
  logging: false,
  define: {
    underscored: true, // created_at / updated_at style columns everywhere
  },
};

const sqlSettings =
  dialect === 'sqlite'
    ? { storage: process.env.DB_STORAGE || './database/database.sqlite' }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME,
      };

module.exports = {
  development: { ...base, ...sqlSettings },
  test: { ...base, ...sqlSettings },
  production: { ...base, ...sqlSettings },
};
