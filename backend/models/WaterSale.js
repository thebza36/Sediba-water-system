const mongoose = require("mongoose");

/* =====================================================
   SALE ITEMS
===================================================== */

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


/* =====================================================
   HELPER — CONVERT PRODUCT SIZE TO LITERS
===================================================== */

const getProductLiters = (product) => {
  if (!product) {
    return 0;
  }

  const category = String(product.category || "")
    .trim()
    .toLowerCase();

  const size = String(product.size || "")
    .trim()
    .toLowerCase();

  /*
    Only WATER and REFILL products
    contribute to total water volume.

    Ice and other products are NOT
    counted as liters.
  */

  if (category !== "water" && category !== "refill") {
    return 0;
  }

  if (!size) {
    return 0;
  }

  /*
    Supported examples:

    500ml
    500 ml
    500ML

    1L
    1 L

    1.5L
    1.5 L

    5L
    20L
    25L
  */

  const match = size.match(
    /^([\d]+(?:[.,][\d]+)?)\s*(ml|milliliters?|l|liters?|litres?)$/i
  );

  if (!match) {
    return 0;
  }

  const value = Number(
    String(match[1]).replace(",", ".")
  );

  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  const unit = match[2]
    .toLowerCase()
    .trim();

  /*
    Convert milliliters to liters.
  */

  if (
    unit === "ml" ||
    unit === "milliliter" ||
    unit === "milliliters"
  ) {
    return value / 1000;
  }

  /*
    Liters are already in liters.
  */

  if (
    unit === "l" ||
    unit === "liter" ||
    unit === "liters" ||
    unit === "litre" ||
    unit === "litres"
  ) {
    return value;
  }

  return 0;
};


/* =====================================================
   MAIN SALE
===================================================== */

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

    /* =================================================
       SALE MODE
    ================================================= */

    saleMode: {
      type: String,
      enum: ["meter", "pos", "client"],
      default: "pos"
    },

    /* =================================================
       DATE
    ================================================= */

    date: {
      type: Date,
      default: () => {
        const d = new Date();

        d.setHours(0, 0, 0, 0);

        return d;
      }
    },

    /* =================================================
       METER SALES
    ================================================= */

    openingReading: {
      type: Number,
      default: 0
    },

    closingReading: {
      type: Number,
      default: 0
    },

    totalSold: {
      type: Number,
      default: 0
    },

    /* =================================================
       OLD SALE TYPES
    ================================================= */

    saleType: {
      type: String,
      enum: ["refill", "bottle", "ice"],
      default: null
    },

    quantity: {
      type: Number,
      default: 0
    },

    /* =================================================
       REVENUE
    ================================================= */

    revenue: {
      type: Number,
      default: 0
    },

    /* =================================================
       POS ITEMS
    ================================================= */

    items: {
      type: [saleItemSchema],
      default: []
    },

    /* =================================================
       PAYMENT
    ================================================= */

    paymentMethod: {
      type: String,
      enum: ["cash", "speedpoint"],
      default: "cash"
    }
  },

  {
    timestamps: true
  }
);


/* =====================================================
   PRE-SAVE
===================================================== */

waterSaleSchema.pre("save", async function (next) {
  try {

    /*
      Only process POS item sales.

      Meter sales have no items, so their
      existing totalSold value remains untouched.
    */

    if (
      Array.isArray(this.items) &&
      this.items.length > 0 &&
      !this.meter
    ) {

      let totalLiters = 0;

      /*
        Process every POS item.
      */

      for (const item of this.items) {

        const qty =
          Number(item.quantity) || 0;

        const price =
          Number(item.price) || 0;

        /*
          Keep the existing item total logic.

          Example:

          2 bottles × R10 = R20
        */

        item.total = qty * price;


        /*
          Get the actual product from MongoDB.

          This is necessary because the sale item only
          stores the Product ObjectId, while the product
          size is stored in the Product collection.
        */

        let product = null;

        if (item.product) {
          product = await mongoose
            .model("Product")
            .findById(item.product)
            .select("size category")
            .lean();
        }


        /*
          Determine the number of liters in ONE unit.
        */

        const litersPerUnit =
          getProductLiters(product);


        /*
          Convert quantity into actual liters.

          Example:

          1 × 500ml
          = 1 × 0.5
          = 0.5L

          10 × 500ml
          = 10 × 0.5
          = 5L
        */

        totalLiters +=
          qty * litersPerUnit;
      }


      /*
        IMPORTANT:

        totalSold is now the actual WATER VOLUME,
        NOT the number of bottles/items.
      */

      this.totalSold = totalLiters;
    }


    if (typeof next === "function") {
      next();
    }

  } catch (error) {

    console.error(
      "PRE-SAVE ERROR:",
      error
    );

    if (typeof next === "function") {
      next(error);
    }
  }
});


/* =====================================================
   EXPORT
===================================================== */

module.exports =
  mongoose.models.WaterSale ||
  mongoose.model(
    "WaterSale",
    waterSaleSchema
  );