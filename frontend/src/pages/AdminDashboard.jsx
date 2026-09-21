import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

import {
  Hand,
  DollarSign,
  Droplets,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  Package,
  RefreshCw,
  CircleDollarSign,
  Waves,
  Gauge,
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
    totalSold: 0,
  });

  const [notifications, setNotifications] = useState([]);

  const [lowStock, setLowStock] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =====================================================
     AUTH FETCH
  ===================================================== */

  const authFetch = async (url) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      navigate("/");
      throw new Error("Session expired");
    }

    return res.json();
  };

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadAll = async () => {
    try {
      setLoading(true);

      const [
        salesData,
        revenueData,
        waterData,
        lowStockData,
      ] = await Promise.all([
        authFetch(`${API}/sales`),
        authFetch(`${API}/analytics/revenue`),
        authFetch(`${API}/analytics/water-sold`),
        authFetch(`${API}/products/low-stock`),
      ]);

      setSales(salesData);

      setStats({
        totalRevenue: revenueData.totalRevenue || 0,
        totalSold: waterData.totalWaterSold || 0,
      });

      setLowStock(lowStockData);

      setError("");
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD + SOCKET
  ===================================================== */

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadAll();

    socket.on("newSale", (data) => {
      console.log("Notification received", data);

      loadAll();

      setNotifications((prev) => [
        {
          message: data.message,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    });

    return () => socket.off("newSale");
  }, [token, navigate]);

  /* =====================================================
     CHART DATA
  ===================================================== */

  const chart = useMemo(() => {
    const labels = sales.map((s) =>
      new Date(s.date).toLocaleDateString()
    );

    return {
      labels,
      water: sales.map((s) => s.totalSold),
      revenue: sales.map((s) => s.revenue || 0),
    };
  }, [sales]);

  /* =====================================================
     CURRENCY
  ===================================================== */

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n || 0);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={center}>
        <div style={loadingBox}>
          <RefreshCw
            size={28}
            strokeWidth={2.2}
            style={{
              animation: "spin 1s linear infinite",
            }}
          />

          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div style={center}>
        <div style={errorBox(theme)}>
          <AlertTriangle size={28} />

          <span>{error}</span>

          <button
            onClick={loadAll}
            style={retryButton}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div style={page(theme)} className="admin-dashboard">
      {/* =================================================
          WELCOME HEADER
      ================================================= */}

      <div style={topbar}>
        <div style={{ minWidth: 0 }}>
          <h1 style={title(theme)}>
            <span style={titleIcon(theme)}>
              <Hand
                size={27}
                strokeWidth={2.2}
              />
            </span>

            <span>Welcome back,</span>
          </h1>

          <p style={subtitle(theme)}>
            {user?.name || "Administrator"}
          </p>

          <p style={subtext(theme)}>
            Manage your water business from one place.
          </p>
        </div>

        <div style={dashboardStatus(theme)}>
          <Activity size={18} />

          <span>Dashboard Active</span>
        </div>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div style={statsGrid}>
        <StatCard
          icon={
            <CircleDollarSign
              size={38}
              strokeWidth={2.2}
            />
          }
          title="Total Revenue"
          value={currency(stats.totalRevenue)}
          gradient="linear-gradient(135deg,#16a34a,#4ade80)"
        />

        <StatCard
          icon={
            <Droplets
              size={38}
              strokeWidth={2.2}
            />
          }
          title="Total Water Sold"
          value={`${stats.totalSold} L`}
          gradient="linear-gradient(135deg,#2563eb,#60a5fa)"
        />
      </div>

      {/* =================================================
          CHARTS
      ================================================= */}

      <div style={chartsGrid}>
        {/* WATER TREND */}

        <Card
          title={
            <span style={cardTitle}>
              <Waves size={21} />

              <span>Water Trend</span>
            </span>
          }
        >
          {sales.length ? (
            <div style={chartContainer}>
              <Bar
                data={{
                  labels: chart.labels,

                  datasets: [
                    {
                      label: "Water Sold",
                      data: chart.water,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      display: true,
                    },
                  },

                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <Empty />
          )}
        </Card>

        {/* REVENUE TREND */}

        <Card
          title={
            <span style={cardTitle}>
              <TrendingUp size={21} />

              <span>Revenue Trend</span>
            </span>
          }
        >
          {sales.length ? (
            <div style={chartContainer}>
              <Line
                data={{
                  labels: chart.labels,

                  datasets: [
                    {
                      label: "Revenue",
                      data: chart.revenue,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,

                  plugins: {
                    legend: {
                      display: true,
                    },
                  },

                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          ) : (
            <Empty />
          )}
        </Card>
      </div>

      {/* =================================================
          LOW STOCK
      ================================================= */}

      {lowStock.length > 0 && (
        <Card
          title={
            <span style={cardTitle}>
              <AlertTriangle
                size={21}
                strokeWidth={2.3}
              />

              <span>Low Stock Warning</span>

              <span style={warningBadge}>
                {lowStock.length}
              </span>
            </span>
          }
        >
          <div style={lowStockList}>
            {lowStock.map((p) => (
              <div
                key={p._id}
                style={lowStockItem(theme)}
              >
                <div style={lowStockLeft}>
                  <div style={lowStockIcon(theme)}>
                    <Package
                      size={20}
                      strokeWidth={2.2}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={productName(theme)}>
                      {p.name}
                    </div>

                    <div style={productSize(theme)}>
                      {p.size || "Product"}
                    </div>
                  </div>
                </div>

                <div style={stockAmount(theme)}>
                  <Gauge size={18} />

                  <span>
                    {p.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================
          RECENT SALES REMOVED
          
          The Recent Sales table has intentionally been
          removed from this dashboard.
      ================================================= */}
    </div>
  );
};

/* =====================================================
   CARD COMPONENT
===================================================== */

const Card = ({ title, children }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={card(theme)}>
      <div style={cardHeader(theme)}>
        {title}
      </div>

      {children}
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  title,
  value,
  gradient,
  icon,
}) => (
  <div
    style={{
      ...statCard,
      background: gradient,
    }}
    className="dashboard-stat-card"
  >
    <div style={statIcon}>
      {icon}
    </div>

    <div style={statTitle}>
      {title}
    </div>

    <div style={statValue}>
      {value}
    </div>
  </div>
);

/* =====================================================
   EMPTY
===================================================== */

const Empty = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div style={empty(theme)}>
      <BarChart3 size={30} />

      <span>No data yet</span>
    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1600,
  margin: "0 auto",
  color: theme.text,
  boxSizing: "border-box",
});

/* =====================================================
   HEADER
===================================================== */

const topbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 30,
};

const title = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 30,
  fontWeight: 700,
  margin: 0,
  color: theme.text,
});

const titleIcon = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  borderRadius: 12,
  background: theme.primaryLight || "rgba(37,99,235,.12)",
  color: theme.primary,
  flexShrink: 0,
});

const subtitle = (theme) => ({
  fontSize: 22,
  fontWeight: 600,
  margin: "8px 0 0 54px",
  color: theme.primary,
});

const subtext = (theme) => ({
  marginTop: 8,
  marginLeft: 54,
  color: theme.textSecondary,
  fontSize: 15,
});

const dashboardStatus = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  color: theme.textSecondary,
  fontSize: 14,
  fontWeight: 600,
  boxShadow: theme.shadow,
});

/* =====================================================
   STATS
===================================================== */

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 30,
};

const statCard = {
  padding: 24,
  borderRadius: 22,
  color: "white",
  boxShadow:
    "0 15px 35px rgba(0,0,0,.18)",
  transition: "0.25s",
  cursor: "default",
  boxSizing: "border-box",
  minWidth: 0,
};

const statIcon = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 54,
  height: 54,
  borderRadius: 15,
  background: "rgba(255,255,255,.16)",
};

const statTitle = {
  marginTop: 14,
  opacity: 0.9,
  fontSize: 15,
  fontWeight: 500,
};

const statValue = {
  fontSize: 30,
  fontWeight: 700,
  marginTop: 8,
  wordBreak: "break-word",
};

/* =====================================================
   CHARTS
===================================================== */

const chartsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
  marginBottom: 30,
};

const chartContainer = {
  position: "relative",
  width: "100%",
  height: 260,
};

/* =====================================================
   CARD
===================================================== */

const card = (theme) => ({
  background: theme.card,
  padding: 20,
  borderRadius: 20,
  boxShadow: theme.shadow,
  marginBottom: 25,
  border: `1px solid ${theme.border}`,
  color: theme.text,
  boxSizing: "border-box",
  minWidth: 0,
});

const cardHeader = (theme) => ({
  marginBottom: 18,
  color: theme.text,
  fontSize: 18,
  fontWeight: 700,
});

const cardTitle = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};

/* =====================================================
   LOW STOCK
===================================================== */

const lowStockList = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const lowStockItem = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
  padding: 12,
  background:
    theme.dangerLight ||
    "rgba(239,68,68,.10)",
  color: theme.text,
  borderRadius: 12,
  border: `1px solid ${
    theme.border
  }`,
  boxSizing: "border-box",
});

const lowStockLeft = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const lowStockIcon = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: 10,
  background:
    theme.dangerLight ||
    "rgba(239,68,68,.12)",
  color:
    theme.danger ||
    "#ef4444",
  flexShrink: 0,
});

const productName = (theme) => ({
  fontWeight: 700,
  fontSize: 15,
  color: theme.text,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const productSize = (theme) => ({
  marginTop: 3,
  fontSize: 13,
  color: theme.textSecondary,
});

const stockAmount = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 9,
  background:
    theme.card,
  border: `1px solid ${theme.border}`,
  color:
    theme.danger ||
    "#ef4444",
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

const warningBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 23,
  height: 23,
  padding: "0 6px",
  borderRadius: 20,
  background: "#ef4444",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
};

/* =====================================================
   EMPTY
===================================================== */

const empty = (theme) => ({
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: theme.textSecondary,
  fontSize: 14,
});

/* =====================================================
   LOADING / ERROR
===================================================== */

const center = {
  display: "flex",
  minHeight: "60vh",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  boxSizing: "border-box",
};

const loadingBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontSize: 17,
  fontWeight: 600,
};

const errorBox = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 10,
  padding: 20,
  borderRadius: 14,
  background:
    theme.dangerLight ||
    "rgba(239,68,68,.10)",
  color:
    theme.danger ||
    "#ef4444",
  fontWeight: 600,
  textAlign: "center",
});

const retryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 14px",
  border: "none",
  borderRadius: 9,
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

/* =====================================================
   RESPONSIVE CSS
===================================================== */

const responsiveStyle = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .admin-dashboard {
    overflow-x: hidden;
  }

  .dashboard-stat-card:hover {
    transform: translateY(-3px);
  }

  @media (max-width: 900px) {
    .admin-dashboard {
      width: 100%;
    }
  }

  @media (max-width: 700px) {
    .admin-dashboard {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .admin-dashboard {
      padding: 0 !important;
    }
  }

  @media (max-width: 500px) {
    .admin-dashboard h1 {
      font-size: 24px !important;
    }

    .dashboard-stat-card {
      padding: 20px !important;
      border-radius: 17px !important;
    }
  }

  @media (max-width: 420px) {
    .admin-dashboard {
      font-size: 14px;
    }

    .dashboard-stat-card {
      padding: 18px !important;
    }
  }

  @media (max-width: 380px) {
    .admin-dashboard h1 {
      font-size: 21px !important;
    }
  }
`;

/* =====================================================
   INJECT RESPONSIVE CSS
===================================================== */

if (
  typeof document !== "undefined" &&
  !document.getElementById(
    "admin-dashboard-responsive"
  )
) {
  const style =
    document.createElement("style");

  style.id =
    "admin-dashboard-responsive";

  style.innerHTML =
    responsiveStyle;

  document.head.appendChild(style);
}

export default AdminDashboard;