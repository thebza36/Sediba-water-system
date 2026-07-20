const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/user");

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "employee1@sediba.co.za";
    const newPassword = "Employee123!";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      console.log("❌ Employee not found");
      process.exit(1);
    }

    console.log("✅ Employee password reset successfully");
    process.exit(0);
  

  } catch (err) {
    console.error("❌ Error resetting password:", err);
    process.exit(1);
  }
}

resetPassword();
