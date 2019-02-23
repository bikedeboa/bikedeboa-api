let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let SupportController = require('../controllers/SupportController')(models.Support)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.delete('/:_id', AuthController.middlewareLogging, SupportController.remove.bind(SupportController))
router.post('/', AuthController.middlewareLogging, SupportController.create.bind(SupportController))

module.exports = router
