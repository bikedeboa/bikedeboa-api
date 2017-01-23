var express = require('express'),
    router  = express.Router(),
    acl 	  = require('express-acl');

var models = require('../models');
var ReviewController = require('../controllers/ReviewController')(models.Review);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);
router.use(acl.authorize);

router.get('/', ReviewController.getAll.bind(ReviewController));
router.get('/:_id', ReviewController.getById.bind(ReviewController));
router.delete('/:_id', AuthController.middlewareLogging, ReviewController.remove.bind(ReviewController));
router.post('/', AuthController.middlewareLogging, ReviewController.create.bind(ReviewController));

module.exports = router;
