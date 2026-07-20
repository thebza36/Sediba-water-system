const mongoose = require("mongoose");

/* ================= SALE ITEMS ================= */

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
});

/* ================= MAIN SALE ================= */

const waterSaleSchema = new mongoose.Schema(
  {
    meter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaterMeter",
      default: null
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* ✅ NEW (IMPORTANT) */
    saleMode: {
      type: String,
      enum: ["meter", "pos", "client"],
      default: "pos"
    },

    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      }
    },

    /* ======== METER SALES ======== */

    openingReading: { type: Number, default: 0 },
    closingReading: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },

    /* ======== OLD SALE TYPES ======== */

    saleType: {
      type: String,
      enum: ["refill", "bottle", "ice"],
      default: null
    },

    quantity: {
      type: Number,
      default: 0
    },

    /* ======== 💰 REVENUE ======== */

    revenue: {
      type: Number,
      default: 0
    },

    /* ======== POS ITEMS ======== */

    items: {
      type: [saleItemSchema],
      default: []
    },

    /* ======== PAYMENT ======== */

    paymentMethod: {
      type: String,
      enum: ["cash", "speedpoint"],
      default: "cash"
    }
  },
  { timestamps: true }
);

/* ================= PRE-SAVE ================= */

waterSaleSchema.pre("save", function (next) {
  try {
    if (Array.isArray(this.items) && this.items.length > 0) {
      let totalLiters = 0;

      this.items.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;

        item.total = qty * price;
        totalLiters += qty;
      });

      if (!this.meter) {
        this.totalSold = totalLiters;
      }
    }

    if (typeof next === "function") next();

  } catch (error) {
    console.error("PRE-SAVE ERROR:", error);
    if (typeof next === "function") next(error);
  }
});

/* ================= EXPORT ================= */

module.exports =
  mongoose.models.WaterSale ||
  mongoose.model("WaterSale", waterSaleSchema);