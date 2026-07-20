const User = require("../models/user");
const Meter = require("../models/Meter");
const Reading = require("../models/Reading");

// ===============================
// DASHBOARD STATS
// ===============================
exports.getDashboardStats = async (req, res) => {
  try {
    const employees = await User.countDocuments({ role: "employee" });
    const meters = await Meter.countDocuments();
    const readings = await Reading.countDocuments();

    res.json({
      employees,
      meters,
      readings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// TOP EMPLOYEES
// ===============================
exports.getTopEmployees = async (req, res) => {
  try {
    const topEmployees = await Reading.aggregate([
      {
        $group: {
          _id: "$employee",
          totalReadings: { $sum: 1 }
        }
      },
      { $sort: { totalReadings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          name: "$employee.name",
          totalReadings: 1
        }
      }
    ]);

    res.json(topEmployees);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};