let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let LogController = require('../controllers/LogController')(models.Log)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.get('/:_page?', LogController.getAll.bind(LogController))

module.exports = router
