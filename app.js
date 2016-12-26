var express 		 = require('express'),
	methodOverride = require('method-override'),
	bodyParser 		 = require('body-parser'),
	cors 					 = require('cors'),
	app 					 = express(),
	path 					 = require('path'),
	swig					 = require('swig'),
	acl 					 = require('express-acl'),
	helmet				 = require('helmet'),
	compression		 = require('compression');

// server config
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended : true, limit: '50mb' }));
app.use(helmet());
app.use(cors({
	origin: ['https://www.bikedeboa.com.br'],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'x-access-token']
}));
app.use(compression());

// static
app.use(express.static(path.join(__dirname, 'public')));

// setup swig
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);

// setup acl
acl.config({
	baseUrl: '/',
  filename:'acl.json',
  path:'config'
});

// router
app.use('/', require('./routes'));

// error handling
app.use(function(request, response, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function(err, request, response, next) {
	response.status(err.status || 500).json({ error: err.errors || err.message });
});

// server listener
module.exports = app;

//export DEBUG=api:* && export NODE_ENV=development && npm run nodemon
