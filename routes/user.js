var express = require('express'),
    router  = express.Router();

var models = require('../models');
var UserController = require('../controllers/UserController')(models.User);
var AuthController = require('../controllers/AuthController')(models.User);

router.get('/', AuthController.middlewareAuth, UserController.getAll.bind(UserController));
router.get('/:_id', AuthController.middlewareAuth, UserController.getById.bind(UserController));
router.post('/', UserController.create.bind(UserController));
router.put('/:_id', AuthController.middlewareAuth, UserController.update.bind(UserController));
router.delete('/:_id', AuthController.middlewareAuth, UserController.remove.bind(UserController));

module.exports = router;
