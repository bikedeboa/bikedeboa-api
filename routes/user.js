var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var UserController = require('../controllers/UserController')(models.User);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);
router.use(AuthController.middlewareLogging);

router.get('/', UserController.getAll.bind(UserController));
router.get('/:_id', UserController.getById.bind(UserController));
router.post('/', UserController.create.bind(UserController));
router.put('/:_id', UserController.update.bind(UserController));
router.delete('/:_id', UserController.remove.bind(UserController));

module.exports = router;
