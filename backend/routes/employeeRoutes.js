const express = require("express");
const router = express.Router();
const Meter = require("../models/Meter");
const WaterSale = require("../models/WaterSale");


// =================================
// GET EMPLOYEE METERS
// =================================
router.get("/meters/:employeeId", async (req, res) => {
  try {

    const meters = await Meter.find({
      assignedTo: req.params.employeeId
    });

    res.json(meters);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =================================
// GET EMPLOYEE SALES
// =================================
router.get("/sales/:employeeId", async (req, res) => {
  try {

    const sales = await WaterSale.find({
      recordedBy: req.params.employeeId
    }).populate("meter");

    res.json(sales);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;