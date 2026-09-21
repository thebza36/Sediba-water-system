const WaterSale = require("../models/WaterSale");
const User = require("../models/User");

// =====================================================
// TOTAL REVENUE
// =====================================================

const getTotalRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let match = {};

    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const result = await WaterSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: "$revenue" },
        },
      },
    ]);

    res.json({
      totalRevenue: result[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting total revenue",
      error,
    });
  }
};

// =====================================================
// REVENUE PER METER
// =====================================================

const getRevenuePerMeter = async (req, res) => {
  try {
    const result = await WaterSale.aggregate([
      {
        $group: {
          _id: "$meter",
          total: { $sum: "$revenue" },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error getting meter revenue",
      error,
    });
  }
};

// =====================================================
// REVENUE PER EMPLOYEE
// =====================================================

const getRevenuePerEmployee = async (req, res) => {
  try {
    const result = await WaterSale.aggregate([
      {
        $group: {
          _id: "$employee",
          total: { $sum: "$revenue" },
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error getting employee revenue",
      error,
    });
  }
};

// =====================================================
// MONTHLY REVENUE
// =====================================================

const getMonthlyRevenue = async (req, res) => {
  try {
    const result = await WaterSale.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$revenue" },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error getting monthly revenue",
      error,
    });
  }
};

// =====================================================
// TOTAL WATER SOLD
// =====================================================

const getTotalWaterSold = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let match = {};

    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const result = await WaterSale.aggregate([
      { $match: match },

      {
        $group: {
          _id: null,
          total: { $sum: "$totalSold" },
        },
      },
    ]);

    res.json({
      totalWaterSold: result[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error getting total water sold",
      error,
    });
  }
};

// =====================================================
// ⭐ ALL EMPLOYEES LEADERBOARD
// =====================================================

const getTopEmployees = async (req, res) => {
  try {
    /*
     * IMPORTANT:
     *
     * We start with USERS instead of WaterSale.
     *
     * This means employees with NO sales will ALSO appear.
     *
     * Example:
     *
     * Employee A → R5 794.40
     * Employee B → R2 500.00
     * Employee C → R0
     * Employee D → R0
     *
     * Everyone is displayed.
     */

    const result = await User.aggregate([
      // -------------------------------------------------
      // ONLY EMPLOYEES
      // -------------------------------------------------

      {
        $match: {
          role: {
            $in: ["employee", "staff"],
          },
        },
      },

      // -------------------------------------------------
      // FIND ALL SALES FOR EACH EMPLOYEE
      // -------------------------------------------------

      {
        $lookup: {
          from: "watersales",
          localField: "_id",
          foreignField: "employee",
          as: "sales",
        },
      },

      // -------------------------------------------------
      // CALCULATE PERFORMANCE
      // -------------------------------------------------

      {
        $addFields: {
          totalRevenue: {
            $sum: "$sales.revenue",
          },

          totalWaterSold: {
            $sum: "$sales.totalSold",
          },

          totalSales: {
            $size: "$sales",
          },
        },
      },

      // -------------------------------------------------
      // RETURN EMPLOYEE INFORMATION
      // -------------------------------------------------

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,

          totalRevenue: 1,
          totalWaterSold: 1,
          totalSales: 1,
        },
      },

      // -------------------------------------------------
      // HIGHEST REVENUE FIRST
      // -------------------------------------------------

      {
        $sort: {
          totalRevenue: -1,
          totalWaterSold: -1,
          name: 1,
        },
      },

      // -------------------------------------------------
      // IMPORTANT:
      // NO $LIMIT HERE
      //
      // ALL EMPLOYEES ARE RETURNED.
      // -------------------------------------------------
    ]);

    res.json(result);
  } catch (error) {
    console.error(
      "GET TOP EMPLOYEES ERROR:",
      error
    );

    res.status(500).json({
      message: "Error getting top employees",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getTotalRevenue,
  getRevenuePerMeter,
  getRevenuePerEmployee,
  getMonthlyRevenue,
  getTotalWaterSold,
  getTopEmployees,
};