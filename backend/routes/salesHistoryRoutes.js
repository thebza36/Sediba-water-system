const express = require("express");

const {
  createDailySale,
  createPOSSale,
  getAllSales,
  getMyStats,
  getAdminStats,
  getTopEmployees
} = require("../controllers/waterSaleController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const WaterSale = require("../models/WaterSale");

const router = express.Router();

/* =========================================
   EMPLOYEE SALES
========================================= */

// Employee records a meter sale
router.post("/", protect, createDailySale);

// Employee records a POS sale
router.post("/pos", protect, createPOSSale);

/* =========================================
   EMPLOYEE MY SALES
========================================= */

router.get("/my-sales", protect, async (req, res) => {

  try {

    const sales = await WaterSale.find({ employee: req.user._id })
      .populate("meter", "meterNumber")
      .populate("employee", "name")
      .sort({ createdAt: -1 });

    // ✅ FORCE consistent data for frontend
    const formatted = sales.map(s => {

      // 🔹 If it's a meter sale → use totalSold
      if (s.totalSold !== undefined && s.totalSold !== null) {
        return s;
      }

      // 🔹 If it's a POS sale → calculate liters from items (if needed)
      let totalSold = 0;

      if (s.items && s.items.length > 0) {
        totalSold = s.items.reduce((sum, item) => {
          return sum + Number(item.quantity || 0);
        }, 0);
      }

      return {
        ...s.toObject(),
        totalSold // ✅ inject missing field
      };

    });

    res.json(formatted);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Failed to fetch sales" });

  }

});



/* =========================================
   VIEW SALES
========================================= */

// Admin views all sales
router.get("/", protect, adminOnly, getAllSales);

// Employee stats
router.get("/my-stats", protect, getMyStats);

// Admin dashboard stats
router.get("/admin-stats", protect, adminOnly, getAdminStats);

// Top employees
router.get("/admin/top-employees", protect, adminOnly, getTopEmployees);

/* =========================================
   DELETE SALE
========================================= */

router.delete("/:id", protect, adminOnly, async (req, res) => {

  try {

    const sale = await WaterSale.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json({ message: "Sale deleted successfully" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

});

module.exports = router;