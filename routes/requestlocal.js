let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let RequestLocalController = require('../controllers/RequestLocalController')(models.RequestLocal)
let AuthController = require('../controllers/AuthController')(models.User)

router.get('/', AuthController.middlewareAuth, acl.authorize, RequestLocalController.getAll.bind(RequestLocalController))
router.get('/light', RequestLocalController.getAllLight.bind(RequestLocalController))
router.get('/:_id', RequestLocalController.getById.bind(RequestLocalController))
router.post('/', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, RequestLocalController.create.bind(RequestLocalController))
router.put('/:_id', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, RequestLocalController.update.bind(RequestLocalController))
router.delete('/:_id', AuthController.middlewareAuth, acl.authorize, AuthController.middlewareLogging, RequestLocalController.remove.bind(RequestLocalController))

module.exports = router
