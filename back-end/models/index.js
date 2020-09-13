var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/sequelize_config.json');
var db = {};
var sequelize = new Sequelize(config[env].database, config[env].username, config[env].password, config[env]);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.user = require('./user')(sequelize, Sequelize);
db.board = require('./board')(sequelize, Sequelize);
db.email_verified_status = require('./email_verified_status')(sequelize, Sequelize);

module.exports = db;
