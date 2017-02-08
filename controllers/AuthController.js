var debug           = require('debug')('api:controller:auth');
    jwt             = require('jwt-simple'),
    moment          = require('moment'),
    config          = require('config'),
    models          = require('../models');

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
  	var decoded = jwt.decode(token, process.env.JWT_TKN_SECRET);
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
              }, process.env.JWT_TKN_SECRET);

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
    role: request.decoded.role,
    endpoint: fullUrl,
    body: request.body,
    method: request.method,
    ip_origin: request.get('ip_origin') || ''
  };

  models.Log.create(info);

  next();
};

AuthController.prototype.middlewareValidIP = function(request, response, next) {
  var ip_origin = request.get('ip_origin') || '',
      role      = request.decoded.role;

  var query = {
    attributes: ['id', 'authorIP'],
    where: {id: request.params._id}
  };

  return models.Local.find(query)
    .then(function(data){
      if (ip_origin === data.authorIP) {
        next();
      } else if (role === 'colaborator' || role === 'admin') {
        next();
      } else {
        var err = new Error('Unauthorized');
        err.status = 401;
        next(err);
      }
      return data;
    })
    .catch(next);
};

module.exports = function(UserModel) {
    return new AuthController(UserModel);
};
