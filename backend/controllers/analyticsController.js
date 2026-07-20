const WaterSale = require("../models/WaterSale");

// Total revenue
const getTotalRevenue = async (req, res) => {
  try {

    const { startDate, endDate } = req.query;

    let match = {};

    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const result = await WaterSale.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$revenue" } } }
    ]);

    res.json({ totalRevenue: result[0]?.total || 0 });

  } catch (error) {
    res.status(500).json({ message: "Error getting total revenue", error });
  }
};

// Revenue per meter
const getRevenuePerMeter = async (req, res) => {
  try {
    const result = await WaterSale.aggregate([
      { $group: { _id: "$meter", total: { $sum: "$revenue" } } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error getting meter revenue", error });
  }
};

// Revenue per employee
const getRevenuePerEmployee = async (req, res) => {
  try {
    const result = await WaterSale.aggregate([
      { $group: { _id: "$employee", total: { $sum: "$revenue" } } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error getting employee revenue", error });
  }
};

// Monthly revenue
const getMonthlyRevenue = async (req, res) => {
  try {

    const result = await WaterSale.aggregate([

      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$revenue" }
        }
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }

    ]);

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: "Error getting monthly revenue", error });
  }
};

// Total water sold
const getTotalWaterSold = async (req, res) => {
  try {

    const { startDate, endDate } = req.query;

    let match = {};

    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const result = await WaterSale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalSold" }
        }
      }
    ]);

    res.json({ totalWaterSold: result[0]?.total || 0 });

  } catch (error) {
    res.status(500).json({
      message: "Error getting total water sold",
      error
    });
  }
};

// ⭐ TOP EMPLOYEES (NEW)
const getTopEmployees = async (req, res) => {
  try {

    const result = await WaterSale.aggregate([

      {
        $group: {
          _id: "$employee",
          totalRevenue: { $sum: "$revenue" },
          totalWaterSold: { $sum: "$totalSold" }
        }
      },

      {
        $lookup: {
          from: "users", // because employee ref = "User"
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },

      { $unwind: "$employee" },

      {
        $project: {
          _id: 0,
          name: "$employee.name",
          totalRevenue: 1,
          totalWaterSold: 1
        }
      },

      { $sort: { totalRevenue: -1 } },

      { $limit: 5 }

    ]);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "Error getting top employees",
      error
    });
  }
};

module.exports = {
  getTotalRevenue,
  getRevenuePerMeter,
  getRevenuePerEmployee,
  getMonthlyRevenue,
  getTotalWaterSold,
  getTopEmployees
};