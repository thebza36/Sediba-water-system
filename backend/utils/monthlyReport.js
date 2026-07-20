const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const WaterSale = require("../models/WaterSale");

const generateMonthlyReport = async () => {
  try {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const sales = await WaterSale.find({
      date: { $gte: start, $lte: end },
    })
      .populate("meter", "meterNumber location")
      .populate("employee", "name");

    if (!sales.length) {
      console.log("📭 No sales for last month — report skipped");
      return;
    }

    const reportsDir = path.join(__dirname, "../reports");

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const filename = `Monthly-Report-${start.getMonth()+1}-${start.getFullYear()}.pdf`;
    const filepath = path.join(reportsDir, filename);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filepath));

    doc.fontSize(20).text("Sediba Water Monthly Report", { align: "center" });
    doc.moveDown();

    let totalSold = 0;
    let totalRevenue = 0;

    sales.forEach((s) => {
      totalSold += s.totalSold || 0;
      totalRevenue += s.revenue || 0;

      doc
        .fontSize(12)
        .text(
          `${new Date(s.date).toLocaleDateString()} | Meter: ${
            s.meter?.meterNumber
          } | Employee: ${s.employee?.name} | Sold: ${
            s.totalSold
          } | Revenue: R${s.revenue}`
        );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Water Sold: ${totalSold} L`);
    doc.fontSize(14).text(`Total Revenue: R ${totalRevenue}`);

    doc.end();

    console.log("📄 Monthly report generated:", filename);
  } catch (err) {
    console.error("❌ Monthly report error:", err);
  }
};

module.exports = generateMonthlyReport;
