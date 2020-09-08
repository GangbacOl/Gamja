var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json');
var db = {};
var sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Board = require('./board')(sequelize, Sequelize);

module.exports = db;
