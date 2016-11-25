var debug    = require('debug')('api:ctrlReview'),
    models   = require('../models'),
    moment   = require('moment'),
    bluebird = require('bluebird');;

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
    var query = {
        include: [models.Tag]
    };

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

ReviewController.prototype.getById = function(request, response, next) {
    var query = {
        where: {id : request.params._id},
        include: [models.Tag]
    };

  	this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            response.json(data);
        })
    .catch(next);
};

ReviewController.prototype.remove = function(request, response, next) {
    var _id  = request.params._id;

    var query = {
        where: {id : _id}
    };

    this.model.destroy(query)
        .then(handleNotFound)
        .then(function(rowDeleted){
            if(rowDeleted === 1){
                response.json({
                    message: 'Deleted successfully'
                });
            }
        })
        .catch(next);
};

ReviewController.prototype.create = function(request, response, next) {
  	var body = request.body,
        self = this;
    
    var currentDate = moment().format("YYYY-MM-DD");
    var currentHour = moment().format("YYYY-MM-DD HH:mm:ss");

    var review = {
        description: body.description,
        rating: body.rating,
        hour: currentHour,
        date: currentDate,
        local_id: body.idLocal
    };

    var _tags = body.tags || [];
    var tagsReturn = [];
    
    function promiseTags() { 
        return new Promise(function(resolve, reject) {
            var promises = [];

            _tags.map(function(tag) {
                promises.push(models.Tag.find({where: {id: tag.id}}));
            });

            Promise.all(promises).then(function(tags) {
                resolve(tags);
            });
        });    
    }

    promiseTags()
        .then(function(tagsResponse){
            self.model.create(review)
                .then(function(review){
                    return review.setTags(tagsResponse)
                            .then(function(){
                                response.json(review);
                            });
                })
            .catch(next);
        })
        .catch(next);
};

module.exports = function(ReviewModel) {
  	return new ReviewController(ReviewModel);
};