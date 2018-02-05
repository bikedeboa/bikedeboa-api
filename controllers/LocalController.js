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
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'isCovered', 'text', 'description', 'address', 'photo', 'updatedAt', 'createdAt', 'views', 'city', 'state', 'country'].concat([
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

  var _query = {
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'isCovered', 'text', 'photo', 'description', 'address', 'createdAt', 'views', 'city', 'state', 'country'].concat([
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
    }],
  }

  this.model.find(_query)
    .then(handleNotFound)
    .then(contTagsLocal)
    .then(function (local) {
      self._update(request.params._id, {views: local.dataValues.views+1})
      
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
  let timestamp = new Date().getTime()

  // Save author user if there's one authenticated
  const loggedUser = request.decoded;
  if (loggedUser) {
    // The 'client' role is a user that is authenticated but not logged in
    if (loggedUser.role !== 'client') {
      _params.user_id = loggedUser.id;
    }
  }
  
  if (_body.structureType) _params.structureType = _body.structureType
  if (_body.isPublic) _params.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0)
  if (_body.isCovered) _params.isCovered = _body.isCovered && (_body.isCovered === 'true' ? 1 : 0)

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

LocalController.prototype._update = function (id, data, photo, silentOption) {
  let query = {
    where: {id: id}
  }
  let timestamp = new Date().getTime()

  return new Promise(function (resolve, reject) {
    models.Local.find(query)
      .then(handleNotFound)
      .then(function (local) {
        return local.update(data, { silent: silentOption })
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

  _local.description = _body.description

  if (_body.lat) _local.lat = _body.lat
  if (_body.lng) _local.lng = _body.lng

  if (_body.structureType) _local.structureType = _body.structureType
  if (_body.isPublic) _local.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0)
  if (_body.isCovered) _local.isCovered = _body.isCovered && (_body.isCovered === 'true' ? 1 : 0)
  if (_body.text) _local.text = _body.text
  if (_body.address) _local.address = _body.address
  if (_body.city) _local.city = _body.city
  if (_body.state) _local.state = _body.state
  if (_body.country) _local.country = _body.country
  if (_body.photoUrl) _local.photo = _body.photoUrl 
  if (_body.user_id) _local.user_id = _body.user_id
  if (_body.views) _local.views = _body.views

  // ISSUE #8
  // Caso exista somente as duas keys de description e views no objeto _local para atualizar,
  // podendo ser somente o contador, então não atualiza o campo updatedAt
  const arrayCompare = ['description', 'views']
  const arrayExistingKeys = Object.keys(_local).map((key) => key)
  const silentOption = arrayCompare.toString() === arrayExistingKeys.toString()

  this._update(_id, _local, _body.photo, silentOption) 
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
  let localForRemove;

  this.model.findOne(_query)
    .then(handleNotFound)
    .then(function (data) {
      localForRemove = data;
      let splitUrl = data.photo ? data.photo.split('/') : ''
      let imageName = typeof splitUrl !== 'string' ? splitUrl[splitUrl.length - 1] : ''
      return deleteImage(imageName)
    })
    .then(function(data) {
      return localForRemove.destroy()
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
