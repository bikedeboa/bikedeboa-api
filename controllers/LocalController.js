let debug = require('debug')('api:ctrlLocal')
let models = require('../models')
let AWS = require('aws-sdk')
//let sharp = require('sharp')
const env = process.env.NODE_ENV || 'development'
//const AWS_PATH_PREFIX = (env === 'development') ? 'https://s3.amazonaws.com/bikedeboa-dev/' : 'https://s3.amazonaws.com/bikedeboa/'
//const BUCKET_NAME = (env === 'development') ? 'bikedeboa-dev' : 'bikedeboa';

const AWS_PATH_PREFIX = process.env.AWS_PATH_PREFIX || 'https://s3.amazonaws.com/bikedeboa-dev/';
const BUCKET_NAME = process.env.BUCKET_NAME || 'bikedeboa';

console.log('AWS_PATH_PREFIX', AWS_PATH_PREFIX);
console.log('BUCKET_NAME', BUCKET_NAME);

let s3 = new AWS.S3()

// PRIVATE FN //

let handleNotFound = function (data) {
  if (!data) {
    let err = new Error('Not Found')
    err.status = 404
    throw err
  }
  return data
}

let contTagsLocal = function (local) {
  return new Promise(function (resolve, reject) {
    models.sequelize.query('SELECT t.name, COUNT(*) FROM "Tag" t inner join "Review_Tags" rt on T.id = rt.tag_id inner join "Review" r on r.id = rt.review_id inner join "Local" l on r.local_id = l.id WHERE l.id = ' + local.id + ' GROUP BY t.id')
      .then(function (result, metatag) {
        local.dataValues.tags = result[0]
        resolve(local)
      })
  })
}

let throwUnauthorizedError = function (next) {
  let err = new Error('Unauthorized')
  err.status = 401
  return next(err)
}

var saveFullImage = function (params) {
  return new Promise(function (resolve, reject) {
    // params
    let _photo = params.photo
    let _id = params.id

    // valid photo exists
    if (!_photo) resolve('')

    // get base64 and type image for save
    let type = _photo.split(',')[0] === 'data:image/png;base64' ? '.png' : _photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : ''
    let base64Data = type === '.png' ? _photo.replace(/^data:image\/png;base64,/, '') : _photo.replace(/^data:image\/jpeg;base64,/, '')
    base64Data += base64Data.replace('+', ' ')
    let binaryData = new Buffer(base64Data, 'base64')

    // path image
    let path = 'images/'
    let imageName = path + _id + '-' + params.timestamp + type

    // type invalid return
    if (!type) {
      reject(_photo)
    }

    // Send image blob to Amazon S3
    s3.putObject(
      {
        Key: imageName,
        Body: binaryData,
        Bucket: BUCKET_NAME,
        ACL: 'public-read'
      }, function (err, data) {
      if (err) {
        debug('Error uploading image ', imageName)
        reject(err)
      } else {
        debug('Succesfully uploaded the image', imageName)
        resolve(AWS_PATH_PREFIX + imageName)
      }
    })
  })
}

var saveThumbImage = function (params) {
  return new Promise(function (resolve, reject) {
    // params

    return false;
    let _photo = params.photo
    let _id = params.id

    // valid photo exists
    if (!_photo) resolve('') 

    // get base64 and type image for save
    let type = _photo.split(',')[0] === 'data:image/png;base64' ? '.png' : _photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : ''
    let base64Data = type === '.png' ? _photo.replace(/^data:image\/png;base64,/, '') : _photo.replace(/^data:image\/jpeg;base64,/, '')
    base64Data += base64Data.replace('+', ' ')
    let binaryData = new Buffer(base64Data, 'base64')

    // path image
    let path = 'images/thumbs/'
    let imageName = path + _id + '-' + params.timestamp + type

    // type invalid return
    if (!type) {
      reject(_photo)
    }

  

    sharp(binaryData)
      .resize(100, 100)
      .max()
      .on('error', function (err) {
        reject(err)
      })
      .toBuffer()
      .then(function (data) {
        // Send image blob to Amazon S3
        s3.putObject(
          {
            Key: imageName,
            Body: data,
            Bucket: BUCKET_NAME,
            ACL: 'public-read'
          }, function (err, data) {
            if (err) {
              reject(err)
              console.log("Erro ao salvar imagem no S3", err)
            } else {
              console.log("Imagem salva com sucesso", imageName)
              resolve(AWS_PATH_PREFIX + imageName)
            }
          })
      })
  })
}

var deleteImage = function (name) {
  return new Promise(function (resolve, reject) {
    // valid photo 
    if (!name || name === '') resolve('')

    // path image
    let path = 'images/'
    let pathThumb = 'images/thumbs/'

    let imageName = path + name
    let imageNameTumb = pathThumb + name

    // params delete images
    let params = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: [
          {
            Key: imageName
          },
          {
            Key: imageNameTumb
          }
        ]
      }
    }
    // delete imagens in s3
    s3.deleteObjects(params, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// PRIVATE FN //

function LocalController (LocalModel) {
  this.model = LocalModel
}

LocalController.prototype.getAll = function (request, response, next) {
  var _query = {
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'isCovered', 'text', 'description', 'address', 'photo', 'updatedAt', 'createdAt', 'views', 'city', 'state', 'country', 'isPaid', 'slots'].concat([
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'reviews'
      ],
      [
        models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'average'
      ]
    ]),
    include: [{
      model: models.User,
      attributes: ['fullname']  
    }, {
      model: models.Review,
      include: [models.Tag]
    }, { 
      model: models.DataSource
    }] 
  }

  this.model.findAll(_query)
    .then(function (locals) {
      response.json(locals)
    })
    .catch(next)
}

LocalController.prototype.getAllLight = function (request, response, next) {
  var _query = {
    attributes: ['id', 'lat', 'lng', 'isPublic', 'isCovered', 'structureType', 'text', 'photo', 'address', 'city', 'state', 'country'].concat([
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'reviews' 
      ],
      [
        models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'average'
      ]
    ])
  }

  this.model.findAll(_query)
    .then(function (locals) {
      response.json(locals)
    })
    .catch(next)
}

LocalController.prototype.getById = function (request, response, next) {
  var self = this;

  // @todo refactoring...
  // https://github.com/sequelize/sequelize/issues/222
  // var _query = {
  // attributes:
  // 'Local.*',// 'Review.*'
  // // [models.sequelize.fn('COUNT', '*'), 'reviews'],
  // // [models.sequelize.fn('AVERAGE', 'rating'), 'average']
  // [
  //   models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
  //   'reviews'
  // ],
  // [
  //   models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
  //   'average'
  // ]
   
  var _query = {
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'isCovered', 'text', 'photo', 'description', 'address', 'createdAt', 'views', 'city', 'state', 'country', 'isPaid', 'slots'].concat([
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'reviews'
      ],
      [
        models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'average'
      ]
    ]),
    where: {id: request.params._id},
    include: [{
      model: models.User,
      attributes: ['fullname'] 
    }, {
      model: models.DataSource
    }],
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(contTagsLocal)
    .then(function (local) {
      self._update(request.params._id, {views: local.dataValues.views+1})
      
      const loggedUser = request.decoded;
      local.dataValues.wasCreatedByLoggedUser = !!(loggedUser && (local.user_id === loggedUser.id));
      local.dataValues.canLoggedUserDelete = !!(local.dataValues.wasCreatedByLoggedUser);

      response.json(local)
    })
    .catch(next)
}

LocalController.prototype.create = function (request, response, next) {
  var _body = request.body
  var _params = {
    lat: _body.lat,
    lng: _body.lng,
    text: _body.text,
    photo: '',
    description: _body.description,
    address: _body.address,
    authorIP: _body.authorIP 
  }
  var isAnonymous = _body.isAnonymous;
  let timestamp = new Date().getTime()

  // Save author user if there's one authenticated
  // Obs: the 'client' role is the a regular, authenticated web client, but not a logged in user
  const loggedUser = request.decoded;
  if (loggedUser && loggedUser.role !== 'client') {
    if (!isAnonymous) {
      _params.user_id = loggedUser.id; 
    }
  } else {
    throwUnauthorizedError(next);
  }
  
  if (_body.structureType) _params.structureType = _body.structureType
  if (_body.isPublic) _params.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0)
  if (_body.isCovered) _params.isCovered = _body.isCovered && (_body.isCovered === 'true' ? 1 : 0)
  if (_body.city) _params.city = _body.city
  if (_body.state) _params.state = _body.state
  if (_body.country) _params.country = _body.country
  if (_body.slots) _params.slots = _body.slots
  if (_body.isPaid) _params.isPaid = _body.isPaid
  if (_body.datasource_id) _params.datasource_id = _body.datasource_id
 
  var _local = {}

  this.model.create(_params)
    .then(function (local) {
      _local = local
      return {photo: _body.photo, id: _local.id, timestamp: timestamp}
    })
    .then(saveThumbImage)
    .then(function (url) {
      return {photo: _body.photo, id: _local.id, timestamp: timestamp}
    })
    .then(saveFullImage)
    .then(function (url) {
      return {photo: url}
    })
    .then(function (url) {
      return _local.update(url)
    })
    .then(function (local) {
      _local.photo = local.photo
      response.json(_local)
    })
    .catch(next)
}

LocalController.prototype._update = function (id, data, photo, silentEdit = false) {
  let query = {
    where: {id: id}
  }
  let timestamp = new Date().getTime()

  // If we're just updating the views count we don't touch the updatedAt field
  if (Object.keys(data).length === 1 && data.views) {
    silentEdit = true; 
  }

  return new Promise(function (resolve, reject) {
    models.Local.find(query)
      .then(handleNotFound)
      .then(function (local) {
        return local.update(data, { silent: silentEdit })
      })
      .then(function (local) {
        data = local
        if (photo) {
          return deleteImage(local.photo)
        } else {
          return data
        }
      })
      .then(function (local) {
        if (photo) {
          return saveThumbImage({photo: photo, id: id, timestamp: timestamp})
        } else {
          return local
        }
      })
      .then(function (local) {
        if (photo) {
          return saveFullImage({photo: photo, id: id, timestamp: timestamp})
        } else {
          return undefined
        }
      })
      .then(function (url) {
        if (url) {
          return data.update({photo: url})
        } else {
          return url
        }
      })
      .then(function (resp) { 
        if (typeof resp === 'string') {
          data.photo = resp
        } else {
          return data
        }
      })
      .then(resolve)
      .catch( err => reject(err) ) 
  });
}

LocalController.prototype.update = function (request, response, next) {
  const _id = request.params._id
  const _body = request.body
  let _local = {}

  // Check if user is logged in and has correct role
  const loggedUser = request.decoded;
  if (!loggedUser || loggedUser.role === 'client') {
    throwUnauthorizedError(next);
  } 

  _local.description = _body.description

  let silentEdit = false;
  if (_body.silentEdit && loggedUser.role === 'admin') {
    silentEdit = true;
  }

  if (_body.lat) _local.lat = _body.lat
  if (_body.lng) _local.lng = _body.lng

  if (_body.structureType) _local.structureType = _body.structureType
  if (_body.isPublic) _local.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0)
  if (_body.isCovered) _local.isCovered = _body.isCovered && (_body.isCovered === 'true' ? 1 : 0)
  if (_body.text) _local.text = _body.text
  if (_body.address) _local.address = _body.address
  if (_body.photoUrl) _local.photo = _body.photoUrl 
  if (_body.views) _local.views = _body.views
  if (_body.city) _local.city = _body.city
  if (_body.state) _local.state = _body.state
  if (_body.country) _local.country = _body.country 
  if (_body.slots) _local.slots = _body.slots
  if (_body.isPaid) _local.isPaid = _body.isPaid
  if (_body.datasource_id) _local.datasource_id = _body.datasource_id

  this._update(_id, _local, _body.photo, silentEdit) 
    .then( local => {
      response.json(local)
      return local
    })
    .catch(next)
}

LocalController.prototype.remove = function (request, response, next) {
  let _id = request.params._id
  let _query = {
    where: {id: _id}
  }
  let placeToDelete;

  // Check if user is logged in and has correct role
  const loggedUser = request.decoded;
  if (!loggedUser || loggedUser.role === 'client') {
    throwUnauthorizedError(next);
  }

  this.model.findOne(_query)
    .then(handleNotFound)
    .then(function (data) {
      placeToDelete = data;

      // If it's a normal user, check if he's the place creator
      if (loggedUser.role === 'user') {
        if (placeToDelete.user_id !== loggedUser.id) {
          throwUnauthorizedError(next);
        }
      }

      let splitUrl = data.photo ? data.photo.split('/') : ''
      let imageName = typeof splitUrl !== 'string' ? splitUrl[splitUrl.length - 1] : ''
      return deleteImage(imageName)
    })
    .then(function(data) {
      return placeToDelete.destroy()
    })
    .then(function (data) {
      response.json({
        message: 'Deleted successfully'
      })
    })
  .catch(next)
}

module.exports = function (LocalModel) {
  return new LocalController(LocalModel)
}
