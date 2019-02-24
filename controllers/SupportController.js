let debug = require('debug')('api:ctrlSupport');
let models = require('../models');

// PRIVATE FN

let handleNotFound = function (data) {
  if (!data) {
    let err = new Error('Not Found')
    err.status = 404
    throw err
  }
  return data
}

let throwUnauthorizedError = function (next) {
  let err = new Error('Unauthorized')
  err.status = 401
  return next(err)
}

function SupportController (supportModel) {
  this.model = supportModel;
}

SupportController.prototype.remove = function (request, response, next) {
  let _id = request.params._id
  let _query = {
    where: {requestLocal_id: _id, user_id: loggedUser.id}
  }

  // Check if user is logged in and has correct role
  const loggedUser = request.decoded;
  if (!loggedUser || loggedUser.role === 'client') {
    throwUnauthorizedError(next);
  }

  this.model.destroy(_query)
    .then(handleNotFound)
    .then(function (rowDeleted) {
      if (rowDeleted === 1) {
        response.json({
          message: 'Deleted successfully'
        })
      }
    })
    .catch(next)
  
}
SupportController.prototype.removeQuery = function(_query){
  
}

SupportController.prototype.create = function (request, response, next) {
  let _body = request.body;

  const loggedUser = request.decoded;
    if (!loggedUser || loggedUser.role === 'client') {
      throwUnauthorizedError(next);
    }

  let _support = {
    requestLocal_id: _body.requestLocal_id,
    user_id: loggedUser.id
  }

  this.model.create(_support)
    .then(function(support){
      response.json(support)
    })
    .catch(next)
}

module.exports = function (supportModel) {
  return new SupportController(supportModel)
}
