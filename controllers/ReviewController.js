var debug  = require('debug')('api:ctrlReview'),
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

function ReviewController(ReviewModel) {
    this.model = ReviewModel;
}

ReviewController.prototype.getAll = function(request, response, next) {
    var query = {};

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

ReviewController.prototype.getById = function(request, response, next) {
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

ReviewController.prototype.create = function(request, response, next) {
  	var body = request.body;
    var currentDate = moment().format("YYYY-MM-DD");
    var currentHour = moment().format("YYYY-MM-DD HH:mm:ss");

    var review = {
        description: body.description,
        rating: body.rating,
        hour: currentHour,
        date: currentDate,
        local_id: body.idLocal
    };

    this.model.create(review)
        .then(function(data){
            response.json(data);
        })
    .catch(next);
};

module.exports = function(ReviewModel) {
  	return new ReviewController(ReviewModel);
};