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
        if (!photo) reject('');

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
                    resolve(imageName);
                }
            });
    });
}

// ---------------- private functions ---------------- //

LocalController.prototype.getAll = function(request, response, next) {
    var query = {
        attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'text', 'photo'].concat([
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
      attributes: ['id', 'lat', 'lng', 'lat', 'structureType', 'isPublic', 'text', 'photo'].concat([
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
      photo: ''
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
    if (body.photo) _local.photo = body.photo;

  	var query = {
        where: {id : _id}
    };

    saveImage(body.photo).
        then(function(imageUrl){
            _local.photo = imageUrl;
            self.model.find(query)
                .then(handleNotFound)
                .then(function(data){
                    data.update(_local)
                        .then(function(local){
                            response.json(local);
                            return local;
                        })
                        .catch(next);
                    return data;
                })
            .catch(next);
        })
        .catch(next);
};

LocalController.prototype.remove = function(request, response, next) {
    var _id  = request.params._id;

    var query = {
        where: {id : _id}
    };

    this.model.destroy(query)
        .then(handleNotFound)
        .then(function(rowDeleted){
            if(rowDeleted === 1){
                response.json({
                    message: 'Deleted successfully'
                });
            }
        })
        .catch(next);
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
