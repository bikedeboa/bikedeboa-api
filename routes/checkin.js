let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let CheckinController = require('../controllers/CheckinController')(models.Checkin)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.get('/', CheckinController.getAll.bind(CheckinController))
router.get('/:_id', CheckinController.getById.bind(CheckinController))
router.post('/', AuthController.middlewareLogging, CheckinController.create.bind(CheckinController))

module.exports = router
