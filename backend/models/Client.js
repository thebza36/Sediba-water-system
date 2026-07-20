const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    location: String,

    phone: String,

    type: {
      type: String,
      enum: ["individual", "business"],
      default: "individual",
    },

    // 🔥 CLIENT CAN HAVE MULTIPLE METERS
    meters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WaterMeter",
      },
    ],

    // 🔥 LIVE CALCULATED FIELDS (optional but useful)
    totalWater: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // 🔥 TRACK CLIENT DEBT
    debt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
