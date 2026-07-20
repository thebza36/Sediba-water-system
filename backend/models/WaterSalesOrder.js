const mongoose = require("mongoose");

const WaterSalesOrderSchema = new mongoose.Schema({
  customerName: String,

  liters: Number,
  pricePerLiter: Number,

  totalAmount: Number,

  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WaterQuotation"
  }

}, { timestamps: true });

module.exports = mongoose.model("WaterSalesOrder", WaterSalesOrderSchema);