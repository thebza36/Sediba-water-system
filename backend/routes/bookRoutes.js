const express = require("express");

const router = express.Router();

const {
  createBook,
  getBooks,
  markPaid,
  deleteBook
} = require("../controllers/bookController");

/* ==========================
   ROUTES
========================== */

router.get("/", getBooks);

router.post("/", createBook);

router.put("/:id/pay", markPaid);

router.delete("/:id", deleteBook);

module.exports = router;