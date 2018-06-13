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
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const questionsRotuer = require('./routes/questions');
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

// require('./models/User');
// const User = mongoose.model('users');

//Passport Config
require('./config/passport')(passport);

//Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('views',path.join(__dirname,'./views'));
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
// function ensureAuthenticated(request, response, next){
//   if(request.isAuthenticated()){
//     return next();
//   }
//   else{
//     request.flash('error_msg', 'Unauthorized Access');
//     response.redirect('/users/login');
//   }
// }

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
// app.get('/questions/add', ensureAuthenticated, (request, response)=>{
//   response.render('questions/add');
// });

//Edit Question
// app.get('/questions/edit/:id', ensureAuthenticated, (request,response)=>{
//   Question.findOne({
//     _id: request.params.id
//   })
//   .then(question => {
//     if(question.user != request.user.id){
//       request.flash('error_msg', 'Unauthorized Access');
//       response.redirect('/questions');
//     }
//     else{
//       response.render('questions/edit', {
//         question: question
//       });
//     }
//   });
// });
//Questions route


//Process form
app.use('/questions',questionsRotuer);
/////////////////////////////////////////
// app.post('/questions', ensureAuthenticated, (request, response)=>{
//   let errors = [];
//
//   if(!request.body.title){
//     errors.push({text: 'Please enter a title'});
//   }
//   if(!request.body.details){
//     errors.push({text: 'Please enter details'});
//   }
//
//   if(errors.length>0){
//     response.render('questions/add', {
//       errors: errors,
//       title: request.body.title,
//       details: request.body.details
//     });
//   }
//   else{
//     const newUser = {
//       title: request.body.title,
//       details: request.body.details,
//       user: request.user.id
//     };
//     new Question(newUser).save()
//     .then(idea => {
//       request.flash('success_msg', 'Question added');
//       response.redirect('/questions');
//     });
//   }
// });
//Editing Questions
// app.put('/questions/:id', ensureAuthenticated, (request, response)=> {
//   Question.findOne({
//     _id: request.params.id
//   })
//   .then(question => {
//     question.title = request.body.title;
//     question.details = request.body.details;
//
//     question.save().then(question => {
//       request.flash('success_msg', 'Question updated');
//       response.redirect('/questions');
//     });
//   });
// });
//Delete Questions
// app.delete('/questions/:id', ensureAuthenticated, (request, response)=> {
//   Question.remove({_id: request.params.id})
//     .then(() => {
//       request.flash('success_msg', 'Question removed');
//       response.redirect('/questions');
//     });
// });
//Login Route
app.use('/users/login',loginRouter);
//Register Route
app.use('/users/register',registerRouter);
//Logout Route
app.use('/users/logout',logoutRouter);
module.exports = app;