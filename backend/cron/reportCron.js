const cron = require("node-cron");
const generateMonthlyReport = require("../utils/monthlyReport");

// Runs at midnight on the 1st of every month
cron.schedule("0 0 1 * *", () => {
  console.log("📆 Running monthly report job...");
  generateMonthlyReport();
});
