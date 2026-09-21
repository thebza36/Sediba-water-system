const mongoose = require("mongoose");

const waterTestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employeeName: {
      type: String,
      default: "Unknown Employee",
    },

    testDate: {
      type: Date,
      required: true,
    },

    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14,
    },

    chlorine: {
      type: Number,
      required: true,
      min: 0,
    },

    temperature: {
      type: Number,
      required: true,
    },

    turbidity: {
      type: Number,
      required: true,
      min: 0,
    },

    tds: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PASS", "FAIL"],
      required: true,
      default: "PASS",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WaterTest", waterTestSchema);