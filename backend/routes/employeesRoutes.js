const express = require("express");
const router = express.Router();

let employees = [];

router.get("/", (req, res) => {
  res.json(employees);
});

router.post("/", (req, res) => {
  const newEmployee = {
    _id: Date.now().toString(),
    ...req.body,
  };
  employees.push(newEmployee);
  res.json(newEmployee);
});

module.exports = router;
