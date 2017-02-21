let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let RevisionController = require('../controllers/RevisionController')(models.Revision)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.get('/', RevisionController.getAll.bind(RevisionController))
router.get('/:_id', RevisionController.getById.bind(RevisionController))
router.post('/', AuthController.middlewareLogging, RevisionController.create.bind(RevisionController))
router.put('/:_id', AuthController.middlewareLogging, RevisionController.update.bind(RevisionController))
router.delete('/:_id', AuthController.middlewareLogging, RevisionController.remove.bind(RevisionController))

module.exports = router
