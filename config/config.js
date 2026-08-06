require("dotenv").config();

const isProduction = process.env.APP_ENV === "production";
const prefix = isProduction ? "PROD_" : "LOCAL_";

const databaseConfig = {
  dialect: process.env[`${prefix}DB_DIALECT`] || "mysql",
  host: process.env[`${prefix}DB_HOST`],
  port: Number(process.env[`${prefix}DB_PORT`]) || 3306,
  username: process.env[`${prefix}DB_USER`],
  password: process.env[`${prefix}DB_PASSWORD`] || "",
  database: process.env[`${prefix}DB_NAME`],
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: databaseConfig,
  test: databaseConfig,
  production: databaseConfig,
};