const mongoose = require("mongoose");

const waterMeterSchema = new mongoose.Schema(
  {
    meterNumber: {
      type: String,
      unique: true,
      index: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

/* =====================================================
   AUTO GENERATE METER NUMBER (SAFE)
===================================================== */
waterMeterSchema.pre("save", async function (next) {
  try {
    // only generate if missing
    if (!this.meterNumber) {

      const WaterMeter = mongoose.model("WaterMeter");

      const lastMeter = await WaterMeter
        .findOne()
        .sort({ createdAt: -1 })
        .lean();

      let meterNumber = "MRT-001";

      if (lastMeter && lastMeter.meterNumber) {

        const parts = lastMeter.meterNumber.split("-");
        const lastNumber = parseInt(parts[1], 10);

        if (!isNaN(lastNumber)) {
          const nextNumber = (lastNumber + 1)
            .toString()
            .padStart(3, "0");

          meterNumber = `MRT-${nextNumber}`;
        }
      }

      this.meterNumber = meterNumber;
    }

    next(); // ✅ IMPORTANT

  } catch (error) {
    next(error); // ✅ prevent silent crashes
  }
});

module.exports =
  mongoose.models.WaterMeter ||
  mongoose.model("WaterMeter", waterMeterSchema);