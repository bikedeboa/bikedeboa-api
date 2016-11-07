var debug  = require('debug')('api:ctrlCheckin'),
    models = require('../models'),
    moment = require('moment');

var handleNotFound = function(data) {
    if(!data) {
        var err = new Error('Not Found');
        err.status = 404;
        throw err;
    }
    return data;
};

function CheckinController(CheckinModel) {
    this.model = CheckinModel;
}

CheckinController.prototype.getAll = function(request, response, next) {
    var query = {};

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

CheckinController.prototype.getById = function(request, response, next) {
    var query = {
        where: {id : request.params._id}
    };

  	this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            response.json(data);
        })
    .catch(next);
};

CheckinController.prototype.create = function(request, response, next) {
  	var body = request.body;
    var currentDate = moment().format("YYYY-MM-DD");
    var currentHour = moment().format("YYYY-MM-DD HH:mm:ss");
    
    var checkIn = {
        local_id: body.idLocal,
        date: currentDate,
        hour: currentHour
    };

    this.model.create(checkIn)
        .then(function(data){
            response.json(data);
        })
    .catch(next);

};

module.exports = function(CheckinModel) {
  	return new CheckinController(CheckinModel);
};