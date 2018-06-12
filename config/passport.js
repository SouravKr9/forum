const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load User Model
const User = mongoose.model('users');

//This is where authentication happens
module.exports = function(passport) {
  passport.use(new localStrategy({usernameField: 'email'}, (email, password, done) =>{
    //Compare email
    User.findOne({
      email: email,
    }).then(user => {
      if(!user){
        return done(null, false, {message: 'No User Found'});
      }
      //Compare Password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        }
        else{
          return done(null, false, {message: 'Wrong Password'});
        }
      })
    })
  }));

  passport.serializeUser(function(user, done) {
     done(null, user.id); 
    });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}