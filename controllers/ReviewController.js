let models = require('../models')
let moment = require('moment')

// PRIVATE FN

let handleNotFound = function (data) {
  if (!data) {
    let err = new Error('Not Found')
    err.status = 404
    throw err
  }
  return data
}

var promiseTags = function (tags) {
  return new Promise(function (resolve, reject) {
    var _promises = []

    tags.map(function (tag) {
      _promises.push(models.Tag.find({where: {id: tag.id}}))
    })

    Promise.all(_promises).then(function (tags) {
      resolve(tags)
    })
  })
}

// PRIVATE FN

function ReviewController (ReviewModel) {
  this.model = ReviewModel
}

ReviewController.prototype.getAll = function (request, response, next) {
  let _query = {
    include: [models.Tag]
  }

  this.model.findAll(_query)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

ReviewController.prototype.getById = function (request, response, next) {
  var _query = {
    where: {id: request.params._id},
    include: [models.Tag]
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

ReviewController.prototype.remove = function (request, response, next) {
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

ReviewController.prototype.create = function (request, response, next) {
  let _body = request.body
  let _self = this
  let _currentDate = moment().format('YYYY-MM-DD')
  let _currentHour = moment().format('YYYY-MM-DD HH:mm:ss')
  let _review = {
    description: _body.description,
    rating: _body.rating,
    hour: _currentHour,
    date: _currentDate,
    local_id: _body.idLocal
  }
  let _tags = _body.tags || []

  promiseTags(_tags)
    .then(function (tagsResponse) {
      _self.model.create(_review)
        .then(function (review) {
          return review.setTags(tagsResponse)
          .then(function () {
            response.json(review)
          })
        })
        .catch(next)
    })
    .catch(next)
}

module.exports = function (ReviewModel) {
  return new ReviewController(ReviewModel)
}
