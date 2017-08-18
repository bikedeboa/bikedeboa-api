let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let UserController = require('../controllers/UserController')(models.User)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.get('/', UserController.getAll.bind(UserController)) 
router.get('/reviews', UserController.getCurrentUserReviews.bind(UserController))
router.get('/locals', UserController.getCurrentUserLocals.bind(UserController))
router.get('/current', UserController.getCurrentUser.bind(UserController))
router.get('/:_id', UserController.getById.bind(UserController))
router.post('/', AuthController.middlewareLogging, UserController.create.bind(UserController))
router.put('/:_id', AuthController.middlewareLogging, UserController.update.bind(UserController))
router.post('/import-reviews', UserController.importReviewsToCurrentUser.bind(UserController))
router.delete('/:_id', AuthController.middlewareLogging, UserController.remove.bind(UserController))
router.delete('/', AuthController.middlewareLogging, UserController.removeAll.bind(UserController))

module.exports = router
