const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  qid: {
    type: String,
    required: true
  },
  ans: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    value: Date.now()
  },
  user: {
    type: String,
    required: true
  }
});

var Answer = module.exports = mongoose.model('answers', AnswerSchema);