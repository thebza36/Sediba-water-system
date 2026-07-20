const express = require("express");

const router = express.Router();

const {
  createMeterReading,
  getMeterReadings,
  deleteReading,
  updateReading,
  createTankRefill,
  getTankRefills,
  deleteTankRefill,
  updateTankRefill
} = require(
  "../controllers/meterReadingController"
);

const {
  protect
} = require(
  "../middleware/authMiddleware"
);

/* ==========================
   METER READINGS
========================== */

router.post(
  "/",
  protect,
  createMeterReading
);

router.get(
  "/",
  protect,
  getMeterReadings
);

router.delete(
  "/:id",
  protect,
  deleteReading
);

router.put(
  "/:id",
  protect,
  updateReading
);

/* ==========================
   TANK REFILLS
========================== */

router.post(
  "/refills",
  protect,
  createTankRefill
);

router.get(
  "/refills",
  protect,
  getTankRefills
);

router.delete(
  "/refills/:id",
  protect,
  deleteTankRefill
);

router.put(
  "/refills/:id",
  protect,
  updateTankRefill
);

module.exports = router;