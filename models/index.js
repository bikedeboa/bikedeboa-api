'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, {
    // custom host; default: localhost
    host: config.server,

    // custom port; default: 3306
    port: config.port,

    // custom protocol
    // - default: 'tcp'
    // - added in: v1.5.0
    // - postgres only, useful for heroku
    protocol: config.protocol,

    // disable logging; default: console.log
    logging: false,

    // the sql dialect of the database
    // - default is 'mysql'
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: config.dialect,

    dialectOptions: {
        ssl: config.ssl
    }
  });
}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
