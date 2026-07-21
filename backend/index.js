require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

/* =========================
   🔹 IMPORT ROUTES
========================= */

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const employeesRoutes = require("./routes/employeesRoutes");
const meterRoutes = require("./routes/meterRoutes");
const waterSaleRoutes = require("./routes/waterSaleRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const clientRoutes = require("./routes/clientRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes"); // ✅ NEW
const employeeDataRoutes = require("./routes/employeeDataRoutes");
const reportRoutes = require("./routes/reportRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const salesHistoryRoutes = require("./routes/salesHistoryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const alertRoutes = require("./routes/alertRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const waterAccountingRoutes = require("./routes/waterAccountingRoutes");
const bookRoutes = require("./routes/bookRoutes");
const meterReadingRoutes = require("./routes/meterReadingRoutes");

const app = express();
const server = http.createServer(app);

/* =========================
   🔌 SOCKET.IO SETUP
========================= */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

/* =========================
   🔹 MIDDLEWARES
========================= */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sediba water API is running 🚀",
  });
});

/* =========================
   🔹 API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meters", meterRoutes);
app.use("/api/water-sales", waterSaleRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/clients", clientRoutes);
app.use("/api/deliveries", deliveryRoutes); // ✅ NEW DELIVERY ROUTES

app.use("/api", employeeDataRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/monthly-report", reportRoutes);

app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales-history", salesHistoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/water-accounting", waterAccountingRoutes);

app.use("/api/books", bookRoutes);
app.use("/api/readings", meterReadingRoutes);

/* ✅ PRODUCT ROUTES */

app.use("/api/products", productRoutes);

/* =========================
   🔹 CRON JOB
========================= */

require("./cron/reportCron");

/* =========================
   🔹 DATABASE + SERVER
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });