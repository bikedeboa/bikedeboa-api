var express 		= require('express'),
	methodOverride 	= require('method-override'),
	bodyParser 		= require('body-parser'),
	cors 			= require('cors'),
	app 			= express(),
	path    		= require('path');

// server config
app.use(methodOverride('X-HTTP-Method'));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('X-Method-Override'));
app.use(methodOverride('_method'));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended : true, limit: '50mb' }));
app.use(cors());

// router
app.use('/', require('./routes'));
app.use("/images", express.static(path.join(__dirname, 'images')));

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
