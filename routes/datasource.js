let express = require('express')
let router = express.Router()
let acl = require('express-acl')
let models = require('../models')
let DataSourceController = require('../controllers/DataSourceController')(models.DataSource)
let AuthController = require('../controllers/AuthController')(models.User)

router.use(AuthController.middlewareAuth)
router.use(acl.authorize)

router.get('/', DataSourceController.getAll.bind(DataSourceController))
router.get('/:_id', DataSourceController.getById.bind(DataSourceController))
router.post('/', AuthController.middlewareLogging, DataSourceController.create.bind(DataSourceController))
router.put('/:_id', AuthController.middlewareLogging, DataSourceController.update.bind(DataSourceController))
router.delete('/:_id', AuthController.middlewareLogging, DataSourceController.remove.bind(DataSourceController))
 
module.exports = router
  