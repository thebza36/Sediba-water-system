const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    /* =========================
       CUSTOMER DETAILS
    ========================= */

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      required: true,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    /* =========================
       EMPLOYEE
    ========================= */

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =========================
       DELIVERY DETAILS
    ========================= */

    waterQuantity: {
      type: Number,
      required: true,
      default: 0,
    },

    deliveryCost: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "On Route",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    acceptedAt: Date,
    startedAt: Date,
    deliveredAt: Date,

    notes: {
      type: String,
      default: "",
    },

    deliveryNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================
   AUTO GENERATE DELIVERY NUMBER
===================================== */

deliverySchema.pre("save", async function () {
  if (!this.deliveryNumber) {
    const count = await mongoose.model("Delivery").countDocuments();

    this.deliveryNumber =
      "DEL-" + String(count + 1).padStart(5, "0");
  }
});

module.exports =
  mongoose.models.Delivery ||
  mongoose.model("Delivery", deliverySchema);