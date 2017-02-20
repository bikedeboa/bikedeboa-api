var debug           = require('debug')('api:ctrlLocal'),
    models          = require('../models'),
    AWS             = require('aws-sdk'),
    uuid            = require('node-uuid'),
    s3              = new AWS.S3(),
    sharp           = require('sharp'),
    AWS_PATH_PREFIX = 'https://s3.amazonaws.com/bikedeboa/';

// PRIVATE FN //

var handleNotFound = function(data) {
  if(!data) {
    var err = new Error('Not Found');
    err.status = 404;
    throw err;
  }
  return data;
};

var contTagsLocal = function(local) {
  return new Promise(function(resolve, reject) {
    models.sequelize.query('SELECT t.name, COUNT(*) FROM "Tag" t inner join "Review_Tags" rt on T.id = rt.tag_id inner join "Review" r on r.id = rt.review_id inner join "Local" l on r.local_id = l.id WHERE l.id = '+local.id+' GROUP BY t.id')
      .then(function(result, metatag) {
        local.dataValues.tags = result[0];
        resolve(local);
      });
  });
}

var saveFullImage = function(params) {
  return new Promise(function(resolve, reject) {
    // params
    var photo = params.body.photo;
    var id    = params.local.id;

    // valid photo exists
    if (!photo) resolve('');

    // get base64 and type image for save
    var type = photo.split(',')[0] === 'data:image/png;base64' ? '.png' : photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : '',
    base64Data  = type === '.png' ? photo.replace(/^data:image\/png;base64,/, "") : photo.replace(/^data:image\/jpeg;base64,/, "");
    base64Data += base64Data.replace('+', ' ');
    binaryData  = new Buffer(base64Data, 'base64');

    // path image
    var path = "images/";
    var imageName = path + id + type;

    // type invalid return
    if (!type) {
        reject(photo);
    }

    // Send image blob to Amazon S3
    s3.putObject(
      {
        Key: imageName,
        Body: binaryData,
        Bucket: 'bikedeboa',
        ACL: 'public-read'
      }, function(err, data){
        if (err) {
          debug('Error uploading image ', imageName);
          reject(err);
        } else {
          debug('Succesfully uploaded the image', imageName);
          resolve(AWS_PATH_PREFIX + imageName);
        }
      });
  });
}

var saveThumbImage = function(params) {
  return new Promise(function(resolve, reject) {
    // params
    var photo = params.body.photo;
    var id    = params.local.id;

    // valid photo exists
    if (!photo) resolve('');

    // get base64 and type image for save
    var type = photo.split(',')[0] === 'data:image/png;base64' ? '.png' : photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : '',
    base64Data  = type === '.png' ? photo.replace(/^data:image\/png;base64,/, "") : photo.replace(/^data:image\/jpeg;base64,/, "");
    base64Data += base64Data.replace('+', ' ');
    binaryData  = new Buffer(base64Data, 'base64');

    // path image
    var path = "images/thumbs/";
    var imageName = path + id + type;

    // type invalid return
    if (!type) {
      reject(photo);
    }

    sharp(binaryData)
      .resize(100, 100)
      .max()
      .on('error', function(err) {
        reject(err);
      })
      .toBuffer()
      .then(function (data) {
        // Send image blob to Amazon S3
        s3.putObject(
          {
            Key: imageName,
            Body: data,
            Bucket: 'bikedeboa',
            ACL: 'public-read'
          }, function(err, data){
            if (err) {
              debug('Error uploading image ', imageName);
              reject(err);
            } else {
              debug('Succesfully uploaded the image', imageName);
              resolve(AWS_PATH_PREFIX + imageName);
            }
          });
      });
  });
}

var deleteImage = function(id) {
  return new Promise(function(resolve, reject) {
    // path image
    var path = "images/";
    var pathThumb = "images/thumbs/";

    var imageName = path + id;
    var imageNameTumb = pathThumb + id;

    // params delete images
    var params = {
      Bucket: 'bikedeboa',
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
    };
    // delete imagens in s3
    s3.deleteObjects(params, function(err, data) {
      if (err){
        debug(err, err.stack);
        reject(err);
      } else {
        debug(data);
        resolve(data);
      }
    });
  });
}

// PRIVATE FN //

function LocalController(LocalModel) {
  this.model = LocalModel;
}

LocalController.prototype.getAll = function(request, response, next) {
  var _query = {
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'text', 'description', 'address', 'photo', 'updatedAt', 'createdAt'].concat([
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'reviews'
      ],
      [
        models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'average'
      ],
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Checkin" WHERE "Checkin"."local_id" = "Local"."id")'),
        'checkins'
      ]
    ])
  };

  this.model.findAll(_query)
    .then(function(locals) {
      response.json(locals);
    })
  .catch(next);
};

LocalController.prototype.getAllLight = function(request, response, next) {
  var _query = {
    attributes: ['id', 'lat', 'lng'].concat([
      [
        models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'average'
      ]
    ])
  };

  this.model.findAll(_query)
    .then(function(locals) {
      response.json(locals);
    })
  .catch(next);
};

LocalController.prototype.getById = function(request, response, next) {
  var _query = {
    attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'text', 'photo', 'description', 'address', 'createdAt'].concat([
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
        'reviews'
      ],
      [
        models.sequelize.literal('(SELECT COUNT(*) FROM "Checkin" WHERE "Checkin"."local_id" = "Local"."id")'),
        'checkins'
      ]
    ]),
    where: {id : request.params._id}
  };

	this.model.find(_query)
    .then(handleNotFound)
    .then(contTagsLocal)
    .then(function(local){
      response.json(local);
    })
  .catch(next);
};

LocalController.prototype.create = function(request, response, next) {
	var _body = request.body;
  var _params = {
    lat: _body.lat,
    lng: _body.lng,
    structureType: _body.structureType,
    isPublic: _body.isPublic && (_body.isPublic === 'true' ? 1 : 0),
    text: _body.text,
    photo: '',
    description: _body.description,
    address: _body.address,
    authorIP: _body.authorIP
  };
  var _local = {};

  this.model.create(_params)
    .then(function(local) {
      _local = local;
      return {body: _body, local: _local};
    })
    .then(saveThumbImage)
    .then(function(url) {
      return {body: _body, local: _local};
    })
    .then(saveFullImage)
    .then(function(url) {
      return {photo: url};
    })
    .then(function(url) {
      return _local.update(url);
    })
    .then(function(local){
      _local.photo = local.photo;
      response.json(_local);
    })
  .catch(next);
};

LocalController.prototype.update = function(request, response, next) {
  var _id    = request.params._id,
      _body  = request.body,
      _local = {};

  if (_body.lat) _local.lat = _body.lat;
  if (_body.lng) _local.lng = _body.lng;
  if (_body.description) _local.description = _body.description;

  if (_body.structureType) _local.structureType = _body.structureType;
  if (_body.isPublic) _local.isPublic = _body.isPublic && (_body.isPublic === 'true' ? 1 : 0);
  if (_body.text) _local.text = _body.text;
  if (_body.address) _local.address = _body.address;
  if (_body.photoUrl) _local.photo = _body.photoUrl;

	var query = {
    where: {id : _id}
  };

  this.model.find(query)
    .then(handleNotFound)
    .then(function(local) {
      return local.update(_local);
    })
    .then(function(local) {
      _local = local;
      if(_body.photo) {
        return deleteImage(_id);
      }
      return _local;
    })
    .then(function(local) {
      if(_body.photo) {
        return saveThumbImage({body: _body, local: _local});
      }
      return local;
    })
    .then(function(local) {
      if(_body.photo) {
        return saveFullImage({body: _body, local: _local});
      }
      return undefined;
    })
    .then(function(url) {
      if (url) {
        return _local.update({photo: url});
      }
      return url;
    })
    .then(function(resp) {
      if (typeof resp === 'string') {
        _local.photo = resp;
      }
      response.json(_local);
    })
  .catch(next);
};

LocalController.prototype.remove = function(request, response, next) {
  var _id  = request.params._id;
  var _query = {
    where: {id : _id}
  };

  this.model.destroy(_query)
    .then(handleNotFound)
    .then(function(data) {
      return deleteImage(_id);
    })
    .then(function(data) {
      response.json({
        message: 'Deleted successfully'
      });
    })
  .catch(next);
};

module.exports = function(LocalModel) {
  return new LocalController(LocalModel);
};
