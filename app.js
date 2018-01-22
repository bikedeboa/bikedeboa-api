let express = require('express')
let methodOverride = require('method-override')
let bodyParser = require('body-parser')
let cors = require('cors')
let app = express()
let path = require('path')
let swig = require('swig')
let acl = require('express-acl')
let helmet = require('helmet')
let compression = require('compression')

// server config
app.use(methodOverride('X-HTTP-Method'))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride('X-Method-Override'))
app.use(methodOverride('_method'))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(helmet())
app.use(cors({
  origin: ['https://www.bikedeboa.com.br', 'https://bikedeboa-dev.herokuapp.com', 'https://bikedeboa-dev2.herokuapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-access-token', 'ip_origin']
}))
app.use(compression())

// static
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '5d' }));

// setup swig
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))
app.engine('html', swig.renderFile)

// setup acl
acl.config({
  baseUrl: '/',
  filename: 'acl.json',
  path: 'config'
})

// skip favicon
app.use(function (request, response, next) {
  if (request.url === '/favicon.ico') {
    response.writeHead(200, {'Content-Type': 'image/x-icon'})
    response.end('')
  } else {
    next()
  }
})

// cache control
app.use(function (req, res, next) {
  res.setHeader('Cache-Control', 'public, max-age=432000');
  return next();
})

// router
app.use('/', require('./routes'))

// error handling
app.use(function (request, response, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function (err, request, response, next) {
  response.status(err.status || 500).json({ error: err.errors || err.message })
})

// server listener
module.exports = app

// start api: export DEBUG=api:* && export JWT_TKN_SECRET=testBdb && export NODE_ENV=development && export SUPPRESS_NO_CONFIG_WARNING=false && npm run nodemon
// see fixes pattern code: standard 'app.js' 'routes/*.js' 'controllers/*.js'
