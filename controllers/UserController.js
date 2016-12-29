var debug  = require('debug')('api:ctrlUser'),
    models = require('../models');

var handleNotFound = function(data) {
    if(!data) {
        var err = new Error('Not Found');
        err.status = 404;
        throw err;
    }
    return data;
};

function UserController(UserModel) {
    this.model = UserModel;
}

UserController.prototype.getAll = function(request, response, next) {
    var query = {
        attributes: {exclude: ['password']}
    };

    this.model.findAll(query)
    .then(function(data) {
        response.json(data);
    })
    .catch(next);
};

UserController.prototype.getById = function(request, response, next) {
    var query = {
        where: {id : request.params._id},
        attributes: {exclude: ['password']}
    };

  	this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            response.json(data);
        })
    .catch(next);
};

UserController.prototype.create = function(request, response, next) {
  	var body = request.body;

    this.model.create({
        fullname: body.fullname,
        username: body.username,
        password: body.password,
        role: body.role
    })
    .then(function(data){
        response.json(data);
    })
    .catch(next);

};

UserController.prototype.update = function(request, response, next) {
    var _id  = request.params._id,
        body = request.body;

    var _user = {};

    if (body.fullname) _user.fullname = body.fullname;
    if (body.username) _user.username = body.username;
    if (body.password) _user.password = body.password;
    if (body.role)     _user.role     = body.role;


  	var query = {
        where: {id : _id}
    };

    this.model.find(query)
        .then(handleNotFound)
        .then(function(data){
            data.update(_user)
                .then(function(user){
                	response.json(user);
                    return user;
                })
                .catch(next);
            return data;
        })
    .catch(next);
};

UserController.prototype.remove = function(request, response, next) {
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

UserController.prototype.removeAll = function(request, response, next) {
    var query = {
      where: {}
    };

    this.model.destroy(query)
        .then(handleNotFound)
        .then(function(data){
          response.json({
              message: 'Deleted successfully'
          });
        })
        .catch(next);
};

module.exports = function(UserModel) {
  	return new UserController(UserModel);
};
