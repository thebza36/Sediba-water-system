const User = require("../models/user");
const bcrypt = require("bcryptjs");


/* =====================================================
   🔹 ADMIN CREATES EMPLOYEE
===================================================== */
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   🔹 ADMIN LISTS EMPLOYEES
===================================================== */
exports.getEmployees = async (req, res) => {
  try {

    const users = await User
      .find()
      .select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   🔹 ADMIN DISABLES EMPLOYEE
===================================================== */
exports.disableEmployee = async (req, res) => {
  try {

    // prevent admin disabling themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot disable yourself" });
    }

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isOnline: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee disabled successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   🔹 GET LOGGED-IN USER PROFILE
===================================================== */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   🔹 UPDATE MY PROFILE (NAME + AVATAR)
===================================================== */
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update name
    if (req.body.name) {
      user.name = req.body.name;
    }

    // update avatar if uploaded
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile update failed" });
  }

  console.log("BODY:", req.body);
console.log("FILE:", req.file);
};