require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({}, "email role isActive");
    console.log("📋 USERS IN DATABASE:");
    users.forEach(u =>
      console.log(`- ${u.email} | role: ${u.role} | active: ${u.isActive}`)
    );

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

listUsers();
