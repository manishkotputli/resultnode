require("dotenv").config();

const env = process.env.ENV || "local";
const isLocal = env === "local";

const commonOptions = {
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 60000,
  },
  pool: {
    max: 50,
    min: 0,
    acquire: 60000,
    idle: 20000,
    evict: 15000,
  },
};

module.exports = {
  development: {
    username: process.env.LOCAL_DB_USERNAME,
    password: process.env.LOCAL_DB_PASSWORD,
    database: process.env.LOCAL_DB_NAME,
    host: process.env.LOCAL_DB_HOST,
    port: process.env.LOCAL_DB_PORT || 3306,
    ...commonOptions,
  },

  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT || 3306,
    ...commonOptions,
  },
};