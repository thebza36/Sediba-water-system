const Product = require("../models/Product");

/* ADD PRODUCT */

exports.createProduct = async (req, res) => {

  try {

    const { name, category, size, price, stock } = req.body;

    const product = new Product({
      name,
      category,
      size,
      price,
      stock: stock || 0
    });

    await product.save();

    res.json(product);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* GET ALL PRODUCTS */

exports.getProducts = async (req, res) => {

  try {

    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* UPDATE PRICE */

exports.updatePrice = async (req, res) => {

  try {

    const { price } = req.body;

    if (price === undefined)
      return res.status(400).json({ message: "Price is required" });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* UPDATE STOCK */

exports.updateStock = async (req, res) => {

  try {

    const { stock } = req.body;

    if (stock === undefined)
      return res.status(400).json({ message: "Stock value required" });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* UPDATE PRICE + STOCK TOGETHER (ADMIN CONTROL) */

exports.updateProduct = async (req, res) => {

  try {

    const { price, stock } = req.body;

    const updateData = {};

    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* DELETE PRODUCT */

exports.deleteProduct = async (req, res) => {

  try {

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

/* LOW STOCK ALERT */

exports.getLowStock = async (req, res) => {

  try {

    const products = await Product.find({
      stock: { $lte: 10 }   // threshold
    }).sort({ stock: 1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};