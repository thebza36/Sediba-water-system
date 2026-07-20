const express = require("express");
const {
  registerUser,
  loginUser,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin creates users
router.post("/register", protect, adminOnly, registerUser);

// Login
router.post("/login", loginUser);

module.exports = router;
