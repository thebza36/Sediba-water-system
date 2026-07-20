const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({

  companyName:{
    type:String,
    default:"Sediba Water"
  },

  currency:{
    type:String,
    default:"ZAR"
  },

  tax:{
    type:Number,
    default:0
  },

  lowStockAlert:{
    type:Number,
    default:5
  },

  defaultCategory:{
    type:String,
    default:"water"
  }

},{timestamps:true});

module.exports = mongoose.model("Settings",SettingsSchema);