const router = require("express").Router();
const Expense = require("../models/Expense");

/* ADD EXPENSE */

router.post("/", async (req, res) => {

  try {

    const expense = new Expense(req.body);

    await expense.save();

    res.json(expense);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


/* GET EXPENSES */

router.get("/", async (req, res) => {

  try {

    const expenses = await Expense.find().sort({ createdAt: -1 });

    res.json(expenses);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


/* DELETE */

router.delete("/:id", async (req, res) => {

  try {

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: "Expense deleted" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;