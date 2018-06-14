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
//Process form
app.use('/questions',questionsRotuer);
app.use('/users/login',loginRouter);
//Register Route
app.use('/users/register',registerRouter);
//Logout Route
app.use('/users/logout',logoutRouter);
module.exports = app;