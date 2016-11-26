var express = require('express'),
    router  = express.Router();

router.get('/', (request, response) => {
    response.render('index', {title: 'BikeDeBoa API'});
});

module.exports = router;
