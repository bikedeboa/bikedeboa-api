var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var LocalController = require('../controllers/LocalController')(models.Local);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);
router.use(AuthController.middlewareLogging);

router.get('/', LocalController.getAll.bind(LocalController));
router.get('/light', LocalController.getAllLight.bind(LocalController));
router.get('/:_id', LocalController.getById.bind(LocalController));
router.post('/', LocalController.create.bind(LocalController));
router.put('/:_id', AuthController.middlewareValidIP, LocalController.update.bind(LocalController));
router.delete('/:_id', AuthController.middlewareValidIP, LocalController.remove.bind(LocalController));
router.delete('/', LocalController.removeAll.bind(LocalController));

module.exports = router;
