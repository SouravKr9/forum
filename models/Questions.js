const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const QuestionSchema = new Schema({
  title:{
    type: String,
    required: true
  },
  details:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

var Question =  module.exports = mongoose.model('questions',QuestionSchema);
