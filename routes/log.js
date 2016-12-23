var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var LogController = require('../controllers/LogController')(models.Log);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);

router.get('/', LogController.getAll.bind(LogController));

module.exports = router;
