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

  /* ==========================
     FILTER SALES
  ========================== */

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

  /* ==========================
     SUMMARY
  ========================== */

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + (sale.revenue || 0),
    0
  );

  const totalLitres = filteredSales.reduce(
    (sum, sale) => sum + (sale.totalSold || 0),
    0
  );

  const totalTransactions = filteredSales.length;

  /* ==========================
     GROUP BY DATE
  ========================== */

  const grouped = {};

  filteredSales.forEach((sale) => {
    const date = new Date(sale.date).toLocaleDateString();

    if (!grouped[date]) {
      grouped[date] = {
        litres: 0,
        revenue: 0,
      };
    }

    grouped[date].litres += sale.totalSold || 0;
    grouped[date].revenue += sale.revenue || 0;
  });

  const labels = Object.keys(grouped);

  const litresData = labels.map((d) => grouped[d].litres);
  const revenueData = labels.map((d) => grouped[d].revenue);

  /* ==========================
     SALES PER METER
  ========================== */

  const meterMap = {};

  filteredSales.forEach((sale) => {
    const meter = sale.meter?.meterNumber || "Unknown";

    if (!meterMap[meter]) {
      meterMap[meter] = 0;
    }

    meterMap[meter] += sale.totalSold || 0;
  });

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
        label: "Revenue (R)",
        data: revenueData,
        backgroundColor: "#1e3a8a",
      },
    ],
  };

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={container}>
      <h2 style={title}>📊 Sales Analytics</h2>

      {/* FILTER */}

      <div style={filterContainer}>
        <button
          onClick={() => setFilter("today")}
          style={btn}
        >
          Today
        </button>

        <button
          onClick={() => setFilter("week")}
          style={btn}
        >
          Week
        </button>

        <button
          onClick={() => setFilter("month")}
          style={btn}
        >
          Month
        </button>

        <button
          onClick={() => setFilter("all")}
          style={btn}
        >
          All
        </button>
      </div>

      {/* SUMMARY */}

      <div style={stats}>
        <div style={card}>
          <h4>Total Litres</h4>
          <p style={value}>{totalLitres.toFixed(2)} L</p>
        </div>

        <div style={card}>
          <h4>Total Revenue</h4>
          <p style={value}>
            R{" "}
            {totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div style={card}>
          <h4>Total Sales</h4>
          <p style={value}>{totalTransactions}</p>
        </div>
      </div>

      {/* WATER CHART */}

      <div style={chartCard}>
        <h3>💧 Water Sold Trend</h3>

        <div style={chartWrapper}>
          <Bar
            data={litresChart}
            options={chartOptions}
          />
        </div>
      </div>

      {/* REVENUE */}

      <div style={chartCard}>
        <h3>💰 Revenue Trend</h3>

        <div style={chartWrapper}>
          <Bar
            data={revenueChart}
            options={chartOptions}
          />
        </div>
      </div>

      {/* METERS */}

      <div style={chartCard}>
        <h3>🚰 Sales Per Meter</h3>

        <div style={chartWrapper}>
          <Bar
            data={meterChart}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

/* =====================================
   STYLES
===================================== */

const container = {
  padding: "20px",
};

const title = {
  marginBottom: 20,
};

const filterContainer = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 25,
};

const btn = {
  padding: "10px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const stats = {
  display: "flex",
  flexWrap: "wrap",
  gap: 20,
};

const card = {
  flex: "1 1 220px",
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,.08)",
  textAlign: "center",
};

const value = {
  fontSize: 26,
  fontWeight: "bold",
  color: "#2563eb",
};

const chartCard = {
  marginTop: 35,
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,.08)",
};

const chartWrapper = {
  position: "relative",
  width: "100%",
  minHeight: 320,
  overflowX: "auto",
};

export default SalesAnalytics;