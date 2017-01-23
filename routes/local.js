var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var LocalController = require('../controllers/LocalController')(models.Local);
var AuthController = require('../controllers/AuthController')(models.User);

router.get('/', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, LocalController.getAll.bind(LocalController));
router.get('/light', LocalController.getAllLight.bind(LocalController));
router.get('/:_id', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, LocalController.getById.bind(LocalController));
router.post('/', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, LocalController.create.bind(LocalController));
router.put('/:_id', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, AuthController.middlewareValidIP, LocalController.update.bind(LocalController));
router.delete('/:_id', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareValidIP, AuthController.middlewareLogging, LocalController.remove.bind(LocalController));
router.delete('/', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, LocalController.removeAll.bind(LocalController));

module.exports = router;
