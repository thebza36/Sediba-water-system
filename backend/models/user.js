const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false // 🔥 IMPORTANT (security)
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    /* ================= ONLINE STATUS ================= */

    isOnline: {
      type: Boolean,
      default: false
    },

    lastSeen: {
      type: Date,
      default: null
    },

    /* ================= PROFILE ================= */

    avatar: {
      type: String,
      default: null
    }

  },
  {
    timestamps: true
  }
);

/* ================= INDEX (PERFORMANCE) ================= */
userSchema.index({ email: 1 });

/* ================= CLEAN JSON OUTPUT ================= */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // 🔥 NEVER expose password
  return obj;
};

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);