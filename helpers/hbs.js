//var express = require('express');

module.exports = {
  hasAsked: function(re, questionUser){
    // console.log(re);
    // console.log(questionUser);
    if(re === questionUser)
      return true;
    else
      return false;
  }
}