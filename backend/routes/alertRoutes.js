const router = require("express").Router();
const Product = require("../models/Product");

/* LOW STOCK ALERTS */

router.get("/", async (req, res) => {

  try {

    const alerts = await Product.find({
      stock: { $lte: 5 }
    });

    res.json(alerts);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;