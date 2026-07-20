const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const {
  createEmployee,
  getEmployees,
  disableEmployee,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const User = require("../models/user");

/* ===============================
   👤 ANY LOGGED-IN USER
================================*/

// Get my profile
router.get("/me", protect, getMyProfile);

// Update profile (name + avatar)
router.put(
  "/me",
  protect,
  upload.single("avatar"),
  updateMyProfile
);

/* ===============================
   🔐 CHANGE PASSWORD
================================*/

router.put("/change-password", protect, async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // compare passwords
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {

    res.status(500).json({ message: "Failed to change password" });

  }

});


/* ===============================
   👑 ADMIN ONLY ROUTES
================================*/

// Create employee
router.post("/", protect, adminOnly, createEmployee);

// Get all employees
router.get("/", protect, adminOnly, getEmployees);

// Disable employee
router.patch("/:id/disable", protect, adminOnly, disableEmployee);


module.exports = router;