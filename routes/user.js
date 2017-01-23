var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var UserController = require('../controllers/UserController')(models.User);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);

router.get('/', UserController.getAll.bind(UserController));
router.get('/:_id', UserController.getById.bind(UserController));
router.post('/', AuthController.middlewareLogging, UserController.create.bind(UserController));
router.put('/:_id', AuthController.middlewareLogging, UserController.update.bind(UserController));
router.delete('/:_id', AuthController.middlewareLogging, UserController.remove.bind(UserController));
router.delete('/', AuthController.middlewareLogging, UserController.removeAll.bind(UserController));

module.exports = router;
