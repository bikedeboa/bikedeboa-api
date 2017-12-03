function LogController (LogModel) {
  this.model = LogModel
}

LogController.prototype.getAll = function (request, response, next) {
  const _page = request.params._page;
  if (_page) {
    let limit = 100; // number of records per page
    let offset = 0;

    this.model.findAndCountAll()
    .then((data) => {
      let page = _page; // page number
      let pages = Math.ceil(data.count / limit);
      offset = limit * (page - 1);
      this.model.findAll({
        limit: limit,
        offset: offset,
        $sort: { id: 1 }
      })
      .then((logs) => {
        response.json({'result': logs, 'count': data.count, 'pages': pages});
      });
    })
    .catch(function (error) {
      next(error)
    });
  } else {
    this.model.findAll()
      .then((logs) => {
        response.json(logs);
      });
  }
}

module.exports = function (LogModel) {
  return new LogController(LogModel)
}
