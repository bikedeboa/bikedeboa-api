let debug = require('debug')('api:ctrlLocal')
let models = require('../models')
let AWS = require('aws-sdk')
let s3 = new AWS.S3()
let sharp = require('sharp')
const env = process.env.NODE_ENV || 'development'
const AWS_PATH_PREFIX = (env === 'development') ? 'https://s3.amazonaws.com/bikedeboa-dev/' : 'https://s3.amazonaws.com/bikedeboa/'
const BUCKET_NAME = (env === 'development') ? 'bikedeboa-dev' : 'bikedeboa';


console.log('AWS_PATH_PREFIX', AWS_PATH_PREFIX);
console.log('BUCKET_NAME', BUCKET_NAME);


// PRIVATE FN //

let handleNotFound = function (data) {
  if (!data) {
    let err = new Error('Not Found')
    err.status = 404
    throw err
  }
  return data
}

var contTagsLocal = function (local) {
  return new Promise(function (resolve, reject) {
    models.sequelize.query('SELECT t.name, COUNT(*) FROM "Tag" t inner join "Review_Tags" rt on T.id = rt.tag_id inner join "Review" r on r.id = rt.review_id inner join "Local" l on r.local_id = l.id WHERE l.id = ' + local.id + ' GROUP BY t.id')
      .then(function (result, metatag) {
        local.dataValues.tags = result[0]
        resolve(local)
      })
  })
}

var saveFullImage = function (params) {
  return new Promise(function (resolve, reject) {
    // params
    let _photo = params.body.photo
    let _id = params.local.id

    // valid photo exists
    if (!_photo) resolve('')

    // get base64 and type image for save
    let type = _photo.split(',')[0] === 'data:image/png;base64' ? '.png' : _photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : ''
    let base64Data = type === '.png' ? _photo.replace(/^data:image\/png;base64,/, '') : _photo.replace(/^data:image\/jpeg;base64,/, '')
    base64Data += base64Data.replace('+', ' ')
    let binaryData = new Buffer(base64Data, 'base64')

    // path image
    let path = 'images/'
    let imageName = path + _id + type

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
    let _photo = params.body.photo
    let _id = params.local.id

    // valid photo exists
    if (!_photo) resolve('') 

    // get base64 and type image for save
    let type = _photo.split(',')[0] === 'data:image/png;base64' ? '.png' : _photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : ''
    let base64Data = type === '.png' ? _photo.replace(/^data:image\/png;base64,/, '') : _photo.replace(/^data:image\/jpeg;base64,/, '')
    base64Data += base64Data.replace('+', ' ')
    let binaryData = new Buffer(base64Data, 'base64')

    // path image
    let path = 'images/thumbs/'
    let imageName = path + _id + type

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
            debug('Error uploading image ', imageName)
            reject(err)
          } else {
            debug('Succesfully uploaded the image', imageName)
            resolve(AWS_PATH_PREFIX + imageName)
          }
        })
      })
  })
}

var deleteImage = function (id) {
  return new Promise(function (resolve, reject) {
    // path image
    let path = 'images/'
    let pathThumb = 'images/thumbs/'

    let imageName = path + id
    let imageNameTumb = pathThumb + id

    // params delete images
    let params = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: [
          {
            Key: imageName + '.jpeg'
          },
          {
            Key: imageName + '.png'
          },
          {
            Key: imageNameTumb + '.jpeg'
          },
          {
            Key: imageNameTumb + '.png'
          }
        ]
      }
    }
    // delete imagens in s3
    s3.deleteObjects(params, function (err, data) {
      if (err) {
        debug(err, err.stack)
        reject(err)
      } else {
        debug(data)
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
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'isCovered', 'text', 'description', 'address', 'photo', 'updatedAt', 'createdAt'].concat([
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

LocalController.prototype.getAllLight = function (request, response, next) {
  var _query = {
    attributes: ['id', 'lat', 'lng', 'isPublic', 'isCovered', 'structureType', 'text', 'photo', 'address'].concat([
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
  var _query = {
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'isCovered', 'text', 'photo', 'description', 'address', 'createdAt'].concat([
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'reviews'
      ],
      [
        models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'average'
      ]
    ]),
    where: {id: request.params._id}
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(contTagsLocal)
    .then(function (local) {
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

  if (_body.structureType) _params.structureType = _body.structureType
  if (_body.isPublic) _params.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0)
  if (_body.isCovered) _params.isCovered = _body.isCovered && (_body.isCovered === 'true' ? 1 : 0)

  var _local = {}

  this.model.create(_params)
    .then(function (local) {
      _local = local
      return {body: _body, local: _local}
    })
    .then(saveThumbImage)
    .then(function (url) {
      return {body: _body, local: _local}
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

LocalController.prototype.update = function (request, response, next) {
  let _id = request.params._id
  let _body = request.body
  let _local = {}

  _local.description = _body.description

  if (_body.lat) _local.lat = _body.lat
  if (_body.lng) _local.lng = _body.lng

  if (_body.structureType) _local.structureType = _body.structureType
  if (_body.isPublic) _local.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0)
  if (_body.isCovered) _local.isCovered = _body.isCovered && (_body.isCovered === 'true' ? 1 : 0)
  if (_body.text) _local.text = _body.text
  if (_body.address) _local.address = _body.address
  if (_body.photoUrl) _local.photo = _body.photoUrl

  let query = {
    where: {id: _id}
  }

  this.model.find(query)
    .then(handleNotFound)
    .then(function (local) {
      return local.update(_local)
    })
    .then(function (local) {
      _local = local
      if (_body.photo) {
        return deleteImage(_id)
      }
      return _local
    })
    .then(function (local) {
      if (_body.photo) {
        return saveThumbImage({body: _body, local: _local})
      }
      return local
    })
    .then(function (local) {
      if (_body.photo) {
        return saveFullImage({body: _body, local: _local})
      }
      return undefined
    })
    .then(function (url) {
      if (url) {
        return _local.update({photo: url})
      }
      return url
    })
    .then(function (resp) {
      if (typeof resp === 'string') {
        _local.photo = resp
      }
      response.json(_local)
    })
    .catch(next)
}

LocalController.prototype.remove = function (request, response, next) {
  let _id = request.params._id
  let _query = {
    where: {id: _id}
  }

  this.model.destroy(_query)
    .then(handleNotFound)
    .then(function (data) {
      return deleteImage(_id)
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
