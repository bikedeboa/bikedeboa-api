let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let AuthController = require('../controllers/AuthController')(models.User)
let StatsController = require('../controllers/StatsController')()

// router.use(AuthController.middlewareAuth)
// router.use(acl.authorize)

router.get('/', AuthController.middlewareAuth, acl.authorize, StatsController.getAll.bind(StatsController))

module.exports = router
