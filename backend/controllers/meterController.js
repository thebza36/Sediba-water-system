const WaterMeter = require("../models/WaterMeter");
const User = require("../models/user");

/* =====================================================
   CREATE METER (ADMIN)
===================================================== */
exports.createMeter = async (req, res) => {
  try {
    const { meterNumber, location, pricePerUnit } = req.body;

    if (!meterNumber || !location || pricePerUnit == null) {
      return res.status(400).json({
        message: "Meter number, location and pricePerUnit are required",
      });
    }

    if (pricePerUnit < 0) {
      return res.status(400).json({
        message: "Price per unit cannot be negative",
      });
    }

    const existing = await WaterMeter.findOne({ meterNumber });
    if (existing) {
      return res.status(400).json({ message: "Meter already exists" });
    }

    const meter = await WaterMeter.create({
      meterNumber,
      location,
      pricePerUnit,
      assignedEmployee: null, // ✅ ALWAYS DEFINE FIELD
    });

    res.status(201).json({
      message: "Meter created successfully",
      meter,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ASSIGN / UNASSIGN METER (ADMIN)
===================================================== */
exports.assignMeter = async (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.body.assignedEmployee;

    const meter = await WaterMeter.findById(req.params.id);
    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }

    // ✅ UNASSIGN
    if (!employeeId) {
      meter.assignedEmployee = null;
      await meter.save();

      return res.json({
        message: "Meter unassigned",
        meter,
      });
    }

    // ✅ VALIDATE USER
    const user = await User.findById(employeeId);

    if (!user || !["employee", "admin"].includes(user.role)) {
      return res.status(404).json({ message: "User not allowed" });
    }

    // ✅ ASSIGN
    meter.assignedEmployee = user._id;
    await meter.save();

    const populated = await meter.populate(
      "assignedEmployee",
      "name email role"
    );

    res.json({
      message: "Meter assigned successfully",
      meter: populated,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   UPDATE PRICE (ADMIN)
===================================================== */
exports.updateMeterPrice = async (req, res) => {
  try {
    const { pricePerUnit } = req.body;

    if (pricePerUnit == null) {
      return res.status(400).json({
        message: "pricePerUnit is required",
      });
    }

    if (pricePerUnit < 0) {
      return res.status(400).json({
        message: "Price per unit cannot be negative",
      });
    }

    const meter = await WaterMeter.findById(req.params.id);
    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }

    meter.pricePerUnit = pricePerUnit;
    await meter.save();

    res.json({
      message: "Meter price updated successfully",
      meter,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET ALL METERS (ADMIN)
===================================================== */
exports.getAllMeters = async (req, res) => {
  try {
    const meters = await WaterMeter.find().populate(
      "assignedEmployee",
      "name email role"
    );

    res.json(meters);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET MY METERS (EMPLOYEE) 🔥 FIXED
===================================================== */
exports.getMyMeters = async (req, res) => {
  try {
    const meters = await WaterMeter.find({
      assignedEmployee: req.user.id,
    }).populate("assignedEmployee", "name email");

    res.json(meters);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};