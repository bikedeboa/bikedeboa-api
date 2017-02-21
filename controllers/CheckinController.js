let moment = require('moment')

// PRIVATE FN

let handleNotFound = function (data) {
  if (!data) {
    let err = new Error('Not Found')
    err.status = 404
    throw err
  }
  return data
}

// PRIVATE FN

function CheckinController (CheckinModel) {
  this.model = CheckinModel
}

CheckinController.prototype.getAll = function (request, response, next) {
  var _query = {}

  this.model.findAll(_query)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

CheckinController.prototype.getById = function (request, response, next) {
  var _query = {
    where: {id: request.params._id}
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

CheckinController.prototype.create = function (request, response, next) {
  let _body = request.body
  let _currentDate = moment().format('YYYY-MM-DD')
  let _currentHour = moment().format('YYYY-MM-DD HH:mm:ss')
  let _checkIn = {
    local_id: _body.idLocal,
    date: _currentDate,
    hour: _currentHour
  }

  this.model.create(_checkIn)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

module.exports = function (CheckinModel) {
  return new CheckinController(CheckinModel)
}
