const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserDataSchema = new Schema({
    reg:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

var UserData =  module.exports = mongoose.model('user_data', UserDataSchema);