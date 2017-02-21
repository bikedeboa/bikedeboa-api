let express = require('express')
let router = express.Router()
let models = require('../models')
let AuthController = require('../controllers/AuthController')(models.User)

router.post('/', AuthController.token.bind(AuthController))

module.exports = router
