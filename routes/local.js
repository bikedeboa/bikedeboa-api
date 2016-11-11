var express = require('express'),
    router  = express.Router();

var models = require('../models');
var LocalController = require('../controllers/LocalController')(models.Local);
var AuthController = require('../controllers/AuthController')(models.User);

router.use(AuthController.middlewareAuth);

router.get('/', LocalController.getAll.bind(LocalController));
router.get('/light', LocalController.getAllLight.bind(LocalController));
router.get('/:_id', LocalController.getById.bind(LocalController));
router.post('/', LocalController.create.bind(LocalController));
router.put('/:_id', LocalController.update.bind(LocalController));
router.delete('/:_id', LocalController.remove.bind(LocalController));
router.delete('/', LocalController.removeAll.bind(LocalController));

module.exports = router;