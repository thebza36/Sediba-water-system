const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { generateSalesReport } = require("../controllers/reportController");

// 🔹 Manual PDF report (existing route)
router.get("/sales-pdf", generateSalesReport);


// 🔹 Download latest automatic monthly report
router.get("/monthly/latest", (req, res) => {
  try {
    const reportsDir = path.join(__dirname, "../reports");

    if (!fs.existsSync(reportsDir)) {
      return res.status(404).json({ message: "No reports folder found yet" });
    }

    const files = fs
      .readdirSync(reportsDir)
      .filter((f) => f.endsWith(".pdf"));

    if (!files.length) {
      return res.status(404).json({ message: "No monthly reports available yet" });
    }

    // Sort newest first
    const latestFile = files.sort().reverse()[0];

    const filePath = path.join(reportsDir, latestFile);

    res.download(filePath);
  } catch (err) {
    console.error("❌ Download monthly report error:", err);
    res.status(500).json({ message: "Error downloading report" });
  }
});

module.exports = router;
