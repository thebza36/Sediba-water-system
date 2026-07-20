const router = require("express").Router();
const Product = require("../models/Product");

/* GET INVENTORY */

router.get("/", async (req, res) => {
  try {

    const products = await Product.find().sort({ stock: 1 });

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* LOW STOCK */

router.get("/low", async (req, res) => {

  try {

    const products = await Product.find({
      stock: { $lte: 10 }
    });

    res.json(products);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


/* RESTOCK */

router.put("/restock/:id", async (req, res) => {

  try {

    const { quantity } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.stock += Number(quantity);

    await product.save();

    res.json(product);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;