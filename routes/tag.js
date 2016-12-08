var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var TagController = require('../controllers/TagController')(models.Tag);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);
router.use(AuthController.middlewareLogging);

router.get('/', TagController.getAll.bind(TagController));
router.get('/:_id', TagController.getById.bind(TagController));
router.post('/', TagController.create.bind(TagController));
router.put('/:_id', TagController.update.bind(TagController));
router.delete('/:_id', TagController.remove.bind(TagController));

module.exports = router;
