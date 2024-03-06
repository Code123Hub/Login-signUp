

const mongoose = require('mongoose');

const admin = new mongoose.Schema({
  
  email:{
    type:String,
  },
  password:{
    type:String,
  },
  name:{
    type:String
  },
  
  isDeleted:{
    type:Boolean,
    default:false
  },
},{timestamps:true});

module.exports  = mongoose.model('admin', admin);