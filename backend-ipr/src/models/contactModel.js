


const mongoose = require('mongoose');

const contactInfo = new mongoose.Schema({
  
  mailId:{
    type:String,
  },
  contactNo:{
    type:String,
  },

  isDeleted:{
    type:Boolean,
    default:false
  },
},{timestamps:true});

module.exports  = mongoose.model('contactInfo', contactInfo);