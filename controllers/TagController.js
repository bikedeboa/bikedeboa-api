var debug  = require('debug')('api:ctrlTag'),
    models = require('../models');

var handleNotFound = function(data) {
    if(!data) {
        var err = new Error('Not Found');
        err.status = 404;
        throw err;
    }
    return data;
};

function TagController(TagModel) {
    this.model = TagModel;
}

TagController.prototype.getAll = function(request, response, next) {
    var query = {};

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

TagController.prototype.getById = function(request, response, next) {
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

TagController.prototype.create = function(request, response, next) {
  	var body = request.body;

    this.model.create({
        name: body.name
    })
    .then(function(data){
        response.json(data);
    })
    .catch(next);

};

TagController.prototype.update = function(request, response, next) {
    var _id  = request.params._id,
        body = request.body;

    var _tag = {
        name: body.name
    };

  	var query = {
        where: {id : _id}
    };

    this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            data.update(_tag)
                .then(function(tag){
                	response.json(tag);
                    return tag;
                })
                .catch(next);
            return data;
        })
    .catch(next);
};

TagController.prototype.remove = function(request, response, next) {
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

module.exports = function(TagModel) {
  	return new TagController(TagModel);
};