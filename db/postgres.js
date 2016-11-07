var sequelize = require('sequelize'),
    config    = require('config'),
    debug     = require('debug')('api:db');

var db = new sequelize(
	config.get('postgres.database'),
	config.get('postgres.username'), 
	config.get('postgres.password'), 
	{
		host: config.get('postgres.server'),
		dialect: config.get('postgres.dialect'),

		pool: {
	    	max: 5,
	    	min: 0,
	    	idle: 10000
	  	}
	});

module.exports = db;
