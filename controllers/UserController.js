let models = require('../models')
let ReviewController = require('./ReviewController')(models.User)
let LocalController = require('./LocalController')(models.User)

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
    attributes: {exclude: ['password']},
    // include: [models.Review]
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
    attributes: {exclude: ['password']},
    // include: [models.Review]
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

UserController.prototype.getCurrentUserReviews = function (request, response, next) {
  const currentUser = request.decoded;

  if (currentUser.role === 'client') {
    let err = new Error('No logged user.')
    err.status = 400
    throw err
  }

  let _query = {
    where: {id: currentUser.id},
    attributes: {exclude: ['password']},
    include: [
      {
        model: models.Review,
        include: [models.Tag]
      }
    ]
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}

UserController.prototype.importReviewsToCurrentUser = function (request, response, next) {
  const _body = request.body
  const reviews = _body.reviews;
  if (!reviews) {
    let err = new Error('No reviews found in request body.')
    err.status = 400
    throw err
  }

  // Check if we do have a logged user
  const currentUser = request.decoded;
  if (currentUser.role === 'client') { 
    let err = new Error('No logged user.')
    err.status = 400
    throw err
  }

  // Collect promises for all reviews' updates
  let updatesPromises = [];
  reviews.forEach(r => {
    if (!r.databaseId) {
      let err = new Error('Review without ID')
      err.status = 400
      throw err
    } else {
      updatesPromises.push(
        ReviewController._update.bind(ReviewController)(
          r.databaseId,
          {user_id: currentUser.id}
        ).catch(err => {
          console.log(err);
          let throwErr = new Error(`Error updating review ${r.databaseId}`)
          throwErr.status = 500
          throw throwErr
        })
      );
    }
  });

  // Wait until all updates are done
  Promise.all(updatesPromises).then(() => {
    response.json({
      message: `${reviews.length} reviews imported successfully.`
    });
  }).catch(next)
}

UserController.prototype.importLocalsToCurrentUser = function (request, response, next) {
  const _body = request.body
  const locals = _body.locals;
  if (!locals) {
    let err = new Error('No locals found in request body.')
    err.status = 404
    throw err
  }

  // Check if we do have a logged user
  const currentUser = request.decoded;
  if (currentUser.role === 'client') { 
    let err = new Error('No logged user.')
    err.status = 404
    throw err
  }

  // Collect promises for all locals' updates
  let updatesPromises = [];
  locals.forEach(local => {
    updatesPromises.push(
      LocalController._update.bind(LocalController)(
        local.id,
        {user_id: currentUser.id}
      ).catch(error => {
        let err = new Error('Something went wrong when updating local ' + local.id + error)
        err.status = 404
        throw err
      })
    );
  });

  // Wait until all updates are done
  Promise.all(updatesPromises).then(() => {
    response.json({
      message: `${locals.length} locals imported successfully.`
    });
  }).catch(next)
}

UserController.prototype.getCurrentUserLocals = function (request, response, next) {
  const currentUser = request.decoded;

  if (currentUser.role === 'client') {
    let err = new Error('No logged user.')
    err.status = 404
    throw err
  }

  let _query = {
    where: {id: currentUser.id},
    attributes: {exclude: ['password']},
    include: [models.Local]
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(function (data) {
      response.json(data)
    })
    .catch(next)
}



UserController.prototype.getCurrentUser = function (request, response, next) {
  const currentUser = request.decoded;

  if (currentUser.role === 'client') {
    let err = new Error('No logged user.')
    err.status = 404
    throw err
  }

  let _query = {
    where: {id: currentUser.id},
    attributes: {exclude: ['password']},
    include: [models.Local, models.Review],
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

  if (_body.facebook_id) _user.facebook_id = _body.facebook_id
  if (_body.google_id) _user.google_id = _body.google_id
  if (_body.email) _user.email = _body.email

  this.model.findOrCreate({
    where: {
      $or: {
        facebook_id: _user.facebook_id ? _user.facebook_id : 0,
        google_id: _user.google_id ? _user.google_id : 0
      }
    },
    defaults: _user
  })
  .spread(data => {
    response.json(data)
  })
  .fail(next)

  // this.model.create(_user)
  //   .then(function (data) {
  //     response.json(data)
  //   })
  //   .catch(next)
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
  if (_body.facebook_id) _user.facebook_id = _body.facebook_id
  if (_body.google_id) _user.google_id = _body.google_id
  if (_body.email) _user.email = _body.email

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
