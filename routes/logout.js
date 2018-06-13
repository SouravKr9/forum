var express = require('express');
var router = express.Router();

router.get('/', (request, response) => {
    request.logout();
    request.flash('success_msg', 'You are logged out');
    response.redirect('/users/login');
});

module.exports = router;