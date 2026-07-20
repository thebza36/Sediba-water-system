const express = require("express");

const {
  createMeter,
  assignMeter,
  getAllMeters,
  getMyMeters,
} = require("../controllers/meterController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================
   EMPLOYEE ROUTES
===================================== */

router.get(
  "/my",
  protect,
  getMyMeters
);

/* =====================================
   EVERY LOGGED IN USER CAN VIEW METERS
===================================== */

router.get(
  "/",
  protect,
  getAllMeters
);

/* =====================================
   ADMIN ONLY
===================================== */

router.post(
  "/",
  protect,
  adminOnly,
  createMeter
);

router.put(
  "/:id",
  protect,
  adminOnly,
  assignMeter
);

router.patch(
  "/:id/assign",
  protect,
  adminOnly,
  assignMeter
);

module.exports = router;