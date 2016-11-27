var debug   = require('debug')('api:ctrlLocal'),
    models  = require('../models'),
    AWS     = require('aws-sdk'),
    uuid    = require('node-uuid'),
    s3      = new AWS.S3();

var AWS_PATH_PREFIX = 'https://s3.amazonaws.com/bikedeboa/';

var handleNotFound = function(data) {
    if(!data) {
        var err = new Error('Not Found');
        err.status = 404;
        throw err;
    }
    return data;
};

function LocalController(LocalModel) {
    this.model = LocalModel;
}

// ---------------- private functions ---------------- //

function promiseContTags(local) {
    return new Promise(function(resolve, reject) {
        models.sequelize.query('SELECT t.name, COUNT(*) FROM "Tag" t inner join "Review_Tags" rt on T.id = rt.tag_id inner join "Review" r on r.id = rt.review_id inner join "Local" l on r.local_id = l.id WHERE l.id = '+local.id+' GROUP BY t.id')
            .then(function(result, metatag) {
                local.dataValues.tags = result[0];
                resolve(local);
            });
    });
}

function getLocalsAndTags(locals) {
    return new Promise(function(resolve, reject) {
        var promises = [];

        locals.map(function(local){
            promises.push(promiseContTags(local));
        });

        Promise.all(promises).then(function(resp){
            resolve(resp);
        })
    });
}

function getTags(arrTagsId) {
    return new Promise(function(resolve, reject) {
        var promises = [];

        arrTagsId.map(function(tag) {
            promises.push(models.Tag.find({where: {id: tag.id}}));
        });

        Promise.all(promises).then(function(tags) {
            resolve(tags);
        });
    });
}

function saveImage(photo, id) {
    return new Promise(function(resolve, reject) {
        // valid photo exists
        if (!photo) resolve('');

        // get base64 and type image for save
        var type = photo.split(',')[0] === 'data:image/png;base64' ? '.png' : photo.split(',')[0] === 'data:image/jpeg;base64' ? '.jpeg' : '',
        base64Data  =   type === '.png' ? photo.replace(/^data:image\/png;base64,/, "") : photo.replace(/^data:image\/jpeg;base64,/, "");
        base64Data  +=  base64Data.replace('+', ' ');
        // binaryData  =   new Buffer(base64Data, 'base64').toString('binary');
        binaryData  =   new Buffer(base64Data, 'base64');

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

function deleteImage(id) {
    return new Promise(function(resolve, reject) {
        // path image
        var path = "images/";
        var imageName = path + id;
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

// ---------------- private functions ---------------- //

LocalController.prototype.getAll = function(request, response, next) {
    var query = {
        attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'text', 'description', 'address', 'photo'].concat([
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

    this.model.findAll(query)
        .then(function(locals) {
            response.json(locals);
        })
        .catch(next);
};

LocalController.prototype.getAllLight = function(request, response, next) {
    var query = {
        attributes: ['id', 'lat', 'lng'].concat([
            [
                models.sequelize.literal('(SELECT AVG("rating") FROM "Review" WHERE "Review"."local_id" = "Local"."id")'),
                'average'
            ],
        ])
    };

    this.model.findAll(query)
        .then(function(data) {
            response.json(data);
        })
        .catch(next);
};

LocalController.prototype.getById = function(request, response, next) {
    var query = {
      attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'text', 'photo', 'description', 'address'].concat([
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
    }

  	this.model.find(query)
        .then(handleNotFound)
        .then(function(local){
            return promiseContTags(local)
              .then(function(resp){
                response.json(resp);
              });
        })
    .catch(next);
};

LocalController.prototype.create = function(request, response, next) {
  	var body = request.body;

    var _tags  = body.tags || [];
    var params = {
      lat: body.lat,
      lng: body.lng,
      structureType: body.structureType,
      isPublic: body.isPublic && (body.isPublic === 'true' ? 1 : 0),
      text: body.text,
      photo: '',
      description: body.description,
      address: body.address
    };

    // create local
    this.model.create(params).then(handleGetTags).catch(next);

    // get tags informed
    function handleGetTags(local) {
        return getTags(_tags).then(handleSetTags.bind(null, local)).catch(next);
    }

    // set tags local
    function handleSetTags(local, tags) {
        return local.setTags(tags).then(handleSaveImage.bind(null, local)).catch(next);
    }

    // save image local
    function handleSaveImage(local) {
        return saveImage(body.photo, local.id).then(handleUpdateUrlLocal.bind(null, local)).catch(next);
    }

    // update local new image url
    function handleUpdateUrlLocal(local, url) {
        return local.update({photo: url}).then(handleResponse).catch(next);
    }

    // return response
    function handleResponse(local) {
      response.json(local);
    }
};

LocalController.prototype.update = function(request, response, next) {
    var _id  = request.params._id,
        body = request.body,
        self = this;

    var _local = {};
    if (body.lat) _local.lat = body.lat;
    if (body.lng) _local.lng = body.lng;
    if (body.structureType) _local.structureType = body.structureType;
    if (body.isPublic) _local.isPublic = body.isPublic && (body.isPublic === 'true' ? 1 : 0);
    if (body.text) _local.text = body.text;
    if (body.description) _local.description = body.description;
    if (body.address) _local.address = body.address;

  	var query = {
        where: {id : _id}
    };

    this.model.find(query)
        .then(handleNotFound)
        .then(handleUpdateLocal)
        .catch(next);

    // update data local
    function handleUpdateLocal(local) {
        return local.update(_local).then(handleDeleteImage.bind(null, local)).catch(next);
    }

    // delete image local exists
    function handleDeleteImage(local) {
        if(body.photo){
            return deleteImage(_id).then(handleSaveImage.bind(null, local)).catch(next);
        } else {
            handleSaveImage(local);
        }
    }

    // save image local
    function handleSaveImage(local) {
        if (body.photo) {
            return saveImage(body.photo, _id).then(handleUpdateUrlLocal.bind(null, local)).catch(next);
        } else {
            handleUpdateUrlLocal(local);
        }
    }

    // update local new image url
    function handleUpdateUrlLocal(local, url) {
        if (url) {
            return local.update({photo: url}).then(handleResponse.bind(null, local)).catch(next);
        } else {
            handleResponse(local);
        }
    }

    // return response
    function handleResponse(local) {
        response.json(local);
    }
};

LocalController.prototype.remove = function(request, response, next) {
    var _id  = request.params._id;

    var query = {
        where: {id : _id}
    };

    this.model.destroy(query)
      .then(handleNotFound)
      .then(handleDeleteImage.bind(null, _id))
      .catch(next);

    function handleDeleteImage(id, data) {
        return deleteImage(id).then(handleResponse.bind(null, data)).catch(next);
    }

    function handleResponse(rowDeleted) {
      if(rowDeleted){
          response.json({
              message: 'Deleted successfully'
          });
      }
    }
};

LocalController.prototype.removeAll = function(request, response, next) {
    var _id  = request.params._id;

    var query = {where: {}};

    this.model.destroy(query)
        .then(handleNotFound)
        .then(function(rowDeleted){
            response.json({
                message: 'Deleted successfully'
            });
        })
        .catch(next);
};

module.exports = function(LocalModel) {
  	return new LocalController(LocalModel);
};
