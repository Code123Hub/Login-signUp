

const mongoose = require('mongoose');

const speaker = new mongoose.Schema({
    name:{
        type:String,
        required:true
      },
      designation:{
        type:String,
        required:true
    
      },
      location:{
        type:String,
        required:true
    
      },
      date:{
        type:String,
        required:true
    
      },
      topic:{
        type:String,
        required:true
      },
      
      isDeleted:{
        type:Boolean,
        default:false
      },
    },{timestamps:true});

module.exports  = mongoose.model('speaker', speaker);