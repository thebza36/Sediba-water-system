import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SalesAnalytics = ({ sales = [] }) => {

  const [filter, setFilter] = useState("all");


  /* ===== DATE FILTER ===== */

  const filteredSales = sales.filter((sale) => {

    if (filter === "all") return true;

    const saleDate = new Date(sale.date);
    const today = new Date();

    if (filter === "today") {
      return saleDate.toDateString() === today.toDateString();
    }

    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return saleDate >= weekAgo;
    }

    if (filter === "month") {
      return (
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    }

    return true;

  });


  /* ===== SUMMARY ===== */

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + (sale.revenue || 0),
    0
  );

  const totalLitres = filteredSales.reduce(
    (sum, sale) => sum + (sale.totalSold || 0),
    0
  );

  const totalTransactions = filteredSales.length;


  /* ===== GROUP BY DATE ===== */

  const grouped = {};

  filteredSales.forEach((sale) => {

    const date = new Date(sale.date).toLocaleDateString();

    if (!grouped[date]) {
      grouped[date] = { litres: 0, revenue: 0 };
    }

    grouped[date].litres += sale.totalSold || 0;
    grouped[date].revenue += sale.revenue || 0;

  });


  const labels = Object.keys(grouped);

  const litresData = labels.map((d) => grouped[d].litres);
  const revenueData = labels.map((d) => grouped[d].revenue);


  const litresChart = {
    labels,
    datasets: [
      {
        label: "Litres Sold",
        data: litresData,
        backgroundColor: "#3b82f6",
      },
    ],
  };


  const revenueChart = {
    labels,
    datasets: [
      {
        label: "Revenue (ZAR)",
        data: revenueData,
        backgroundColor: "#1e3a8a",
      },
    ],
  };


  /* ===== SALES PER METER ===== */

  const meterMap = {};

  filteredSales.forEach((sale) => {

    const meter = sale.meter?.meterNumber || "Unknown";

    if (!meterMap[meter]) {
      meterMap[meter] = 0;
    }

    meterMap[meter] += sale.totalSold || 0;

  });


  const meterChart = {
    labels: Object.keys(meterMap),
    datasets: [
      {
        label: "Litres Per Meter",
        data: Object.values(meterMap),
        backgroundColor: "#2563eb",
      },
    ],
  };


  return (
    <div style={{ padding: 20 }}>

      <h2 style={{ marginBottom: 20 }}>📊 Sales Analytics</h2>


      {/* FILTER */}

      <div style={filterContainer}>

        <button onClick={() => setFilter("today")} style={btn}>Today</button>
        <button onClick={() => setFilter("week")} style={btn}>Week</button>
        <button onClick={() => setFilter("month")} style={btn}>Month</button>
        <button onClick={() => setFilter("all")} style={btn}>All</button>

      </div>


      {/* SUMMARY */}

      <div style={stats}>

        <div style={card}>
          <h4>Total Litres</h4>
          <p>{totalLitres}</p>
        </div>

        <div style={card}>
          <h4>Total Revenue</h4>
          <p>R {totalRevenue}</p>
        </div>

        <div style={card}>
          <h4>Total Sales</h4>
          <p>{totalTransactions}</p>
        </div>

      </div>


      {/* CHARTS */}

      <div style={{ marginTop: 40 }}>
        <h3>Water Sold Trend</h3>
        <Bar data={litresChart} />
      </div>


      <div style={{ marginTop: 50 }}>
        <h3>Revenue Trend</h3>
        <Bar data={revenueChart} />
      </div>


      <div style={{ marginTop: 50 }}>
        <h3>Sales Per Meter</h3>
        <Bar data={meterChart} />
      </div>

    </div>
  );
};


/* ===== STYLES ===== */

const filterContainer = {
  display: "flex",
  gap: 10,
  marginBottom: 20
};

const btn = {
  padding: "8px 14px",
  background: "#2563eb",
  border: "none",
  color: "white",
  borderRadius: 6,
  cursor: "pointer"
};

const stats = {
  display: "flex",
  gap: 20,
  marginTop: 20,
  flexWrap: "wrap"
};

const card = {
  flex: 1,
  minWidth: 150,
  padding: 15,
  background: "white",
  borderRadius: 10,
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  textAlign: "center"
};

export default SalesAnalytics;