var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var app = require('../index');
var Question = require('../models/Questions');
router.get('/', ensureAuthenticated, (request, response)=>{

    Question.find({}).sort({date: 'desc'})
        .then(questions => {
            //console.log(questions);
            response.render('questions/index', {
                questions: questions
            });
        });
});
router.post('/', ensureAuthenticated, (request, response)=>{

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
    .then(question => {
      //console.log(question.user);
      request.flash('success_msg', 'Question added');
      response.redirect('/questions');
    });
  }
});
router.get('/add', ensureAuthenticated, (request, response)=>{
    response.render('./questions/add');
});

router.get('/edit/:id', ensureAuthenticated, (request,response)=>{
  Question.findOne({
    _id: request.params.id
  })
  .then(question => {
    //if(question.user != request.user.id){
      // request.flash('error_msg', 'Unauthorized Access');
      // response.redirect('/questions');
    // }
    // else{
      response.render('questions/edit', {
        question: question
      });
    //}
  });
});
router.put('/:id', ensureAuthenticated, (request, response)=> {
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
router.delete('/:id', ensureAuthenticated, (request, response)=> {
    Question.remove({_id: request.params.id})
        .then(() => {
            request.flash('success_msg', 'Question removed');
            response.redirect('/questions');
        });
});
function ensureAuthenticated(request, response, next){
    if(request.isAuthenticated()){
        return next();
    }
    else{
        request.flash('error_msg', 'Unauthorized Access');
        response.redirect('/users/login');
    }
}

module.exports = router;