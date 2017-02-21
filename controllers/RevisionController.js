let models = require('../models')

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

function RevisionController (RevisionModel) {
  this.model = RevisionModel
}

RevisionController.prototype.getAll = function (request, response, next) {
  let _query = {
    include: [models.Local]
  }

  this.model.findAll(_query)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

RevisionController.prototype.getById = function (request, response, next) {
  let _query = {
    where: {id: request.params._id},
    include: [models.Local]
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

RevisionController.prototype.create = function (request, response, next) {
  let _body = request.body
  let _revision = {
    local_id: _body.local_id,
    comments: _body.comments
  }

  this.model.create(_revision)
  .then(function (data) {
    response.json(data)
  })
  .catch(next)
}

RevisionController.prototype.update = function (request, response, next) {
  let _id = request.params._id
  let _body = request.body
  let _revision = {
    comments: _body.comments
  }
  let _query = {
    where: {id: _id}
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      data.update(_revision)
        .then(function (tag) {
          response.json(tag)
          return tag
        })
        .catch(next)
      return data
    })
    .catch(next)
}

RevisionController.prototype.remove = function (request, response, next) {
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

module.exports = function (RevisionModel) {
  return new RevisionController(RevisionModel)
}
