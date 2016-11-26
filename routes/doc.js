var express = require('express'),
    router  = express.Router();

router.get('/', function(request, response) {
    response.render('index', {title: 'bike de boa API'});
});

module.exports = router;
