import React, { useContext, useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Package,
  Boxes,
  Gauge,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminAlerts() {
  const { theme } = useContext(ThemeContext);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD ALERTS
  ========================================================= */

  useEffect(() => {
    fetch(`${API}/alerts`)
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  /* =========================================================
     ALERT LEVEL
  ========================================================= */

  const getLevel = (stock) => {
    if (stock <= 3) return "CRITICAL";

    if (stock <= 10) return "LOW";

    return "OK";
  };

  /* =========================================================
     STOCK PERCENT
  ========================================================= */

  const getPercent = (stock, min) => {
    if (!min) return 0;

    const p = (stock / min) * 100;

    return Math.min(p, 100);
  };

  /* =========================================================
     LEVEL ICON
  ========================================================= */

  const getLevelIcon = (level) => {
    if (level === "CRITICAL") {
      return (
        <AlertTriangle
          size={17}
          strokeWidth={2.3}
        />
      );
    }

    if (level === "LOW") {
      return (
        <TrendingDown
          size={17}
          strokeWidth={2.3}
        />
      );
    }

    return (
      <CheckCircle2
        size={17}
        strokeWidth={2.3}
      />
    );
  };

  /* =========================================================
     LEVEL COLOR
  ========================================================= */

  const getLevelColor = (level) => {
    if (level === "CRITICAL") {
      return "#dc2626";
    }

    if (level === "LOW") {
      return "#ca8a04";
    }

    return "#16a34a";
  };

  /* =========================================================
     LEVEL BACKGROUND
  ========================================================= */

  const getLevelBackground = (level) => {
    if (level === "CRITICAL") {
      return "rgba(220,38,38,.10)";
    }

    if (level === "LOW") {
      return "rgba(234,179,8,.12)";
    }

    return "rgba(22,163,74,.10)";
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={center(theme)}>
        <div style={loadingBox(theme)}>
          <RefreshCw
            size={28}
            strokeWidth={2.2}
            className="alerts-loading-icon"
          />

          <span>Loading alerts...</span>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      style={page(theme)}
      className="admin-alerts-page"
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div style={header}>
        <div style={{ minWidth: 0 }}>
          <h1 style={title(theme)}>
            <span style={titleIcon(theme)}>
              <CircleAlert
                size={28}
                strokeWidth={2.3}
              />
            </span>

            <span>Inventory Alerts</span>
          </h1>

          <p style={subtitle(theme)}>
            Monitor stock levels and identify products
            that need attention.
          </p>
        </div>

        <div style={inventoryStatus(theme)}>
          <Boxes size={18} />

          <span>
            {alerts.length === 0
              ? "Inventory Healthy"
              : `${alerts.length} Item${
                  alerts.length === 1 ? "" : "s"
                }`
            }
          </span>
        </div>
      </div>

      {/* =====================================================
          ALERT SUMMARY
      ===================================================== */}

      {alerts.length > 0 && (
        <div style={summaryGrid}>
          <SummaryCard
            icon={
              <AlertTriangle
                size={23}
                strokeWidth={2.2}
              />
            }
            title="Critical"
            value={
              alerts.filter(
                (a) =>
                  getLevel(a.stock) === "CRITICAL"
              ).length
            }
            color="#dc2626"
            background="rgba(220,38,38,.10)"
            theme={theme}
          />

          <SummaryCard
            icon={
              <TrendingDown
                size={23}
                strokeWidth={2.2}
              />
            }
            title="Low Stock"
            value={
              alerts.filter(
                (a) =>
                  getLevel(a.stock) === "LOW"
              ).length
            }
            color="#ca8a04"
            background="rgba(234,179,8,.12)"
            theme={theme}
          />

          <SummaryCard
            icon={
              <Package
                size={23}
                strokeWidth={2.2}
              />
            }
            title="Products"
            value={alerts.length}
            color={theme.primary}
            background={
              theme.primaryLight ||
              "rgba(37,99,235,.10)"
            }
            theme={theme}
          />
        </div>
      )}

      {/* =====================================================
          ALERT LIST
      ===================================================== */}

      <div style={card(theme)}>
        {alerts.length === 0 && (
          <div style={emptyState(theme)}>
            <div style={emptyIcon(theme)}>
              <ShieldCheck
                size={32}
                strokeWidth={2.2}
              />
            </div>

            <div style={emptyTitle(theme)}>
              All inventory levels are healthy
            </div>

            <div style={emptyText(theme)}>
              There are currently no products requiring
              immediate stock attention.
            </div>
          </div>
        )}

        {alerts.map((a) => {
          const level = getLevel(a.stock);

          const percent = getPercent(
            a.stock,
            a.minStock
          );

          const levelColor =
            getLevelColor(level);

          const levelBackground =
            getLevelBackground(level);

          return (
            <div
              key={a._id}
              style={alertCard(theme)}
              className="admin-alert-card"
            >
              {/* =================================================
                  PRODUCT ICON
              ================================================= */}

              <div
                style={iconBox(
                  theme,
                  levelColor,
                  levelBackground
                )}
              >
                <Package
                  size={25}
                  strokeWidth={2.1}
                />
              </div>

              {/* =================================================
                  ALERT CONTENT
              ================================================= */}

              <div style={alertContent}>
                {/* PRODUCT HEADER */}

                <div style={topRow}>
                  <div style={productName(theme)}>
                    {a.name}
                  </div>

                  {a.size && (
                    <div style={sizeBadge(theme)}>
                      {a.size}
                    </div>
                  )}
                </div>

                {/* STOCK INFORMATION */}

                <div style={alertText(theme)}>
                  <span
                    style={stockLabel(theme)}
                  >
                    <Gauge
                      size={16}
                      strokeWidth={2.1}
                    />

                    Stock Remaining
                  </span>

                  <strong>
                    {a.stock}
                  </strong>

                  {a.minStock && (
                    <>
                      <span style={separator(theme)}>
                        /
                      </span>

                      <span>
                        Recommended
                      </span>

                      <strong>
                        {a.minStock}
                      </strong>
                    </>
                  )}
                </div>

                {/* STOCK BAR */}

                <div
                  style={barContainer(theme)}
                >
                  <div
                    style={{
                      ...bar,
                      width: `${percent}%`,
                      background:
                        levelColor,
                    }}
                  />
                </div>

                {/* PERCENT */}

                {a.minStock && (
                  <div
                    style={percentageRow(theme)}
                  >
                    <span>
                      Stock level
                    </span>

                    <strong
                      style={{
                        color: levelColor,
                      }}
                    >
                      {Math.round(percent)}%
                    </strong>
                  </div>
                )}

                {/* EXPLANATION */}

                <div
                  style={alertExplain(
                    theme,
                    levelColor,
                    levelBackground
                  )}
                >
                  {getLevelIcon(level)}

                  <span>
                    {level === "CRITICAL" &&
                      "Critical: This bottle size is almost finished. Immediate restock required."
                    }

                    {level === "LOW" &&
                      "Low stock: Inventory is getting low. Plan restocking soon."
                    }

                    {level === "OK" &&
                      "Inventory is within healthy levels."
                    }
                  </span>
                </div>
              </div>

              {/* =================================================
                  STATUS BADGE
              ================================================= */}

              <div
                style={statusBadge(
                  levelColor,
                  levelBackground
                )}
              >
                {getLevelIcon(level)}

                <span>{level}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          INFORMATION FOOTER
      ===================================================== */}

      <div style={infoBox(theme)}>
        <Info
          size={18}
          strokeWidth={2.2}
        />

        <span>
          Inventory alerts are based on the current
          stock levels returned by your system.
        </span>
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`
          .admin-alerts-page {
            overflow-x: hidden;
          }

          .admin-alert-card {
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .admin-alert-card:hover {
            transform: translateY(-2px);
          }

          .alerts-loading-icon {
            animation: alertsSpin 1s linear infinite;
          }

          @keyframes alertsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 700px) {
            .admin-alert-card {
              display: grid !important;
              grid-template-columns: auto 1fr !important;
              align-items: start !important;
            }

            .admin-alert-card > div:last-child {
              grid-column: 1 / -1;
              justify-self: start;
              margin-left: 0 !important;
              margin-top: 4px;
            }
          }

          @media (max-width: 500px) {
            .admin-alert-card {
              padding: 14px !important;
              gap: 12px !important;
            }

            .admin-alerts-page {
              padding: 10px !important;
            }
          }

          @media (max-width: 400px) {
            .admin-alert-card {
              grid-template-columns: 1fr !important;
            }

            .admin-alert-card > div:last-child {
              grid-column: 1;
            }
          }
        `}
      </style>
    </div>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon,
  title,
  value,
  color,
  background,
  theme,
}) => {
  return (
    <div
      style={{
        ...summaryCard(theme),
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div
        style={{
          ...summaryIcon,
          color,
          background,
        }}
      >
        {icon}
      </div>

      <div style={summaryInfo}>
        <div style={summaryTitle(theme)}>
          {title}
        </div>

        <div
          style={{
            ...summaryValue,
            color,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};


/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  padding: "15px",
  boxSizing: "border-box",
  background: theme.page,
  color: theme.text,
  overflowX: "hidden",
});


/* =========================================================
   HEADER
========================================================= */

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 25,
};


const title = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  margin: 0,
  color: theme.text,
});


const titleIcon = (theme) => ({
  width: 46,
  height: 46,
  minWidth: 46,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 13,
  background:
    theme.primaryLight ||
    "rgba(37,99,235,.10)",
  color: theme.primary,
});


const subtitle = (theme) => ({
  margin: "9px 0 0 56px",
  color: theme.textSecondary,
  fontSize: 14,
  lineHeight: 1.5,
});


const inventoryStatus = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  color: theme.textSecondary,
  fontSize: 13,
  fontWeight: 700,
  boxShadow: theme.shadow,
});


/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(190px,1fr))",
  gap: 15,
  marginBottom: 25,
};


const summaryCard = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 15,
  borderRadius: 14,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.shadow,
  boxSizing: "border-box",
});


const summaryIcon = {
  width: 43,
  height: 43,
  minWidth: 43,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 11,
};


const summaryInfo = {
  minWidth: 0,
};


const summaryTitle = (theme) => ({
  color: theme.textSecondary,
  fontSize: 13,
  fontWeight: 600,
});


const summaryValue = {
  fontSize: 24,
  fontWeight: 800,
  marginTop: 2,
};


/* =========================================================
   MAIN CARD
========================================================= */

const card = (theme) => ({
  background: theme.card,
  padding: 20,
  borderRadius: 18,
  boxShadow:
    theme.shadow ||
    "0 10px 30px rgba(0,0,0,.08)",
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


/* =========================================================
   ALERT CARD
========================================================= */

const alertCard = (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap",
  padding: 18,
  borderRadius: 14,
  marginBottom: 16,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  color: theme.text,
  boxSizing: "border-box",
});


const iconBox = (
  theme,
  levelColor,
  levelBackground
) => ({
  background: levelBackground,
  width: 48,
  height: 48,
  minWidth: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  color: levelColor,
});


const alertContent = {
  flex: "1 1 220px",
  minWidth: 0,
};


const topRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 6,
};


const productName = (theme) => ({
  fontWeight: 700,
  fontSize: "clamp(16px, 4vw, 18px)",
  color: theme.text,
  wordBreak: "break-word",
});


const sizeBadge = (theme) => ({
  background:
    theme.primary ||
    "#2563eb",
  color: "white",
  fontSize: 12,
  padding: "4px 9px",
  borderRadius: 12,
  fontWeight: 700,
});


/* =========================================================
   STOCK TEXT
========================================================= */

const alertText = (theme) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 6,
  fontSize: 14,
  marginBottom: 8,
  color: theme.text,
});


const stockLabel = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  color: theme.textSecondary,
  fontWeight: 600,
});


const separator = (theme) => ({
  color: theme.textSecondary,
});


/* =========================================================
   STOCK BAR
========================================================= */

const barContainer = (theme) => ({
  height: 9,
  background:
    theme.border ||
    "#e5e7eb",
  borderRadius: 20,
  overflow: "hidden",
  marginBottom: 5,
  width: "100%",
});


const bar = {
  height: "100%",
  borderRadius: 20,
  transition: "width 0.3s ease",
};


const percentageRow = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  fontSize: 12,
  color: theme.textSecondary,
  marginBottom: 9,
});


/* =========================================================
   EXPLANATION
========================================================= */

const alertExplain = (
  theme,
  levelColor,
  levelBackground
) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 7,
  padding: "8px 10px",
  borderRadius: 9,
  background: levelBackground,
  color: levelColor,
  fontSize: 13,
  lineHeight: 1.4,
});


/* =========================================================
   STATUS BADGE
========================================================= */

const statusBadge = (
  levelColor,
  levelBackground
) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  background: levelBackground,
  color: levelColor,
  padding: "7px 11px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
  marginLeft: "auto",
});


/* =========================================================
   EMPTY STATE
========================================================= */

const emptyState = (theme) => ({
  padding: "45px 20px",
  textAlign: "center",
  background:
    theme.tableHeader ||
    "rgba(0,0,0,.03)",
  borderRadius: 12,
  color: theme.text,
  width: "100%",
  boxSizing: "border-box",
});


const emptyIcon = (theme) => ({
  width: 60,
  height: 60,
  margin: "0 auto 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  background:
    "rgba(22,163,74,.10)",
  color: "#16a34a",
});


const emptyTitle = (theme) => ({
  fontSize: 17,
  fontWeight: 700,
  color: theme.text,
});


const emptyText = (theme) => ({
  marginTop: 6,
  fontSize: 13,
  color: theme.textSecondary,
});


/* =========================================================
   INFO BOX
========================================================= */

const infoBox = (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  marginTop: 18,
  padding: "12px 14px",
  borderRadius: 11,
  background:
    theme.tableHeader ||
    "rgba(0,0,0,.03)",
  border: `1px solid ${theme.border}`,
  color: theme.textSecondary,
  fontSize: 13,
  lineHeight: 1.4,
});


/* =========================================================
   LOADING
========================================================= */

const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
});


const loadingBox = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 17,
  fontWeight: 600,
  color: theme.text,
});