const router = require("express").Router();
const Expense = require("../models/Expense");

/* =====================================================
   ADD EXPENSE
===================================================== */

router.post("/", async (req, res) => {
  try {
    const expense = new Expense({
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
    });

    await expense.save();

    res.json(expense);
  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


/* =====================================================
   GET EXPENSES
===================================================== */

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({
      createdAt: -1,
    });

    res.json(expenses);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


/* =====================================================
   UPDATE EXPENSE
===================================================== */

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { title, amount, category } = req.body;

    /* -----------------------------------------------
       BASIC VALIDATION
    ------------------------------------------------ */

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        error: "Expense title is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      Number.isNaN(Number(amount))
    ) {
      return res.status(400).json({
        error: "Valid expense amount is required",
      });
    }

    /* -----------------------------------------------
       UPDATE ONLY EDITABLE FIELDS
    ------------------------------------------------ */

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        title: String(title).trim(),
        amount: Number(amount),
        category: category || "General",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    /* -----------------------------------------------
       EXPENSE NOT FOUND
    ------------------------------------------------ */

    if (!updatedExpense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    /* -----------------------------------------------
       SUCCESS
    ------------------------------------------------ */

    res.json(updatedExpense);

  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


/* =====================================================
   DELETE EXPENSE
===================================================== */

router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(
      req.params.id
    );

    if (!deletedExpense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    res.json({
      message: "Expense deleted",
    });

  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;