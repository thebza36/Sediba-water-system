const WaterSale = require("../models/WaterSale");
const WaterMeter = require("../models/WaterMeter");
const Product = require("../models/Product");

/* =====================================================
   EMPLOYEE CREATES METER SALE (FIXED)
===================================================== */
const createDailySale = async (req, res) => {
  try {
    const meterId = req.body.meterId || req.body.meter;
    const { openingReading, closingReading } = req.body;

    console.log("Incoming body:", req.body);

    if (!req.user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if (!meterId) {
      return res.status(400).json({ message: "Meter ID is required" });
    }

    const meter = await WaterMeter.findById(meterId);

    if (!meter || !meter.isActive) {
      return res.status(404).json({ message: "Meter not found" });
    }

    const open = Number(openingReading);
    const close = Number(closingReading);

    if (isNaN(open) || isNaN(close) || close < open) {
      return res.status(400).json({ message: "Invalid readings" });
    }

    const totalSold = close - open;
    const price = Number(meter.pricePerUnit || 0);
    const revenue = totalSold * price;

    const sale = await WaterSale.create({
      meter: meter._id,
      employee: req.user.id,
      openingReading: open,
      closingReading: close,
      totalSold,
      revenue,

      // ✅ ADDED
      saleMode: "meter"
    });

    res.status(201).json({
      message: "✅ Sale recorded",
      sale
    });

  } catch (err) {
    console.error("CREATE SALE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   POS SALE (FIXED + LITERS SUPPORT)
===================================================== */
const createPOSSale = async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    let totalRevenue = 0;
    let totalLiters = 0;
    const formattedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const qty = Number(item.quantity) || 0;
      const price = Number(product.price) || 0;
      const total = qty * price;

      totalRevenue += total;
      totalLiters += qty;

      formattedItems.push({
        product: product._id,
        quantity: qty,
        price,
        total
      });
    }

    const sale = await WaterSale.create({
      employee: req.user.id,
      items: formattedItems,
      paymentMethod: paymentMethod || "cash",
      revenue: totalRevenue,
      totalSold: totalLiters,

      // ✅ ADDED
      saleMode: "pos"
    });

    res.status(201).json({
      message: "✅ POS sale completed",
      sale
    });

  } catch (error) {
    console.error("POS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET ALL SALES
===================================================== */
const getAllSales = async (req, res) => {
  try {
    const sales = await WaterSale.find()
      .populate("meter", "meterNumber location pricePerUnit")
      .populate("employee", "name email")
      .populate("items.product", "name size")
      .sort({ createdAt: -1 });

    res.json(sales);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   EMPLOYEE STATS
===================================================== */
const getMyStats = async (req, res) => {
  try {
    const sales = await WaterSale.find({ employee: req.user.id });

    const monthRevenue = sales.reduce(
      (sum, s) => sum + (Number(s.revenue) || 0), 0
    );

    const monthTotalSold = sales.reduce(
      (sum, s) => sum + (Number(s.totalSold) || 0), 0
    );

    res.json({
      monthTotalSold,
      monthRevenue,
      totalSubmissionsThisMonth: sales.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   ADMIN STATS
===================================================== */
const getAdminStats = async (req, res) => {
  try {
    const sales = await WaterSale.find();

    const monthRevenue = sales.reduce(
      (sum, s) => sum + (Number(s.revenue) || 0), 0
    );

    const totalSold = sales.reduce(
      (sum, s) => sum + (Number(s.totalSold) || 0), 0
    );

    res.json({
      monthTotalSold: totalSold,
      monthRevenue,
      todayRevenue: monthRevenue,
      totalSalesThisMonth: sales.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🔥 FIXED TOP EMPLOYEES (FRONTEND COMPATIBLE)
===================================================== */
const getTopEmployees = async (req, res) => {
  try {

    const ranking = await WaterSale.aggregate([

      {
        $group: {
          _id: "$employee",

          // ✅ SAFE SUMS
          totalRevenue: { $sum: { $ifNull: ["$revenue", 0] } },
          totalSold: { $sum: { $ifNull: ["$totalSold", 0] } }
        }
      },

      // ✅ SORT FIRST
      { $sort: { totalRevenue: -1 } },

      // ✅ ADD RANK
      {
        $setWindowFields: {
          sortBy: { totalRevenue: -1 },
          output: {
            rank: { $rank: {} }
          }
        }
      },

      // ✅ JOIN USER
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // ✅ FINAL SHAPE (IMPORTANT)
      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",

          totalRevenue: { $ifNull: ["$totalRevenue", 0] },
          totalSold: { $ifNull: ["$totalSold", 0] },

          rank: 1
        }
      }

    ]);

    // ✅ RETURN ARRAY (NOT OBJECT ❗)
    res.json(ranking);

  } catch (err) {
    console.error("TOP EMPLOYEES ERROR:", err);
    res.status(500).json({ message: "Failed to get ranking" });
  }
};

/* =====================================================
   RESTORE REVENUE
===================================================== */
const restoreRevenue = async (req, res) => {
  try {
    const sales = await WaterSale.find().populate("meter");

    let updated = 0;

    for (const sale of sales) {
      const price = sale.meter?.pricePerUnit || 0;

      if (sale.totalSold && price > 0) {
        sale.revenue = sale.totalSold * price;
        await sale.save();
        updated++;
      }
    }

    res.json({ message: "✅ Revenue restored", updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fix failed" });
  }
};


/* =====================================================
   🔥 RESTORE LITERS
===================================================== */
const restoreLiters = async (req, res) => {
  try {
    const sales = await WaterSale.find();

    let updated = 0;

    for (const sale of sales) {

      if (!sale.meter && Array.isArray(sale.items)) {

        let totalLiters = 0;

        sale.items.forEach(item => {
          totalLiters += Number(item.quantity) || 0;
        });

        if (totalLiters > 0) {
          sale.totalSold = totalLiters;
          await sale.save();
          updated++;
        }
      }
    }

    res.json({
      message: "✅ Liters restored",
      updated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to restore liters" });
  }
};


module.exports = {
  createDailySale,
  createPOSSale,
  getAllSales,
  getMyStats,
  getAdminStats,
  getTopEmployees,
  restoreRevenue,
  restoreLiters
};