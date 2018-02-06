let moment = require('moment')
let models = require('../models')

function StatsController () {
}

StatsController.prototype.getAll = function (request, response, next) {
  models.Local.count().then(localsCount => {
      models.Review.count().then(reviewsCount => {
        models.Local.sum('views').then(viewsCount => {
            response.json({
              localsCount: localsCount,
              reviewsCount: reviewsCount,
              viewsCount: viewsCount
            })
          })
          .catch(next)
        })
        .catch(next)
    })
    .catch(next)
}

module.exports = function () {
  return new StatsController()
}
