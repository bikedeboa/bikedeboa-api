// PRIVATE FN

var handleNotFound = function (data) {
  if (!data) {
    let err = new Error('Not Found')
    err.status = 404
    throw err
  }
  return data
}

// PRIVATE FN

function TagController (TagModel) {
  this.model = TagModel
}

TagController.prototype.getAll = function (request, response, next) {
  let _query = {}

  this.model.findAll(_query)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

TagController.prototype.getById = function (request, response, next) {
  let _query = {
    where: {id: request.params._id}
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

TagController.prototype.create = function (request, response, next) {
  let _body = request.body
  let _tag = {
    name: _body.name
  }

  this.model.create(_tag)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

TagController.prototype.update = function (request, response, next) {
  let _id = request.params._id
  let _body = request.body
  let _tag = {
    name: _body.name
  }
  let _query = {
    where: {id: _id}
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      data.update(_tag)
        .then(function (tag) {
          response.json(tag)
          return tag
        })
        .catch(next)
      return data
    })
    .catch(next)
}

TagController.prototype.remove = function (request, response, next) {
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

module.exports = function (TagModel) {
  return new TagController(TagModel)
}
