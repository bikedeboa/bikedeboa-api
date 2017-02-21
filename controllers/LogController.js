function LogController (LogModel) {
  this.model = LogModel
}

LogController.prototype.getAll = function (request, response, next) {
  var _query = {}

  this.model.findAll(_query)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

module.exports = function (LogModel) {
  return new LogController(LogModel)
}
