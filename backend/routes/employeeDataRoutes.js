const express = require("express");
const router = express.Router();

// TEMP DATA so dashboard works immediately

router.get("/sales", (req, res) => {
  res.json([
    {
      _id: "1",
      date: new Date(),
      totalSold: 1200,
      revenue: 540,
      meter: { meterNumber: "MTR-001" }
    }
  ]);
});

router.get("/meters", (req, res) => {
  res.json([
    { _id: "1", meterNumber: "MTR-001" },
    { _id: "2", meterNumber: "MTR-002" }
  ]);
});

module.exports = router;
