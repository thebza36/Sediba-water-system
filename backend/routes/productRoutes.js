const router = require("express").Router();
const Product = require("../models/Product");

/* =========================
   CREATE PRODUCT (ADMIN)
========================= */

router.post("/", async (req, res) => {
  try {
    const { name, size, price, category, stock } = req.body;

    const product = new Product({
      name,
      size,
      price,
      category,
      stock: stock || 0
    });

    await product.save();

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* =========================
   GET ALL PRODUCTS
========================= */

router.get("/", async (req, res) => {
  try {

    const products = await Product.find().sort({ category: 1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
});


/* =========================
   LOW STOCK ALERT
========================= */

router.get("/low-stock", async (req, res) => {

  try {

    const products = await Product.find({
      stock: { $lte: 10 }
    }).sort({ stock: 1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


/* =========================
   UPDATE PRODUCT PRICE
========================= */

router.put("/:id", async (req, res) => {

  try {

    const { price } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    );

    res.json(product);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


/* =========================
   ADD STOCK (MATCHES FRONTEND)
========================= */

router.put("/:id/stock", async (req, res) => {

  try {

    const { quantity } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.stock += Number(quantity);

    await product.save();

    res.json(product);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


/* =========================
   DELETE PRODUCT
========================= */

router.delete("/:id", async (req, res) => {

  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});

module.exports = router;