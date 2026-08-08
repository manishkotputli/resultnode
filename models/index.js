'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const db = {};

const appEnv = (process.env.ENV || 'local').trim().toLowerCase();

const sequelizeEnv =
  appEnv === 'production'
    ? 'production'
    : 'development';

const config = require(path.join(__dirname, '..', 'config', 'config.js'))[sequelizeEnv];

console.log('================================');
console.log('ENV            :', appEnv);
console.log('SEQUELIZE ENV  :', sequelizeEnv);
console.log('Dialect        :', config.dialect);
console.log('Host           :', config.host);
console.log('Database       :', config.database);
console.log('Username       :', config.username);
console.log('================================');

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  ))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;