var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var RevisionController = require('../controllers/RevisionController')(models.Revision);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);

router.get('/', RevisionController.getAll.bind(RevisionController));
router.get('/:_id', RevisionController.getById.bind(RevisionController));
router.post('/', AuthController.middlewareLogging, RevisionController.create.bind(RevisionController));
router.put('/:_id', AuthController.middlewareLogging, RevisionController.update.bind(RevisionController));
router.delete('/:_id', AuthController.middlewareLogging, RevisionController.remove.bind(RevisionController));

module.exports = router;
