var express = require('express'),
  	router  = express.Router();

var models = require('../models');
var AuthController = require('../controllers/AuthController')(models.User);

// authentication
router.use('/token', require('./auth'));
// log
router.use('/log', require('./log'));
// user
router.use('/user', require('./user'));
// tag
router.use('/tag', require('./tag'));
// local
router.use('/local', require('./local'));
// checkin
router.use('/checkin', require('./checkin'));
// review
router.use('/review', require('./review'));
// revision
router.use('/revision', require('./revision'));
// docs
router.use('/v1/doc', require('./doc'));

module.exports = router;
