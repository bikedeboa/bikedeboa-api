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

function UserController (UserModel) {
  this.model = UserModel
}

UserController.prototype.getAll = function (request, response, next) {
  let _query = {
    attributes: {exclude: ['password']}
  }

  this.model.findAll(_query)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

UserController.prototype.getById = function (request, response, next) {
  let _query = {
    where: {id: request.params._id},
    attributes: {exclude: ['password']}
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

UserController.prototype.create = function (request, response, next) {
  let _body = request.body
  let _user = {
    fullname: _body.fullname,
    username: _body.username,
    password: _body.password,
    role: _body.role
  }

  this.model.create(_user)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

UserController.prototype.update = function (request, response, next) {
  let _id = request.params._id
  let _body = request.body
  let _user = {}
  let _query = {
    where: {id: _id}
  }

  if (_body.fullname) _user.fullname = _body.fullname
  if (_body.username) _user.username = _body.username
  if (_body.password) _user.password = _body.password
  if (_body.role) _user.role = _body.role

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      data.update(_user)
        .then(function (user) {
          response.json(user)
          return user
        })
        .catch(next)
      return data
    })
    .catch(next)
}

UserController.prototype.remove = function (request, response, next) {
  let _id = request.params._id
  let _query = {
    where: {id: _id}
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

UserController.prototype.removeAll = function (request, response, next) {
  let _query = {
    where: {}
  }

  this.model.destroy(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json({
        message: 'Deleted successfully'
      })
    })
    .catch(next)
}

module.exports = function (UserModel) {
  return new UserController(UserModel)
}
