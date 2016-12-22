var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var AuthController = require('../controllers/AuthController')(models.User);

router.post('/', AuthController.token.bind(AuthController));

module.exports = router;
