const mongoose = require("mongoose");

const meterReadingSchema = new mongoose.Schema(
{
  meter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WaterMeter",
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },

  previousReading: {
    type: Number,
    required: true,
    default: 0
  },

  currentReading: {
    type: Number,
    required: true
  },

  usage: {
    type: Number,
    default: 0
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
  "MeterReading",
  meterReadingSchema
);