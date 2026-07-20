const express = require("express");
const router = express.Router();

const {
  getTotalRevenue,
  getRevenuePerMeter,
  getRevenuePerEmployee,
  getMonthlyRevenue,
  getTotalWaterSold,
  getTopEmployees
} = require("../controllers/analyticsController");

// Total revenue
router.get("/revenue", getTotalRevenue);

// Revenue per meter
router.get("/meter-revenue", getRevenuePerMeter);

// Revenue per employee
router.get("/employee-revenue", getRevenuePerEmployee);

// Monthly revenue
router.get("/monthly-revenue", getMonthlyRevenue);

// Total water sold
router.get("/water-sold", getTotalWaterSold);

// ⭐ Top employees
router.get("/top-employees", getTopEmployees);

module.exports = router;