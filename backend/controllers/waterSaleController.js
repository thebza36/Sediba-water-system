const WaterSale = require("../models/WaterSale");
const WaterMeter = require("../models/WaterMeter");
const Product = require("../models/Product");


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
    Only WATER and REFILL products contribute
    to the total liters sold.

    Ice and other products do NOT count as liters.
  */

  if (
    category !== "water" &&
    category !== "refill"
  ) {
    return 0;
  }

  if (!size) {
    return 0;
  }

  /*
    Supported formats:

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
    Milliliters → Liters
  */

  if (
    unit === "ml" ||
    unit === "milliliter" ||
    unit === "milliliters"
  ) {
    return value / 1000;
  }

  /*
    Liters remain Liters
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
   EMPLOYEE CREATES METER SALE
===================================================== */

const createDailySale = async (req, res) => {
  try {
    const meterId =
      req.body.meterId ||
      req.body.meter;

    const {
      openingReading,
      closingReading
    } = req.body;

    console.log(
      "Incoming body:",
      req.body
    );

    /* =================================================
       CHECK ACCOUNT
    ================================================= */

    if (!req.user.isActive) {
      return res.status(403).json({
        message: "Account disabled"
      });
    }

    /* =================================================
       CHECK METER
    ================================================= */

    if (!meterId) {
      return res.status(400).json({
        message: "Meter ID is required"
      });
    }

    const meter =
      await WaterMeter.findById(meterId);

    if (
      !meter ||
      !meter.isActive
    ) {
      return res.status(404).json({
        message: "Meter not found"
      });
    }

    /* =================================================
       READINGS
    ================================================= */

    const open =
      Number(openingReading);

    const close =
      Number(closingReading);

    if (
      isNaN(open) ||
      isNaN(close) ||
      close < open
    ) {
      return res.status(400).json({
        message: "Invalid readings"
      });
    }

    /* =================================================
       CALCULATE METER SALE
    ================================================= */

    const totalSold =
      close - open;

    const price =
      Number(
        meter.pricePerUnit || 0
      );

    const revenue =
      totalSold * price;

    /* =================================================
       CREATE SALE
    ================================================= */

    const sale =
      await WaterSale.create({
        meter: meter._id,
        employee: req.user.id,
        openingReading: open,
        closingReading: close,
        totalSold,
        revenue,
        saleMode: "meter"
      });

    res.status(201).json({
      message: "✅ Sale recorded",
      sale
    });

  } catch (err) {
    console.error(
      "CREATE SALE ERROR:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* =====================================================
   POS SALE
   CORRECT PRODUCT VOLUME CALCULATION
   AND INVENTORY DEDUCTION
===================================================== */

const createPOSSale = async (req, res) => {
  try {
    const {
      items,
      paymentMethod
    } = req.body;

    /* =================================================
       VALIDATE ITEMS
    ================================================= */

    if (
      !items ||
      !items.length
    ) {
      return res.status(400).json({
        message: "No items provided"
      });
    }

    let totalRevenue = 0;

    /*
      IMPORTANT:

      totalLiters stores ACTUAL WATER VOLUME,
      not the number of bottles.
    */

    let totalLiters = 0;

    const formattedItems = [];

    /*
      Keep track of inventory that has been
      deducted during this sale.

      If something goes wrong later, we can
      restore the deducted stock.
    */

    const deductedStock = [];

    /* =================================================
       PROCESS EACH PRODUCT
    ================================================= */

    for (const item of items) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        /*
          Restore anything already deducted
          before returning the error.
        */

        for (const deducted of deductedStock) {
          await Product.findByIdAndUpdate(
            deducted.productId,
            {
              $inc: {
                stock: deducted.quantity
              }
            }
          );
        }

        return res.status(404).json({
          message: "Product not found"
        });
      }

      /* =================================================
         QUANTITY
      ================================================= */

      const qty =
        Number(item.quantity) || 0;

      if (
        !Number.isFinite(qty) ||
        qty <= 0
      ) {
        for (const deducted of deductedStock) {
          await Product.findByIdAndUpdate(
            deducted.productId,
            {
              $inc: {
                stock: deducted.quantity
              }
            }
          );
        }

        return res.status(400).json({
          message: "Invalid product quantity"
        });
      }

      /* =================================================
         CHECK STOCK
      ================================================= */

      const currentStock =
        Number(product.stock) || 0;

      if (currentStock < qty) {
        /*
          Restore any products that were already
          deducted in this sale.
        */

        for (const deducted of deductedStock) {
          await Product.findByIdAndUpdate(
            deducted.productId,
            {
              $inc: {
                stock: deducted.quantity
              }
            }
          );
        }

        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}. Available stock: ${currentStock}`
        });
      }

      /* =================================================
         PRICE
      ================================================= */

      const price =
        Number(product.price) || 0;

      /* =================================================
         ITEM TOTAL
      ================================================= */

      const total =
        qty * price;

      /* =================================================
         PRODUCT VOLUME
      ================================================= */

      const litersPerUnit =
        getProductLiters(product);

      /*
        Example:

        Product = 500ml
        Quantity = 1

        litersPerUnit = 0.5

        itemLiters = 1 × 0.5

        itemLiters = 0.5L
      */

      const itemLiters =
        qty * litersPerUnit;

      /* =================================================
         ADD TOTALS
      ================================================= */

      totalRevenue += total;

      totalLiters += itemLiters;

      /* =================================================
         DEDUCT INVENTORY
      ================================================= */

      /*
        Use an atomic stock update.

        This makes sure stock cannot go below zero
        even if another sale happens at the same time.
      */

      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: product._id,
            stock: {
              $gte: qty
            }
          },
          {
            $inc: {
              stock: -qty
            }
          },
          {
            new: true
          }
        );

      if (!updatedProduct) {
        /*
          Another sale may have used the stock
          between our initial check and this update.

          Restore anything already deducted.
        */

        for (const deducted of deductedStock) {
          await Product.findByIdAndUpdate(
            deducted.productId,
            {
              $inc: {
                stock: deducted.quantity
              }
            }
          );
        }

        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}`
        });
      }

      /*
        Remember this deduction so that it can
        be restored if a later item fails.
      */

      deductedStock.push({
        productId: product._id,
        quantity: qty
      });

      /* =================================================
         STORE ITEM
      ================================================= */

      formattedItems.push({
        product: product._id,
        quantity: qty,
        price,
        total
      });
    }

    /* =================================================
       CREATE POS SALE
    ================================================= */

    try {
      const sale =
        await WaterSale.create({
          employee: req.user.id,
          items: formattedItems,
          paymentMethod:
            paymentMethod || "cash",
          revenue:
            totalRevenue,
          /*
            Actual water volume.
          */
          totalSold:
            totalLiters,
          saleMode:
            "pos"
        });

      res.status(201).json({
        message:
          "✅ POS sale completed",
        sale
      });

    } catch (saleError) {
      /*
        If creating the sale fails after stock
        was already deducted, restore all stock.
      */

      for (const deducted of deductedStock) {
        await Product.findByIdAndUpdate(
          deducted.productId,
          {
            $inc: {
              stock: deducted.quantity
            }
          }
        );
      }

      throw saleError;
    }

  } catch (error) {
    console.error(
      "POS ERROR:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* =====================================================
   GET ALL SALES
===================================================== */

const getAllSales = async (req, res) => {
  try {
    const sales =
      await WaterSale.find()
        .populate(
          "meter",
          "meterNumber location pricePerUnit"
        )
        .populate(
          "employee",
          "name email"
        )
        .populate(
          "items.product",
          "name size category"
        )
        .sort({
          createdAt: -1
        });

    res.json(sales);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* =====================================================
   EMPLOYEE STATS
===================================================== */

const getMyStats = async (req, res) => {
  try {
    const sales =
      await WaterSale.find({
        employee: req.user.id
      });

    const monthRevenue =
      sales.reduce(
        (sum, s) =>
          sum +
          (Number(s.revenue) || 0),
        0
      );

    const monthTotalSold =
      sales.reduce(
        (sum, s) =>
          sum +
          (Number(s.totalSold) || 0),
        0
      );

    res.json({
      monthTotalSold,
      monthRevenue,
      totalSubmissionsThisMonth:
        sales.length
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* =====================================================
   ADMIN STATS
===================================================== */

const getAdminStats = async (req, res) => {
  try {
    const sales =
      await WaterSale.find();

    const monthRevenue =
      sales.reduce(
        (sum, s) =>
          sum +
          (Number(s.revenue) || 0),
        0
      );

    const totalSold =
      sales.reduce(
        (sum, s) =>
          sum +
          (Number(s.totalSold) || 0),
        0
      );

    res.json({
      monthTotalSold:
        totalSold,
      monthRevenue,
      todayRevenue:
        monthRevenue,
      totalSalesThisMonth:
        sales.length
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* =====================================================
   TOP EMPLOYEES
===================================================== */

const getTopEmployees = async (req, res) => {
  try {
    const ranking =
      await WaterSale.aggregate([

        /* =============================================
           GROUP SALES BY EMPLOYEE
        ============================================= */

        {
          $group: {
            _id: "$employee",
            totalRevenue: {
              $sum: {
                $ifNull: [
                  "$revenue",
                  0
                ]
              }
            },
            totalSold: {
              $sum: {
                $ifNull: [
                  "$totalSold",
                  0
                ]
              }
            }
          }
        },

        /* =============================================
           SORT BY REVENUE
        ============================================= */

        {
          $sort: {
            totalRevenue: -1
          }
        },

        /* =============================================
           RANK EMPLOYEES
        ============================================= */

        {
          $setWindowFields: {
            sortBy: {
              totalRevenue: -1
            },
            output: {
              rank: {
                $rank: {}
              }
            }
          }
        },

        /* =============================================
           GET USER INFORMATION
        ============================================= */

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
          }
        },

        {
          $unwind: "$user"
        },

        /* =============================================
           FINAL RESPONSE
        ============================================= */

        {
          $project: {
            _id: 1,
            name:
              "$user.name",
            email:
              "$user.email",
            totalRevenue: {
              $ifNull: [
                "$totalRevenue",
                0
              ]
            },
            totalSold: {
              $ifNull: [
                "$totalSold",
                0
              ]
            },
            rank: 1
          }
        }

      ]);

    res.json(ranking);

  } catch (err) {
    console.error(
      "TOP EMPLOYEES ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to get ranking"
    });
  }
};


/* =====================================================
   RESTORE REVENUE
===================================================== */

const restoreRevenue = async (req, res) => {
  try {
    const sales =
      await WaterSale.find()
        .populate("meter");

    let updated = 0;

    for (const sale of sales) {
      const price =
        sale.meter?.pricePerUnit || 0;

      if (
        sale.totalSold &&
        price > 0
      ) {
        sale.revenue =
          sale.totalSold * price;

        await sale.save();

        updated++;
      }
    }

    res.json({
      message:
        "✅ Revenue restored",
      updated
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Fix failed"
    });
  }
};


/* =====================================================
   RESTORE LITERS
   CORRECT OLD POS SALES
===================================================== */

const restoreLiters = async (req, res) => {
  try {
    /*
      Only POS sales are processed.

      Meter sales are left completely untouched.
    */

    const sales =
      await WaterSale.find({
        saleMode: "pos"
      })
        .populate(
          "items.product",
          "name size category"
        );

    let updated = 0;

    let skipped = 0;

    /* =================================================
       PROCESS OLD POS SALES
    ================================================= */

    for (const sale of sales) {
      if (
        !Array.isArray(sale.items) ||
        sale.items.length === 0
      ) {
        skipped++;
        continue;
      }

      let totalLiters = 0;

      let recognizedVolume =
        false;

      /* =================================================
         PROCESS EACH ITEM
      ================================================= */

      for (const item of sale.items) {
        const product =
          item.product;

        const quantity =
          Number(item.quantity) || 0;

        /*
          Determine actual volume
          of one product.
        */

        const litersPerUnit =
          getProductLiters(product);

        /*
          Only mark the sale as having
          recognised volume when the product
          has a valid water/refill size.
        */

        if (
          litersPerUnit > 0
        ) {
          recognizedVolume = true;

          totalLiters +=
            quantity *
            litersPerUnit;
        }
      }

      /*
        Do not overwrite a sale with zero
        if its product size is unknown.

        This protects historical data.
      */

      if (
        !recognizedVolume
      ) {
        skipped++;
        continue;
      }

      /*
        Save the corrected actual volume.
      */

      sale.totalSold =
        totalLiters;

      await sale.save();

      updated++;
    }

    res.json({
      message:
        "✅ Liters restored using product sizes",
      updated,
      skipped
    });

  } catch (err) {
    console.error(
      "RESTORE LITERS ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to restore liters"
    });
  }
};


/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  createDailySale,
  createPOSSale,
  getAllSales,
  getMyStats,
  getAdminStats,
  getTopEmployees,
  restoreRevenue,
  restoreLiters
};