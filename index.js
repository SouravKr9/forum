const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const app = express();

mongoose.Promise = global.Promise;
//Mongoose Connect
mongoose.connect('mongodb://localhost/forum-dev', {
  //useMongoClient: true          //only use it for mongoose version < 5.0
})
.then(()=>console.log('MongoDB Connected'))
.catch(err=>console.log(err));

//Load Model
require('./models/Questions');
const Question = mongoose.model('questions');

require('./models/User');
const User = mongoose.model('users');

//Passport Config
require('./config/passport')(passport);

//Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//body-parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method-override Middleware
app.use(methodOverride('_method'));

//Express Session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Passport Session Middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash Middleware
app.use(flash());

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

//Global Variables
app.use(function(request, response, next){
  response.locals.success_msg = request.flash('success_msg');
  response.locals.error_msg = request.flash('error_msg');
  response.locals.error = request.flash('error');
  response.locals.user = request.user || null;
  next();
});

//Preventing url re-writing
function ensureAuthenticated(request, response, next){
  if(request.isAuthenticated()){
    return next();
  }
  else{
    request.flash('error_msg', 'Unauthorized Access');
    response.redirect('/users/login');
  }
}

//Index Route
app.get('/',(request, response)=>{
  const msg = 'Hi';
  response.render('index', {
    title: msg
  });
});

//About Route
app.get('/about',(request, response)=>{
  response.render('about');
});

//Question Input Form
app.get('/questions/add', ensureAuthenticated, (request, response)=>{
  response.render('questions/add');
});

//Edit Question
app.get('/questions/edit/:id', ensureAuthenticated, (request,response)=>{
  Question.findOne({
    _id: request.params.id
  })
  .then(question => {
    if(question.user != request.user.id){
      request.flash('error_msg', 'Unauthorized Access');
      response.redirect('/questions');
    }
    else{
      response.render('questions/edit', {
        question: question
      });
    }
  });
});
//Questions route
app.get('/questions', ensureAuthenticated, (request, response)=>{
  Question.find({user: request.user.id}).sort({date: 'desc'})
    .then(questions => {
      response.render('questions/index', {
        questions: questions
      });
    });
});

//Process form
app.post('/questions', ensureAuthenticated, (request, response)=>{
  let errors = [];

  if(!request.body.title){
    errors.push({text: 'Please enter a title'});
  }
  if(!request.body.details){
    errors.push({text: 'Please enter details'});
  }

  if(errors.length>0){
    response.render('questions/add', {
      errors: errors,
      title: request.body.title,
      details: request.body.details
    });
  }
  else{
    const newUser = {
      title: request.body.title,
      details: request.body.details,
      user: request.user.id
    };
    new Question(newUser).save()
    .then(idea => {
      request.flash('success_msg', 'Question added');
      response.redirect('/questions');
    });
  }
});

//Editing Questions
app.put('/questions/:id', ensureAuthenticated, (request, response)=> {
  Question.findOne({
    _id: request.params.id
  })
  .then(question => {
    question.title = request.body.title;
    question.details = request.body.details;

    question.save().then(question => {
      request.flash('success_msg', 'Question updated');
      response.redirect('/questions');
    });
  });
});

//Delete Questions
app.delete('/questions/:id', ensureAuthenticated, (request, response)=> {
  Question.remove({_id: request.params.id})
    .then(() => {
      request.flash('success_msg', 'Question removed');
      response.redirect('/questions');
    });
});

//Login Route
app.get('/users/login', (request, response) =>{
  response.render('users/login');
});

//Register Route
app.get('/users/register', (request, response)=> {
  response.render('users/register');
});

//Login form POST
app.post('/users/login', (request, response, next) => {
  passport.authenticate('local', {
    successRedirect: '/questions',
    failureRedirect: '/users/login',
    failureFlash: true
  })(request, response, next);
});

//Register form POST
app.post('/users/register', (request, response) => {
  let errors = [];

  if(request.body.password!=request.body.cnfpassword){
    errors.push({text: 'Passwords do not match.'});
  }
  if(request.body.password.length<6){
    errors.push({text: 'Password must be atleast 6 characters long'});
  }

  if(errors.length>0){
    response.render('users/register', {
      errors: errors,
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      cnfpassword: request.body.cnfpassword
    });
  }
  else{
    User.findOne({email: request.body.email})
      .then(user => {
        if(user){
          request.flash('error_msg', 'Email already registered');
          response.redirect('/users/login');
        }
        else{
          const newUser = new User({
            name: request.body.name,
            email: request.body.email,
            password: request.body.password
          });
      
          bcrypt.genSalt(10, (err, salt)=> {
            bcrypt.hash(newUser.password, salt, (err, hash)=> {
              if(err) throw err;
      
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  request.flash('success_msg', 'You are now registered and can log in');
                  response.redirect('/users/login');
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

//Logout Route
app.get('/users/logout', (request, response) => {
  request.logout();
  request.flash('success_msg', 'You are logged out');
  response.redirect('/users/login');
});

const port = process.env.PORT || 5000;

app.listen(port, ()=>{
  console.log(`Service running on port ${port}`);
});