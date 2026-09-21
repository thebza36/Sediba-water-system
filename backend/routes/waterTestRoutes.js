const express = require("express");

const router = express.Router();

const {
  getMyWaterTests,
  getAllWaterTests,
  createWaterTest,
  getWaterTestById,
  deleteMyWaterTest,
  updateMyWaterTest,
  updateAdminWaterTest,
  deleteAdminWaterTest,
} = require("../controllers/waterTestController");

const {
  protect,
  employeeOnly,
  adminOnly,
} = require("../middleware/authMiddleware");

/* =====================================================
   EMPLOYEE ROUTES
===================================================== */

router.get(
  "/",
  protect,
  employeeOnly,
  getMyWaterTests
);

router.post(
  "/",
  protect,
  employeeOnly,
  createWaterTest
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllWaterTests
);

router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateAdminWaterTest
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteAdminWaterTest
);

/* =====================================================
   EMPLOYEE SINGLE TEST
===================================================== */

router.get(
  "/:id",
  protect,
  employeeOnly,
  getWaterTestById
);

router.put(
  "/:id",
  protect,
  employeeOnly,
  updateMyWaterTest
);

router.delete(
  "/:id",
  protect,
  employeeOnly,
  deleteMyWaterTest
);

module.exports = router;