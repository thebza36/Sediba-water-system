const Book = require("../models/Book");
const Product = require("../models/Product");

/* =====================================
   GENERATE DOCUMENT NUMBER
===================================== */

const generateDocumentNumber = async (type) => {

  const prefix =
    type === "quotation"
      ? "QT"
      : "INV";

  const year =
    new Date().getFullYear();

  const count =
    await Book.countDocuments({
      type
    });

  const number =
    String(count + 1)
      .padStart(5, "0");

  return `${prefix}-${year}-${number}`;
};

/* =====================================
   CREATE BOOK
===================================== */

exports.createBook = async (
  req,
  res
) => {

  try {

    const {
      type,
      customer,
      phone,
      address,
      deliveryAddress,
      items,
      vat = 0,
      discount = 0,
      notes,
      dueDate
    } = req.body;

    if (
      !type ||
      !customer ||
      !items ||
      items.length === 0
    ) {
      return res.status(400)
        .json({
          message:
            "Missing required fields"
        });
    }

    let subtotal = 0;

    const finalItems = [];

    for (const item of items) {

      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        return res.status(404)
          .json({
            message:
              "Product not found"
          });
      }

      const quantity =
        Number(item.quantity);

      const price =
        Number(product.price);

      /* STOCK CHECK */

      if (
        type === "invoice" &&
        product.stock < quantity
      ) {
        return res.status(400)
          .json({
            message:
              `${product.name} has insufficient stock`
          });
      }

      const total =
        quantity * price;

      subtotal += total;

      finalItems.push({
        product:
          product._id,
        name:
          product.name,
        size:
          product.size,
        category:
          product.category,
        quantity,
        price,
        total
      });

      /* DEDUCT STOCK */

      if (
        type === "invoice"
      ) {

        product.stock -= quantity;

        await product.save();

      }
    }

    const vatAmount =
      subtotal *
      (Number(vat) / 100);

    const discountAmount =
      subtotal *
      (Number(discount) / 100);

    const grandTotal =
      subtotal +
      vatAmount -
      discountAmount;

    const documentNumber =
      await generateDocumentNumber(
        type
      );

    const book =
      await Book.create({

        documentNumber,

        type,

        customer,

        phone,

        address,

        deliveryAddress,

        items:
          finalItems,

        subtotal,

        vat:
          Number(vat),

        discount:
          Number(discount),

        total:
          grandTotal,

        outstandingBalance:
          grandTotal,

        notes,

        dueDate,

        status:
          type === "quotation"
            ? "pending"
            : "approved"

      });

    res.status(201)
      .json(book);

  } catch (err) {

    console.error(err);

    res.status(500)
      .json({
        message:
          "Failed to create document"
      });

  }

};

/* =====================================
   GET BOOKS
===================================== */

exports.getBooks =
async (req, res) => {

  try {

    const books =
      await Book.find()
        .populate(
          "items.product"
        )
        .sort({
          createdAt: -1
        });

    res.json(books);

  } catch (err) {

    console.error(err);

    res.status(500)
      .json({
        message:
          "Failed to load books"
      });

  }

};

/* =====================================
   MARK AS PAID
===================================== */

exports.markPaid =
async (req, res) => {

  try {

    const book =
      await Book.findById(
        req.params.id
      );

    if (!book) {
      return res.status(404)
        .json({
          message:
            "Document not found"
        });
    }

    book.status = "paid";
    book.paidAmount =
      book.total;
    book.outstandingBalance = 0;

    await book.save();

    res.json(book);

  } catch (err) {

    console.error(err);

    res.status(500)
      .json({
        message:
          "Failed to update"
      });

  }

};

/* =====================================
   DELETE BOOK
===================================== */

exports.deleteBook =
async (req, res) => {

  try {

    await Book.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Deleted successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500)
      .json({
        message:
          "Failed to delete"
      });

  }

};