var express = require('express'),
    router  = express.Router();

var models = require('../models');
var ReviewController = require('../controllers/ReviewController')(models.Review);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);

router.get('/', ReviewController.getAll.bind(ReviewController));
router.get('/:_id', ReviewController.getById.bind(ReviewController));
router.delete('/:_id', ReviewController.remove.bind(ReviewController));
router.post('/', ReviewController.create.bind(ReviewController));

module.exports = router;