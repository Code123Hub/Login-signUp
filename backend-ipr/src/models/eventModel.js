
const mongoose = require('mongoose');

const meeting = new mongoose.Schema({
    title:{
        type:String,
        required:true
      },
      time:{
        type:Number,
        required:true
    
      },
      location:{
        type:String,
        required:true
    
      },
      date:{
        type:Number,
        required:true
    
      },
      endTime:{
        type:Number,
        required:true
      },
      
      isDeleted:{
        type:Boolean,
        default:false
      },
    },{timestamps:true});

module.exports  = mongoose.model('meeting', meeting);