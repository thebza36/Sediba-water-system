import React, { useContext, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Package,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminAlerts() {
  const { theme } = useContext(ThemeContext);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

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
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={center(theme)}>
        Loading alerts...
      </div>
    );
  }

  return (
    <div style={page(theme)}>

      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <h1 style={title(theme)}>
        <CircleAlert
          size={30}
          strokeWidth={2.3}
          style={{
            verticalAlign: "middle",
            marginRight: 8,
          }}
        />
        Inventory Alerts
      </h1>


      {/* =====================================================
          ALERT LIST
      ===================================================== */}

      <div style={card(theme)}>

        {alerts.length === 0 && (
          <div style={emptyState(theme)}>

            <CheckCircle2
              size={22}
              strokeWidth={2.2}
              style={{
                verticalAlign: "middle",
                marginRight: 8,
              }}
            />

            All inventory levels are healthy

          </div>
        )}


        {alerts.map((a) => {

          const level = getLevel(a.stock);
          const percent = getPercent(
            a.stock,
            a.minStock
          );

          return (

            <div
              key={a._id}
              style={alertCard(theme)}
            >

              {/* =================================================
                  PRODUCT ICON
              ================================================= */}

              <div style={iconBox(theme)}>

                <Package
                  size={25}
                  strokeWidth={2}
                />

              </div>


              {/* =================================================
                  ALERT INFO
              ================================================= */}

              <div style={alertContent}>

                <div style={topRow}>

                  <div style={productName(theme)}>
                    {a.name}
                  </div>


                  {a.size && (
                    <div style={sizeBadge}>
                      {a.size}
                    </div>
                  )}

                </div>


                {/* STOCK INFORMATION */}

                <div style={alertText(theme)}>

                  Stock Remaining:
                  <strong> {a.stock}</strong>

                  {a.minStock && (
                    <>
                      &nbsp;/ Recommended{" "}
                      <strong>{a.minStock}</strong>
                    </>
                  )}

                </div>


                {/* =================================================
                    STOCK BAR
                ================================================= */}

                <div style={barContainer(theme)}>

                  <div
                    style={{
                      ...bar,
                      width: `${percent}%`,
                      background:
                        level === "CRITICAL"
                          ? "#dc2626"
                          : level === "LOW"
                          ? "#eab308"
                          : "#16a34a",
                    }}
                  />

                </div>


                {/* =================================================
                    EXPLANATION
                ================================================= */}

                <div style={alertExplain(theme)}>

                  {level === "CRITICAL" && (
                    <span
                      style={{
                        color: "#dc2626",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >

                      <AlertTriangle
                        size={16}
                        strokeWidth={2.3}
                      />

                      Critical: This bottle size is almost finished.
                      Immediate restock required.

                    </span>
                  )}


                  {level === "LOW" && (
                    <span
                      style={{
                        color: "#ca8a04",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >

                      <AlertTriangle
                        size={16}
                        strokeWidth={2.3}
                      />

                      Low stock: Inventory is getting low.
                      Plan restocking soon.

                    </span>
                  )}


                  {level === "OK" && (
                    <span
                      style={{
                        color: "#16a34a",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >

                      <CheckCircle2
                        size={16}
                        strokeWidth={2.3}
                      />

                      Inventory is within healthy levels.

                    </span>
                  )}

                </div>

              </div>


              {/* =================================================
                  STATUS BADGE
              ================================================= */}

              <div
                style={
                  level === "CRITICAL"
                    ? criticalBadge
                    : level === "LOW"
                    ? lowBadge
                    : okBadge
                }
              >
                {level}
              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}


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


const title = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  marginBottom: 20,
  color: theme.text,
  display: "flex",
  alignItems: "center",
});


const card = (theme) => ({
  background: theme.card,
  padding: 20,
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


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


const iconBox = (theme) => ({
  background: theme.tableHeader,
  width: 45,
  height: 45,
  minWidth: 45,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  color: theme.primary,
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
  marginBottom: 4,
};


const productName = (theme) => ({
  fontWeight: 700,
  fontSize: "clamp(16px, 4vw, 18px)",
  color: theme.text,
});


const sizeBadge = {
  background: "#84cc16",
  color: "white",
  fontSize: 12,
  padding: "3px 8px",
  borderRadius: 12,
  fontWeight: 600,
};


const alertText = (theme) => ({
  fontSize: 14,
  marginBottom: 6,
  color: theme.text,
});


const barContainer = (theme) => ({
  height: 8,
  background: theme.border,
  borderRadius: 20,
  overflow: "hidden",
  marginBottom: 6,
  width: "100%",
});


const bar = {
  height: "100%",
  borderRadius: 20,
  transition: "width 0.3s ease",
};


const alertExplain = (theme) => ({
  fontSize: 13,
  opacity: 0.9,
  color: theme.text,
});


const criticalBadge = {
  background: "#dc2626",
  color: "white",
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
  marginLeft: "auto",
};


const lowBadge = {
  background: "#eab308",
  color: "#111",
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
  marginLeft: "auto",
};


const okBadge = {
  background: "#16a34a",
  color: "white",
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
  marginLeft: "auto",
};


const emptyState = (theme) => ({
  padding: 25,
  textAlign: "center",
  background: theme.tableHeader,
  borderRadius: 10,
  color: theme.text,
  fontWeight: 600,
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
});