let express = require('express')
let router = express.Router()

// authentication
router.use('/token', require('./auth'))
// log
router.use('/log', require('./log'))
// user
router.use('/user', require('./user'))
// tag
router.use('/tag', require('./tag'))
// local
router.use('/local', require('./local'))
//requestLocal
router.use('/requestlocal', require('./requestlocal'))
// checkin
router.use('/checkin', require('./checkin'))
// review
router.use('/review', require('./review'))
// revision
router.use('/revision', require('./revision'))
//support
router.use('/support', require('./revision'))
// datasource
router.use('/datasource', require('./datasource'))
// datasource
router.use('/stats', require('./stats'))
// docs
router.use('/v1/doc', require('./doc'))

module.exports = router
