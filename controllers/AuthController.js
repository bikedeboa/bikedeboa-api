var debug   = require('debug')('api:controller:auth');
var jwt     = require('jwt-simple'),
    moment  = require('moment'),
    config  = require('config'),
    models  = require('../models'),
    fs      = require('fs'),
    path    = require('path'),
    winston = require('winston'),
    AWS     = require('aws-sdk'),
    uuid    = require('node-uuid'),
    s3      = new AWS.S3();

function AuthController(UserModel) {
    this.model = UserModel;
}

AuthController.prototype.middlewareAuth = function(request, response, next) {
	var token = request.query.token || request.headers['x-access-token'];
	if(!token) {
		var err = new Error('Forbidden');
  	err.status = 403;
  	return next(err);
	}
	try {
  	var decoded = jwt.decode(token, config.get('jwtTokenSecret'));
  	var isExpired = moment(decoded.exp).isBefore(new Date());
    if(isExpired) {
        var err = new Error('Unauthorized');
        err.status = 401;
        return next(err);
    } else {
        request.decoded = decoded;
        next();
    }
	} catch(err) {
  	return next(err);
	}
};

AuthController.prototype.token = function(request, response, next) {
  var username = request.body.username;
  var password = request.body.password;

  if(!username || !password) {
    var err = new Error('Bad request');
    err.status = 400;
    return next(err);
  }

  this.model.findOne({ where: {username: username} })
    .then(function(data) {
      	if (data) {
            if (data.validPassword(password, data.password)) {

              var expires = moment().add(1, 'days').valueOf();
              var token = jwt.encode({
                id: data.id,
                username: data.username,
                exp: expires,
                role: data.role
              }, config.get('jwtTokenSecret'));

              response.json({
                token: token
              });

          	} else {
            	var err = new Error('Unauthorized');
            	err.status = 401;
            	next(err);
          	}
        } else {
          var err = new Error('Login inexistent');
          err.status = 404;
          next(err);
        }
    })
    .catch(next);
};

AuthController.prototype.middlewareLogging = function(request, response, next) {
  var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
  var info = {
    user: request.decoded.username,
    enpoint: fullUrl,
    role: request.decoded.role
  };
  var filename = path.join(__dirname + '/../log', 'logfile.log');

  var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: filename })
    ]
  });

  logger.log('info', 'ok', info);

  // var fileStream = fs.createReadStream(filename);
  //
  // var putParams = {
  //     Bucket: 'bikedeboa',
  //     Key: 'logs/teste.log',
  //     Body: fileStream,
  //     ACL: 'public-read'
  // };

  // s3.putObject(putParams, function(putErr, putData){
  //     if(putErr){
  //         debug(putErr);
  //     } else {
  //         debug(putData);
  //     }
  // });

  next();
};

module.exports = function(UserModel) {
    return new AuthController(UserModel);
};
