const express = require("express");

const {
  createDailySale,
  createPOSSale,
  getAllSales,
  getMyStats,
  getAdminStats,
  getTopEmployees,
  restoreRevenue,
  restoreLiters
} = require("../controllers/waterSaleController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const WaterSale = require("../models/WaterSale");

const router = express.Router();

/* =========================================
   ✅ DEBUG (VERY IMPORTANT)
   This prevents "handler must be a function"
========================================= */
console.log({
  createDailySale: typeof createDailySale,
  createPOSSale: typeof createPOSSale,
  getAllSales: typeof getAllSales,
  getMyStats: typeof getMyStats,
  getAdminStats: typeof getAdminStats,
  getTopEmployees: typeof getTopEmployees,
  restoreRevenue: typeof restoreRevenue,
  restoreLiters: typeof restoreLiters,
});

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

    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch sales" });
  }
});

/* =========================================
   🔥 FIX OLD DATA (RUN ONCE)
========================================= */

router.get("/fix-data", async (req, res) => {
  try {
    const sales = await WaterSale.find();

    let updated = 0;

    for (let sale of sales) {
      let totalRevenue = 0;
      let totalQty = 0;

      if (Array.isArray(sale.items) && sale.items.length > 0) {
        sale.items.forEach((item) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;

          totalRevenue += qty * price;
          totalQty += qty;
        });
      }

      if (!totalRevenue && sale.quantity) {
        totalQty = Number(sale.quantity) || 0;
        totalRevenue = Number(sale.revenue) || 0;
      }

      sale.revenue = totalRevenue;
      sale.totalSold = totalQty;

      await sale.save();
      updated++;
    }

    res.json({
      message: "✅ Data fixed successfully",
      updated
    });

  } catch (error) {
    console.error("FIX ERROR ❌", error);
    res.status(500).json({
      message: "Fix failed",
      error: error.message
    });
  }
});

/* =========================================
   VIEW SALES
========================================= */

// Top employees
router.get("/top-employees", protect, getTopEmployees);

// Admin views all sales
router.get("/", protect, adminOnly, getAllSales);

// Employee stats
router.get("/my-stats", protect, getMyStats);

// Admin dashboard stats
router.get("/admin-stats", protect, adminOnly, getAdminStats);

// Admin top employees
router.get("/admin/top-employees", protect, adminOnly, getTopEmployees);

// Restore revenue
router.get("/restore-revenue", protect, adminOnly, restoreRevenue);

// 🔥 RESTORE LITERS (THIS ONE MUST WORK NOW)
router.get("/admin/restore-liters", protect, adminOnly, restoreLiters);

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