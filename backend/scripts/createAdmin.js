require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // lowercase (matches your fix)

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    await User.create({
      name: "Business Owner",
      email: "admin@sediba.co.za",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
