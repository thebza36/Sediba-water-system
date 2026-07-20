const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // ✅ attach user to request
      req.user = user;

      // ✅ UPDATE ONLINE STATUS AUTOMATICALLY
      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
        lastSeen: new Date()
      });

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};


// ✅ ADMIN ONLY
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};


// ✅ EMPLOYEE ONLY
exports.employeeOnly = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({ message: "Employee access only" });
  }
  next();
};