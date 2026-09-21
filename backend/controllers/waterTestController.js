const WaterTest = require("../models/WaterTest");

/* =========================================================
   HELPER - NORMALIZE STATUS
========================================================= */

const normalizeStatus = (status) => {
  if (!status) return "PASS";

  const normalized = String(status).trim().toUpperCase();

  if (normalized === "PASS") return "PASS";
  if (normalized === "FAIL") return "FAIL";

  return null;
};

/* =========================================================
   GET MY WATER TESTS
   Employee sees only their own tests
========================================================= */

exports.getMyWaterTests = async (req, res) => {
  try {
    const tests = await WaterTest.find({
      employee: req.user._id,
    }).sort({
      testDate: -1,
      createdAt: -1,
    });

    res.status(200).json(tests);
  } catch (error) {
    console.error("GET MY WATER TESTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load water tests",
      error: error.message,
    });
  }
};

/* =========================================================
   GET ALL WATER TESTS
   Admin only
========================================================= */

exports.getAllWaterTests = async (req, res) => {
  try {
    const tests = await WaterTest.find()
      .populate("employee", "name email")
      .sort({
        testDate: -1,
        createdAt: -1,
      });

    res.status(200).json(tests);
  } catch (error) {
    console.error("GET ALL WATER TESTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load water tests",
      error: error.message,
    });
  }
};

/* =========================================================
   CREATE WATER TEST
   Employee creates their own water test
========================================================= */

exports.createWaterTest = async (req, res) => {
  try {
    const {
      testDate,
      ph,
      chlorine,
      temperature,
      turbidity,
      tds,
      status,
      notes,
    } = req.body;

    /* -----------------------------------------
       REQUIRED FIELD CHECK
    ----------------------------------------- */

    if (!testDate) {
      return res.status(400).json({
        message: "Test date is required",
      });
    }

    if (
      ph === undefined ||
      chlorine === undefined ||
      temperature === undefined ||
      turbidity === undefined ||
      tds === undefined
    ) {
      return res.status(400).json({
        message: "All water quality measurements are required",
      });
    }

    /* -----------------------------------------
       STATUS
    ----------------------------------------- */

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      return res.status(400).json({
        message: "Status must be PASS or FAIL",
      });
    }

    /* -----------------------------------------
       NUMERIC VALIDATION
    ----------------------------------------- */

    const numericValues = {
      ph: Number(ph),
      chlorine: Number(chlorine),
      temperature: Number(temperature),
      turbidity: Number(turbidity),
      tds: Number(tds),
    };

    if (
      !Number.isFinite(numericValues.ph) ||
      !Number.isFinite(numericValues.chlorine) ||
      !Number.isFinite(numericValues.temperature) ||
      !Number.isFinite(numericValues.turbidity) ||
      !Number.isFinite(numericValues.tds)
    ) {
      return res.status(400).json({
        message: "Water quality measurements must be valid numbers",
      });
    }

    /* -----------------------------------------
       EMPLOYEE NAME
    ----------------------------------------- */

    const employeeName =
      req.user.name ||
      req.user.fullName ||
      req.user.username ||
      "Employee";

    /* -----------------------------------------
       CREATE
    ----------------------------------------- */

    const waterTest = await WaterTest.create({
      employee: req.user._id,
      employeeName,

      testDate: new Date(testDate),

      ph: numericValues.ph,
      chlorine: numericValues.chlorine,
      temperature: numericValues.temperature,
      turbidity: numericValues.turbidity,
      tds: numericValues.tds,

      status: normalizedStatus,

      notes: notes ? String(notes).trim() : "",
    });

    res.status(201).json({
      message: "Water test created successfully",
      test: waterTest,
    });
  } catch (error) {
    console.error("CREATE WATER TEST ERROR:", error);

    res.status(500).json({
      message: "Failed to create water test",
      error: error.message,
    });
  }
};

/* =========================================================
   GET WATER TEST BY ID
   Employee can only access their own test
========================================================= */

exports.getWaterTestById = async (req, res) => {
  try {
    const test = await WaterTest.findOne({
      _id: req.params.id,
      employee: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        message: "Water test not found",
      });
    }

    res.status(200).json(test);
  } catch (error) {
    console.error("GET WATER TEST BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to load water test",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE MY WATER TEST
   Employee can edit only their own test
========================================================= */

exports.updateMyWaterTest = async (req, res) => {
  try {
    const {
      testDate,
      ph,
      chlorine,
      temperature,
      turbidity,
      tds,
      status,
      notes,
    } = req.body;

    /* -----------------------------------------
       FIND ONLY THIS EMPLOYEE'S TEST
    ----------------------------------------- */

    const test = await WaterTest.findOne({
      _id: req.params.id,
      employee: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        message:
          "Water test not found or you do not have permission to edit it",
      });
    }

    /* -----------------------------------------
       REQUIRED FIELD CHECK
    ----------------------------------------- */

    if (!testDate) {
      return res.status(400).json({
        message: "Test date is required",
      });
    }

    if (
      ph === undefined ||
      chlorine === undefined ||
      temperature === undefined ||
      turbidity === undefined ||
      tds === undefined
    ) {
      return res.status(400).json({
        message: "All water quality measurements are required",
      });
    }

    /* -----------------------------------------
       STATUS
    ----------------------------------------- */

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      return res.status(400).json({
        message: "Status must be PASS or FAIL",
      });
    }

    /* -----------------------------------------
       NUMERIC VALUES
    ----------------------------------------- */

    const numericValues = {
      ph: Number(ph),
      chlorine: Number(chlorine),
      temperature: Number(temperature),
      turbidity: Number(turbidity),
      tds: Number(tds),
    };

    if (
      !Number.isFinite(numericValues.ph) ||
      !Number.isFinite(numericValues.chlorine) ||
      !Number.isFinite(numericValues.temperature) ||
      !Number.isFinite(numericValues.turbidity) ||
      !Number.isFinite(numericValues.tds)
    ) {
      return res.status(400).json({
        message: "Water quality measurements must be valid numbers",
      });
    }

    /* -----------------------------------------
       UPDATE
    ----------------------------------------- */

    test.testDate = new Date(testDate);

    test.ph = numericValues.ph;
    test.chlorine = numericValues.chlorine;
    test.temperature = numericValues.temperature;
    test.turbidity = numericValues.turbidity;
    test.tds = numericValues.tds;

    test.status = normalizedStatus;

    test.notes = notes ? String(notes).trim() : "";

    await test.save();

    res.status(200).json({
      message: "Water test updated successfully",
      test,
    });
  } catch (error) {
    console.error("UPDATE WATER TEST ERROR:", error);

    res.status(500).json({
      message: "Failed to update water test",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE MY WATER TEST
   Employee can delete only their own test
========================================================= */

exports.deleteMyWaterTest = async (req, res) => {
  try {
    const test = await WaterTest.findOne({
      _id: req.params.id,
      employee: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        message:
          "Water test not found or you do not have permission to delete it",
      });
    }

    await WaterTest.findByIdAndDelete(test._id);

    res.status(200).json({
      message: "Water test deleted successfully",
    });
  } catch (error) {
    console.error("DELETE WATER TEST ERROR:", error);

    res.status(500).json({
      message: "Failed to delete water test",
      error: error.message,
    });
  }
};

/* =========================================================
   UPDATE ADMIN WATER TEST
   Admin can edit any employee's water test
========================================================= */

exports.updateAdminWaterTest = async (req, res) => {
  try {
    const {
      testDate,
      ph,
      chlorine,
      temperature,
      turbidity,
      tds,
      status,
      notes,
    } = req.body;

    /* -----------------------------------------
       FIND ANY WATER TEST
       Admin is allowed to edit any employee's test
    ----------------------------------------- */

    const test = await WaterTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        message: "Water test not found",
      });
    }

    /* -----------------------------------------
       REQUIRED FIELD CHECK
    ----------------------------------------- */

    if (!testDate) {
      return res.status(400).json({
        message: "Test date is required",
      });
    }

    if (
      ph === undefined ||
      chlorine === undefined ||
      temperature === undefined ||
      turbidity === undefined ||
      tds === undefined
    ) {
      return res.status(400).json({
        message: "All water quality measurements are required",
      });
    }

    /* -----------------------------------------
       STATUS
    ----------------------------------------- */

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      return res.status(400).json({
        message: "Status must be PASS or FAIL",
      });
    }

    /* -----------------------------------------
       NUMERIC VALIDATION
    ----------------------------------------- */

    const numericValues = {
      ph: Number(ph),
      chlorine: Number(chlorine),
      temperature: Number(temperature),
      turbidity: Number(turbidity),
      tds: Number(tds),
    };

    if (
      !Number.isFinite(numericValues.ph) ||
      !Number.isFinite(numericValues.chlorine) ||
      !Number.isFinite(numericValues.temperature) ||
      !Number.isFinite(numericValues.turbidity) ||
      !Number.isFinite(numericValues.tds)
    ) {
      return res.status(400).json({
        message: "Water quality measurements must be valid numbers",
      });
    }

    /* -----------------------------------------
       UPDATE
    ----------------------------------------- */

    test.testDate = new Date(testDate);

    test.ph = numericValues.ph;
    test.chlorine = numericValues.chlorine;
    test.temperature = numericValues.temperature;
    test.turbidity = numericValues.turbidity;
    test.tds = numericValues.tds;

    test.status = normalizedStatus;

    test.notes = notes ? String(notes).trim() : "";

    await test.save();

    /* -----------------------------------------
       RETURN UPDATED TEST
       Include employee information for admin
    ----------------------------------------- */

    const updatedTest = await WaterTest.findById(test._id)
      .populate("employee", "name email");

    res.status(200).json({
      message: "Water test updated successfully",
      test: updatedTest,
    });
  } catch (error) {
    console.error("UPDATE ADMIN WATER TEST ERROR:", error);

    res.status(500).json({
      message: "Failed to update water test",
      error: error.message,
    });
  }
};

/* =========================================================
   DELETE ADMIN WATER TEST
   Admin can delete any employee's water test
========================================================= */

exports.deleteAdminWaterTest = async (req, res) => {
  try {
    /* -----------------------------------------
       FIND ANY WATER TEST
       Admin is allowed to delete any test
    ----------------------------------------- */

    const test = await WaterTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        message: "Water test not found",
      });
    }

    /* -----------------------------------------
       DELETE
    ----------------------------------------- */

    await WaterTest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Water test deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADMIN WATER TEST ERROR:", error);

    res.status(500).json({
      message: "Failed to delete water test",
      error: error.message,
    });
  }
};