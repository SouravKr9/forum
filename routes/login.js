var express = require('express');
var router = express.Router();
const passport = require('passport');
router.get('/', (request, response) =>{
    response.render('./users/login');
});
router.post('/', (request, response, next) => {
    passport.authenticate('local', {
        successRedirect: '../questions',
        failureRedirect: 'login',
        failureFlash: true
    })(request, response, next);
});
module.exports = router;