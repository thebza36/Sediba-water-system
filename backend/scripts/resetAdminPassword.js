require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = await User.findOne({ email: "admin@sediba.co.za" });

    if (!admin) {
      console.log("❌ Admin not found");
      process.exit(1);
    }

    admin.password = await bcrypt.hash("Admin123!", 10);
    admin.isActive = true;
    await admin.save();

    console.log("✅ Admin password reset successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAdminPassword();
