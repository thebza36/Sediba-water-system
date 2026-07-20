const express = require("express");

const {
  createDelivery,
  getMyDeliveries,
  updateDelivery,
  deleteDelivery,
  updateDeliveryStatus,
  getAllDeliveries,
} = require("../controllers/deliveryController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================
   EMPLOYEE ROUTES
===================================== */

// Create delivery
router.post("/", protect, createDelivery);

// Get my deliveries
router.get("/my", protect, getMyDeliveries);

// Edit delivery
router.put("/:id", protect, updateDelivery);

// Delete delivery
router.delete("/:id", protect, deleteDelivery);

// Update delivery status
router.put("/:id/status", protect, updateDeliveryStatus);

/* =====================================
   ADMIN ROUTES
===================================== */

// View all deliveries
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllDeliveries
);

module.exports = router;