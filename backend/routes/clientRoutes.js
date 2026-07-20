const express = require("express");
const router = express.Router();

const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  assignMeter,
  getClientProfile,
  recordPayment,   // ✅ ADD THIS LINE
} = require("../controllers/clientController");

router.get("/", getClients);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.post("/:id/assign-meter", assignMeter);
router.get("/:id/profile", getClientProfile);

// ✅ FIXED ROUTE
router.post("/:id/payment", recordPayment);

module.exports = router;
  