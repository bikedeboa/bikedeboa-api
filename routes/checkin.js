var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var CheckinController = require('../controllers/CheckinController')(models.Checkin);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);
router.use(AuthController.middlewareLogging);

router.get('/', CheckinController.getAll.bind(CheckinController));
router.get('/:_id', CheckinController.getById.bind(CheckinController));
router.post('/', CheckinController.create.bind(CheckinController));

module.exports = router;
