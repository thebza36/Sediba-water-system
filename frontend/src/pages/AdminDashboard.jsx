import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import {
  Hand,
  DollarSign,
  Droplets,
  AlertTriangle,
} from "lucide-react";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSold: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authFetch = async (url) => {

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      localStorage.clear();
      navigate("/");
      throw new Error("Session expired");
    }

    return res.json();

  };

  const loadAll = async () => {

    try {

      setLoading(true);

      const [
        salesData,
        revenueData,
        waterData,
        lowStockData
      ] = await Promise.all([
        authFetch(`${API}/sales`),
        authFetch(`${API}/analytics/revenue`),
        authFetch(`${API}/analytics/water-sold`),
        authFetch(`${API}/products/low-stock`)
      ]);

      setSales(salesData);

      setStats({
        totalRevenue: revenueData.totalRevenue || 0,
        totalSold: waterData.totalWaterSold || 0
      });

      setLowStock(lowStockData);

      setError("");

    } catch {

      setError("Failed to load dashboard data");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if (!token) return navigate("/");

    loadAll();

    socket.on("newSale", (data) => {

      console.log("Notification received", data);

      loadAll();

      setNotifications(prev => [
        {
          message: data.message,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);

    });

    return () => socket.off("newSale");

  }, [token, navigate]);

  const chart = useMemo(() => {

    const labels = sales.map((s) =>
      new Date(s.date).toLocaleDateString()
    );

    return {
      labels,
      water: sales.map((s) => s.totalSold),
      revenue: sales.map((s) => s.revenue || 0)
    };

  }, [sales]);

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(n || 0);

  if (loading) return <div style={center}>Loading dashboard…</div>;

  if (error) return <div style={center}>{error}</div>;

  return (

    <div style={page(theme)}>

      <div style={topbar}>

        <div>

          <h1 style={title(theme)}>

            <Hand
              size={32}
              strokeWidth={2.2}
              style={{
                verticalAlign: "middle",
                marginRight: 8
              }}
            />

            Welcome back,

          </h1>

          <p style={subtitle(theme)}>
            {user?.name || "Administrator"}
          </p>

          <p style={subtext(theme)}>
            Manage your water business from one place.
          </p>

        </div>

      </div>

      <div style={statsGrid}>

        <StatCard
          icon={<DollarSign size={38} strokeWidth={2.2} />}
          title="Total Revenue"
          value={currency(stats.totalRevenue)}
          gradient="linear-gradient(135deg,#16a34a,#4ade80)"
        />

        <StatCard
          icon={<Droplets size={38} strokeWidth={2.2} />}
          title="Total Water Sold"
          value={`${stats.totalSold} L`}
          gradient="linear-gradient(135deg,#2563eb,#60a5fa)"
        />

      </div>

      <div style={chartsGrid}>

        <Card title="Water Trend">

          {sales.length ? (

            <div style={{ height: 260 }}>

              <Bar
                data={{
                  labels: chart.labels,
                  datasets: [
                    {
                      label: "Water Sold",
                      data: chart.water
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />

            </div>

          ) : (
            <Empty />
          )}

        </Card>

        <Card title="Revenue Trend">

          {sales.length ? (

            <div style={{ height: 260 }}>

              <Line
                data={{
                  labels: chart.labels,
                  datasets: [
                    {
                      label: "Revenue",
                      data: chart.revenue
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />

            </div>

          ) : (
            <Empty />
          )}

        </Card>

      </div>

      {lowStock.length > 0 && (

        <Card
          title={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AlertTriangle size={21} />
              Low Stock Warning
            </span>
          }
        >

          {lowStock.map((p) => (

            <div
              key={p._id}
              style={{
                padding: 10,
                marginBottom: 8,
                background: theme.dangerLight,
                color: theme.text,
                borderRadius: 8,
              }}
            >
              {p.name} {p.size} — Only {p.stock} left
            </div>

          ))}

        </Card>

      )}

      <Card title="Recent Sales">

        {sales.length === 0 ? (

          <Empty />

        ) : (

          <div style={{ overflowX: "auto" }}>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 650,
                fontSize: 14
              }}
            >

              <thead>

                <tr
                  style={{
                    background: theme.tableHeader,
                    color: theme.text,
                  }}
                >

                  <th style={th(theme)}>Date</th>
                  <th style={th(theme)}>Meter</th>
                  <th style={th(theme)}>Employee</th>
                  <th style={th(theme)}>Water</th>
                  <th style={th(theme)}>Revenue</th>

                </tr>

              </thead>

              <tbody>

                {sales.slice(0, 10).map((s) => (

                  <tr key={s._id}>

                    <td style={td(theme)}>
                      {new Date(s.date).toLocaleDateString()}
                    </td>

                    <td style={td(theme)}>
                      {s.meter?.meterNumber}
                    </td>

                    {/* FIXED EMPLOYEE DISPLAY */}

                    <td style={td(theme)}>
                      {s.employee?.name ||
                        s.employeeName ||
                        "N/A"}
                    </td>

                    <td style={td(theme)}>
                      {s.totalSold} L
                    </td>

                    <td style={td(theme)}>
                      {currency(s.revenue)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>

    </div>

  );

};


/* COMPONENTS */

const Card = ({ title, children }) => {

  const { theme } = useContext(ThemeContext);

  return (

    <div style={card(theme)}>

      <h3
        style={{
          marginBottom: 15,
          color: theme.text,
        }}
      >
        {title}
      </h3>

      {children}

    </div>

  );

};


const StatCard = ({
  title,
  value,
  gradient,
  icon
}) => (

  <div
    style={{
      ...statCard,
      background: gradient
    }}
  >

    <div style={{ fontSize: 34 }}>
      {icon}
    </div>

    <div
      style={{
        marginTop: 10,
        opacity: .9,
        fontSize: 15
      }}
    >
      {title}
    </div>

    <div
      style={{
        fontSize: 30,
        fontWeight: 700,
        marginTop: 8
      }}
    >
      {value}
    </div>

  </div>

);


const Empty = () => {

  const { theme } = useContext(ThemeContext);

  return (

    <div
      style={{
        padding: 20,
        color: theme.textSecondary,
      }}
    >
      No data yet
    </div>

  );

};


/* STYLES */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1600,
  margin: "0 auto",
  color: theme.text,
});


const title = (theme) => ({
  fontSize: 30,
  fontWeight: 700,
  margin: 0,
  color: theme.text,
});


const subtitle = (theme) => ({
  fontSize: 22,
  fontWeight: 600,
  margin: "8px 0 0",
  color: theme.primary,
});


const subtext = (theme) => ({
  marginTop: 8,
  color: theme.textSecondary,
  fontSize: 15,
});


const topbar = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  marginBottom: 30
};


const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 30
};


const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
  marginBottom: 30
};


const card = (theme) => ({
  background: theme.card,
  padding: 20,
  borderRadius: 20,
  boxShadow: theme.shadow,
  marginBottom: 25,
  border: `1px solid ${theme.border}`,
  color: theme.text,
});


const statCard = {
  padding: 24,
  borderRadius: 22,
  color: "white",
  boxShadow: "0 15px 35px rgba(0,0,0,.18)",
  transition: "0.25s",
  cursor: "pointer"
};


const center = {
  display: "flex",
  height: "60vh",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18
};


const th = (theme) => ({
  padding: 12,
  textAlign: "left",
  color: theme.text,
});


const td = (theme) => ({
  padding: 12,
  borderTop: `1px solid ${theme.border}`,
  color: theme.text,
});


export default AdminDashboard;