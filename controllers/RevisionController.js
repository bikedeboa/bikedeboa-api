var debug  = require('debug')('api:ctrlRevision'),
    models = require('../models');

var handleNotFound = function(data) {
    if(!data) {
        var err = new Error('Not Found');
        err.status = 404;
        throw err;
    }
    return data;
};

function RevisionController(RevisionModel) {
    this.model = RevisionModel;
}

RevisionController.prototype.getAll = function(request, response, next) {
    var query = {
      include: [models.Local]
    };

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

RevisionController.prototype.getById = function(request, response, next) {
    var query = {
        where: {id : request.params._id},
        include: [models.Local]
    };

  	this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            response.json(data);
        })
    .catch(next);
};

RevisionController.prototype.create = function(request, response, next) {
  	var body = request.body;

    this.model.create({
        local_id: body.local_id,
        comments: body.comments
    })
    .then(function(data){
        response.json(data);
    })
    .catch(next);

};

RevisionController.prototype.update = function(request, response, next) {
    var _id  = request.params._id,
        body = request.body;

    var _revision = {
      comments: body.comments
    };

  	var query = {
        where: {id : _id}
    };

    this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            data.update(_revision)
                .then(function(tag){
                	response.json(tag);
                    return tag;
                })
                .catch(next);
            return data;
        })
    .catch(next);
};

RevisionController.prototype.remove = function(request, response, next) {
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

module.exports = function(RevisionModel) {
  	return new RevisionController(RevisionModel);
};
