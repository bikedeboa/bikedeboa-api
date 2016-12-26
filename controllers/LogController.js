var debug  = require('debug')('api:ctrlLog'),
    models = require('../models');

function LogController(LogModel) {
    this.model = LogModel;
}

LogController.prototype.getAll = function(request, response, next) {
    var query = {};

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

module.exports = function(LogModel) {
  	return new LogController(LogModel);
};
