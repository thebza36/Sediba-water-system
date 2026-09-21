const express = require("express");
const router = express.Router();

const WaterQuotation = require("../models/WaterQuotation");
const WaterSalesOrder = require("../models/WaterSalesOrder");
const { protect } = require("../middleware/authMiddleware");

/* =========================
   CREATE QUOTATION
========================= */
router.post("/quotation", protect, async (req, res) => {
  try {
    const { customerName, liters, pricePerLiter } = req.body;

    const totalAmount = liters * pricePerLiter;

    const quotation = await WaterQuotation.create({
      customerName,
      liters,
      pricePerLiter,
      totalAmount
    });

    res.json(quotation);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET QUOTATIONS
========================= */
router.get("/quotation", protect, async (req, res) => {
  try {
    const data = await WaterQuotation.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CONVERT → SALES ORDER
========================= */
router.post("/quotation/:id/convert", protect, async (req, res) => {
  try {
    const q = await WaterQuotation.findById(req.params.id);

    if (!q) return res.status(404).json({ msg: "Quotation not found" });

    const order = await WaterSalesOrder.create({
      customerName: q.customerName,
      liters: q.liters,
      pricePerLiter: q.pricePerLiter,
      totalAmount: q.totalAmount,
      quotationId: q._id
    });

    q.status = "converted";
    await q.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET SALES ORDERS
========================= */
router.get("/sales-orders", protect, async (req, res) => {
  try {
    const orders = await WaterSalesOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;