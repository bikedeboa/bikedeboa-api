let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let ReviewController = require('../controllers/ReviewController')(models.Review)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.get('/', ReviewController.getAll.bind(ReviewController))
router.get('/:_id', ReviewController.getById.bind(ReviewController))
router.put('/:_id', ReviewController.update.bind(ReviewController))
router.delete('/:_id', AuthController.middlewareLogging, ReviewController.remove.bind(ReviewController))
router.post('/', AuthController.middlewareLogging, ReviewController.create.bind(ReviewController))

module.exports = router
