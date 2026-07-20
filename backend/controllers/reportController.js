const PDFDocument = require("pdfkit");
const WaterSale = require("../models/WaterSale");

exports.generateSalesReport = async (req, res) => {
  try {
    const sales = await WaterSale.find()
      .populate("meter", "meterNumber location")
      .populate("employee", "name")
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=water-sales-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("Sediba Water Sales Report", { align: "center" });
    doc.moveDown();

    sales.forEach((sale, i) => {
      doc
        .fontSize(12)
        .text(
          `${i + 1}. Meter: ${sale.meter?.meterNumber || "N/A"} | Location: ${
            sale.meter?.location || "N/A"
          }`
        )
        .text(`Employee: ${sale.employee?.name || "N/A"}`)
        .text(`Sold: ${sale.totalSold} units`)
        .text(`Revenue: R${sale.revenue}`)
        .text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`)
        .moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
