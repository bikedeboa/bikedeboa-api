let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let AuthController = require('../controllers/AuthController')(models.User)
let StatsController = require('../controllers/StatsController')()

router.get('/', StatsController.getAll.bind(StatsController))

module.exports = router
