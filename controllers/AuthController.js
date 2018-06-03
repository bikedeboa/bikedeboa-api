const jwt = require('jwt-simple')
const moment = require('moment')
const models = require('../models')
const request = require('request')

const UserController = require('../controllers/UserController')(models.User)


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

AuthController.prototype._validateWithProvider = function (network, socialToken) {
  var providers = {
      facebook: {
          url: 'https://graph.facebook.com/me'
      },
      google: {
          url: 'https://www.googleapis.com/oauth2/v3/tokeninfo'
      }
  }
    
  return new Promise(function (resolve, reject) {
    request({
        url: providers[network].url,
        qs: {access_token: socialToken}
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body))
        } else {
          reject(err)
        }
      }
    )
  })
}

AuthController.prototype._generateJWT = function (foundUser, response, isNewUser=false) {
  let expires = moment().add(1, 'days').valueOf()
  let token = jwt.encode({
    id: foundUser.id,
    username: foundUser.username || foundUser.name || '',
    role: foundUser.role,
    exp: expires
  }, process.env.JWT_TKN_SECRET)
  
  response.json({
    token: token,
    role: foundUser.role,
    isNewUser: isNewUser
  })
}

// Social auth inspired by https://ole.michelsen.dk/blog/social-signin-spa-jwt-server.html
AuthController.prototype.token = function (request, response, next) {
  const self = this;

  // Grab the social network and token
  let network = request.body.network
  let socialToken = request.body.socialToken
  let username = request.body.username
  let password = request.body.password
  let fullname = request.body.fullname
  let email = request.body.email

  if (! ((username && password) || 
         (network && socialToken))) {
    let err = new Error('Bad request - missing network and/or socialToken.')
    err.status = 400
    return next(err)
  }

  if (network && socialToken) {
    // Login by social network
    // Fist, validate the social token.
    this._validateWithProvider(network, socialToken).then(function (profile) {
        console.log(profile);

        let query;
        switch (network) {
          case 'facebook':
            query = {facebook_id: profile.id}
            break;
          case 'google':
            // https://developers.google.com/identity/sign-in/web/backend-auth 
            profile.id = profile.sub
            query = {google_id: profile.id}
            break;
          default:
            let err = new Error('Bad request')
            err.status = 400
            return next(err)
        }

        // Search in DB for user with that social profile ID
        self.model.findOne({ where: query })
        .then(function (foundUser) {
          if (foundUser) {
            self._generateJWT(foundUser, response)
          } else {
            console.log('------CREATING NEW USER--------');

            // Create new user with the social data
            const newUserData = {
              role: 'user',
              fullname: fullname,
              email: email
            };

            switch (network) {
              case 'facebook':
                newUserData.facebook_id = profile.id;
                break;
              case 'google':
                newUserData.google_id = profile.id;
                break;
            }

            UserController.model.create(newUserData)
              .then(function (newUser) {
                self._generateJWT(newUser, response, true)
              })
              .catch(next)
          }
        })
        .catch(next) 
    }).catch(next)
  } else {
    // Login by username + password
    this.model.findOne({ where: {username: username} })
      .then(function (foundUser) {
        if (foundUser) {
          if (foundUser.validPassword(password, foundUser.password)) {
            self._generateJWT(foundUser, response)
          } else {
            let err = new Error('Unauthorized')
            err.status = 401
            next(err)
          }
        } else {
          let err = new Error('Login inexistent')
          err.status = 404
          next(err)
        }
      })
      .catch(next) 
  }

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

module.exports = function (UserModel) {
  return new AuthController(UserModel)
}
