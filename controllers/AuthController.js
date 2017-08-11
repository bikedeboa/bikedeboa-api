let jwt = require('jwt-simple')
let moment = require('moment')
let models = require('../models')

function AuthController (UserModel) {
  this.model = UserModel
}

AuthController.prototype.middlewareAuth = function (request, response, next) {
  var token = request.query.token || request.headers['x-access-token']
  if (!token) {
    let err = new Error('Forbidden')
    err.status = 403
    return next(err)
  }
  try {
    let decoded = jwt.decode(token, process.env.JWT_TKN_SECRET)
    let isExpired = moment(decoded.exp).isBefore(new Date())
    if (isExpired) {
      let err = new Error('Unauthorized')
      err.status = 401
      return next(err)
    } else {
      request.decoded = decoded
      next()
    }
  } catch (err) {
    return next(err)
  }
}

// app.post('/api/auth', function (req, res) {
//     // Grab the social network and token
//     var network = req.body.network;
//     var socialToken = req.body.socialToken;

//     // Validate the social token with Facebook
//     validateWithProvider(network, socialToken).then(function (profile) {
//         // Return the user data we got from Facebook
//         res.send('Authenticated as: ' + profile.id);
//     }).catch(function (err) {
//         res.send('Failed!' + err.message);
//     });
// });

AuthController.prototype.token = function (request, response, next) {
  // Grab the social network and token
  let network = req.body.network;
  let socialToken = req.body.socialToken;
  let username = request.body.username
  let password = request.body.password

  // if (!username || !password) {
  if (! (username && (password || (network && socialToken)))) {
    let err = new Error('Bad request')
    err.status = 400
    return next(err)
  }

  // Validate the social token
  validateWithProvider(network, socialToken).then(function (profile) {
      // Return the user data we got from Facebook
      res.send('Authenticated as: ' + profile.id);
      
      // this.model.findOne({ where: {username: username} })
      //   .then(function (data) {
      //     if (data) {
      //       if (data.validPassword(password, data.password)) {
      //         let expires = moment().add(1, 'days').valueOf()
      //         let token = jwt.encode({
      //           id: data.id,
      //           username: data.username,
      //           exp: expires,
      //           role: data.role
      //         }, process.env.JWT_TKN_SECRET)
      //         response.json({
      //           token: token
      //         })
      //       } else {
      //         let err = new Error('Unauthorized')
      //         err.status = 401
      //         next(err)
      //       }
      //     } else {
      //       let err = new Error('Login inexistent')
      //       err.status = 404
      //       next(err)
      //     }
      //   })
      //   .catch(next)
  }).catch(function (err) {
      res.send('Failed!' + err.message);
  });

}

AuthController.prototype.middlewareLogging = function (request, response, next) {
  let fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl
  let info = {
    user: request.decoded.username,
    role: request.decoded.role,
    endpoint: fullUrl,
    body: request.body,
    method: request.method,
    ip_origin: request.get('ip_origin') || ''
  }
  models.Log.create(info)
  next()
}

AuthController.prototype.middlewareValidIP = function (request, response, next) {
  let ipOrigin = request.get('ip_origin') || ''
  let role = request.decoded.role
  let query = {
    attributes: ['id', 'authorIP'],
    where: {id: request.params._id}
  }
  return models.Local.find(query)
    .then(function (data) {
      if (ipOrigin === data.authorIP) {
        next()
      } else if (role === 'colaborator' || role === 'admin') {
        next()
      } else {
        let err = new Error('Unauthorized')
        err.status = 401
        next(err)
      }
      return data
    })
    .catch(next)
}

module.exports = function (UserModel) {
  return new AuthController(UserModel)
}
