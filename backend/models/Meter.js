const mongoose = require("mongoose");

const meterSchema = new mongoose.Schema(
  {
    meterNumber: {
      type: String,
      required: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
    },

    pricePerUnit: {
      type: Number,
      default: 0,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    editingBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    editingAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ✅ FIXED PRE-SAVE (NO next ERROR) */
meterSchema.pre("save", function () {
  if (this.assignedEmployee) {
    this.assignedTo = this.assignedEmployee;
  } else if (this.assignedTo) {
    this.assignedEmployee = this.assignedTo;
  }
});

module.exports = mongoose.model("Meter", meterSchema);