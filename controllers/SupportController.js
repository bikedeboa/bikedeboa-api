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

function SupportController (SupportModel) {
  this.model = SupportModel;
}


SupportController.prototype.remove = function (request, response, next) {
  let _id = request.params._id
  let _query = {
    where: {id: _id}
  }

  // Check if user is logged in and has correct role
  const loggedUser = request.decoded;
  if (!loggedUser || loggedUser.role === 'client') {
    throwUnauthorizedError(next);
  }

  // If it's a regular user, check if he's the original creator
  if (loggedUser.role === 'user') {
    this.model.findOne({ where: { id: _id } })
      .then(handleNotFound)
      .then(function (review) {
        if (review.user_id !== loggedUser.id) {
          throwUnauthorizedError(next);
        }
      });
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


SupportController.prototype.create = function (request, response, next) {
  let _body = request.body;

  const loggedUser = request.decoded;
    if (!loggedUser || loggedUser.role === 'client') {
      throwUnauthorizedError(next);
    }

  let _support = {
    local_id: _body.request_id,
    user_id: loggedUser.id
  }

  this.model.create(_support)
    .then(function(support){
      response.json(support)
    })
    .catch(next)
}

module.exports = function (SupportModel) {
  return new SupportController(SupportModel)
}
