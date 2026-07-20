const mongoose = require("mongoose");

const tankRefillSchema =
new mongoose.Schema(
{
  tankName: {
    type: String,
    required: true,
    trim: true
  },

  litresAdded: {
    type: Number,
    required: true,
    min: 0
  },

  date: {
    type: Date,
    default: Date.now
  },

 employeeName: {
  type: String,
  default: ""
},

createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
},
{
  timestamps: true
}
);

module.exports =
mongoose.model(
  "TankRefill",
  tankRefillSchema
);