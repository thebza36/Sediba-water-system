const mongoose = require("mongoose");

const WaterQuotationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },

  liters: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },

  totalAmount: { type: Number },

  status: {
    type: String,
    enum: ["draft", "converted"],
    default: "draft"
  }

}, { timestamps: true });

module.exports = mongoose.model("WaterQuotation", WaterQuotationSchema);