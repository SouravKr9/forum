var express = require('express');
var app = require('../index');
var router = express.Router();
var UserData = require('../models/UserData');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
router.get('/',function (req,res,next) {
    res.render('./users/register');
});
router.post('/', (request, response) => {
    let errors = [];

    if(request.body.password!=request.body.cnfpassword){
        errors.push({text: 'Passwords do not match.'});
    }
    if(request.body.password.length<6){
        errors.push({text: 'Password must be atleast 6 characters long'});
    }

    if(errors.length>0){
        response.render('./users/register', {
            errors: errors,
            name: request.body.name,
            reg: request.body.reg,
            type: request.body.type,
            email: request.body.email,
            password: request.body.password,
            cnfpassword: request.body.cnfpassword
        });
    }
    else{
        UserData.findOne({email: request.body.email})
            .then(user => {
                if(user){
                    request.flash('error_msg', 'Email already registered');
                    response.redirect('login');
                }
                else{
                     UserData.findOne({reg:request.body.reg})
                       .then(user => {
                           if(user)
                           {
                               request.flash('error_msg', 'Registration ID already registered');
                               response.redirect('login');
                           }else
                           {
                                   const newUser = new UserData({
                                   name: request.body.name,
                                   reg: request.body.reg,
                                   type: request.body.type,
                                   email: request.body.email,
                                   password: request.body.password,
                                   branch: request.body.branch,
                                   topics: request.body.topics
                           });
                                   console.log("I am here!!");
                               bcrypt.genSalt(10, (err, salt)=> {
                                   bcrypt.hash(newUser.password, salt, (err, hash)=> {
                                       if(err) throw err;

                                       newUser.password = hash;
                                       newUser.save()
                                           .then(user => {
                                               request.flash('success_msg', 'You are now registered and can log in');
                                               response.redirect('login');
                                           })
                                           .catch(err => {
                                               console.log(err);
                                               return;
                                           });
                                   });
                               });
                           }
                       });



                }
            });
    }
});

module.exports = router;