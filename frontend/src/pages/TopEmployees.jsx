import { useEffect, useRef, useState } from "react";
import {
  Trophy,
  AlertTriangle,
  Users,
  RotateCcw,
  Droplets,
  Medal,
} from "lucide-react";

export default function TopEmployees() {
  const API = `${import.meta.env.VITE_API_URL}/analytics/top-employees`;

  const [topEmployees, setTopEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  /* ================= MONEY FORMAT ================= */

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  /* ================= FETCH ================= */

  const fetchTopEmployees = async () => {
    try {
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Failed to load leaderboard");
        setTopEmployees([]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) =>
          (b.totalRevenue || b.revenue || 0) -
          (a.totalRevenue || a.revenue || 0)
      );

      setTopEmployees(sorted);

      console.log("TOP EMPLOYEES:", sorted);
    } catch (err) {
      console.log(err);

      setError("Network error");
      setTopEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchTopEmployees();
  }, []);

  return (
    <div style={container}>

      {/* ================= HEADER ================= */}

      <div style={header}>

        <div style={headerIcon}>
          <Trophy size={30} strokeWidth={2.5} />
        </div>

        <div>
          <h1 style={title}>
            Top Employees
          </h1>

          <p style={subtitle}>
            Live performance leaderboard
          </p>
        </div>

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div style={center}>

          <div style={loadingIcon}>
            <Trophy
              size={42}
              strokeWidth={2}
            />
          </div>

          <p style={loadingText}>
            Loading leaderboard...
          </p>

        </div>
      )}

      {/* ================= ERROR ================= */}

      {!loading && error && (
        <div style={errorBox}>

          <div style={errorIcon}>
            <AlertTriangle
              size={38}
              strokeWidth={2}
            />
          </div>

          <p style={errorText}>
            {error}
          </p>

          <button
            onClick={() => {
              setLoading(true);
              fetchTopEmployees();
            }}
            style={button}
          >
            <RotateCcw
              size={16}
              strokeWidth={2.5}
            />

            Retry
          </button>

        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading &&
        !error &&
        topEmployees.length === 0 && (
          <div style={emptyBox}>

            <div style={emptyIcon}>
              <Users
                size={46}
                strokeWidth={1.8}
              />
            </div>

            <h3 style={emptyTitle}>
              No Employees Found
            </h3>

            <p style={emptyText}>
              There are currently no employee performance records.
            </p>

          </div>
        )}

      {/* ================= EMPLOYEE GRID ================= */}

      {!loading &&
        !error &&
        topEmployees.length > 0 && (
          <div style={grid}>

            {topEmployees.map((emp, index) => {

              const initials =
                emp.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?";

              /* HANDLE ANY BACKEND FIELD */

              const revenue =
                emp.totalRevenue ||
                emp.revenue ||
                0;

              const waterSold =
                emp.totalWater ||
                emp.totalSold ||
                emp.waterSold ||
                emp.liters ||
                emp.volume ||
                0;

              const isTop = index === 0;

              return (
                <div
                  key={emp._id || index}
                  style={{
                    ...card,
                    ...(isTop ? topCard : {}),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = isTop
                      ? "translateY(-8px) scale(1.02)"
                      : "translateY(-8px)";

                    e.currentTarget.style.boxShadow =
                      "0 25px 50px rgba(15,23,42,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      isTop ? "scale(1)" : "translateY(0)";

                    e.currentTarget.style.boxShadow =
                      isTop
                        ? "0 0 40px rgba(2,6,23,0.45)"
                        : "0 10px 25px rgba(0,0,0,0.08)";
                  }}
                >

                  {/* ================= RANK ================= */}

                  <div
                    style={{
                      ...rank,
                      ...(isTop ? topRank : {}),
                    }}
                  >
                    #{index + 1}
                  </div>

                  {/* ================= TOP BADGE ================= */}

                  {isTop && (
                    <div style={badge}>
                      <Trophy
                        size={14}
                        strokeWidth={2.5}
                      />
                      TOP
                    </div>
                  )}

                  {/* ================= INNER CARD ================= */}

                  <div style={innerCard(index)}>

                    {/* PROFILE */}

                    <div style={profile}>

                      <div
                        style={{
                          ...avatar,
                          ...(isTop ? topAvatar : {}),
                        }}
                      >
                        {initials}
                      </div>

                      <div style={profileInfo}>

                        <h3
                          style={{
                            ...employeeName,
                            color: isTop
                              ? "white"
                              : "#0f172a",
                          }}
                        >
                          {emp.name || "Unknown Employee"}
                        </h3>

                        <p
                          style={{
                            ...email,
                            color: isTop
                              ? "rgba(255,255,255,0.75)"
                              : "#64748b",
                          }}
                        >
                          {emp.email || "No email available"}
                        </p>

                      </div>

                    </div>

                    {/* DIVIDER */}

                    <div style={divider(index)} />

                    {/* REVENUE */}

                    <div style={revenueBox}>

                      <span
                        style={{
                          ...revenueLabel,
                          color: isTop
                            ? "rgba(255,255,255,0.8)"
                            : "#64748b",
                        }}
                      >
                        Total Revenue
                      </span>

                      <h2
                        style={{
                          ...revenueAmount,
                          color: isTop
                            ? "white"
                            : "#0f172a",
                        }}
                      >
                        {formatMoney(revenue)}
                      </h2>

                    </div>

                    {/* WATER SOLD */}

                    <div
                      style={{
                        ...extraBox,
                        color: isTop
                          ? "white"
                          : "#334155",
                      }}
                    >

                      <span style={waterLabel}>
                        <Droplets
                          size={15}
                          strokeWidth={2.2}
                        />

                        Water Sold
                      </span>

                      <strong>
                        {Number(waterSold).toLocaleString()} L
                      </strong>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

/* ================= MAIN PAGE ================= */

const container = {
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  padding: "clamp(15px, 4vw, 40px)",
  background: "#f1f5f9",
  color: "#0f172a",
  fontFamily: "Segoe UI, sans-serif",
  overflowX: "hidden",
};

/* ================= HEADER ================= */

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 15,
  marginBottom: 30,
  width: "100%",
};

const headerIcon = {
  width: 58,
  height: 58,
  minWidth: 58,
  borderRadius: 16,
  background: "linear-gradient(135deg,#1e3a8a,#020617)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px rgba(30,64,175,.25)",
};

const title = {
  margin: 0,
  fontSize: "clamp(28px, 6vw, 42px)",
  lineHeight: 1.2,
  fontWeight: 900,
  color: "#0f172a",
  letterSpacing: "-0.5px",
};

const subtitle = {
  marginTop: 8,
  marginBottom: 0,
  fontSize: "clamp(14px, 2.5vw, 17px)",
  color: "#64748b",
  fontWeight: 500,
};

/* ================= GRID ================= */

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: 22,
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  alignItems: "stretch",
};

/* ================= CARD ================= */

const card = {
  position: "relative",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: 15,
  borderRadius: 20,
  background: "#ffffff",
  transition: "all .35s ease",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
};

/* ================= TOP CARD ================= */

const topCard = {
  background:
    "linear-gradient(135deg,#1e3a8a,#020617)",
  color: "white",
  transform: "scale(1)",
  boxShadow:
    "0 0 40px rgba(2,6,23,0.45)",
};

/* ================= INNER CARD ================= */

const innerCard = (index) => ({
  background:
    index === 0
      ? "rgba(255,255,255,0.08)"
      : "#ffffff",
  borderRadius: 16,
  padding: "clamp(14px, 3vw, 18px)",
  backdropFilter: "blur(10px)",
  color:
    index === 0
      ? "white"
      : "#0f172a",
  minWidth: 0,
  boxSizing: "border-box",
});

/* ================= RANK ================= */

const rank = {
  position: "absolute",
  top: -10,
  right: -8,
  background: "#1e40af",
  color: "white",
  padding: "6px 12px",
  borderRadius: 20,
  fontWeight: 800,
  fontSize: 13,
  zIndex: 2,
};

const topRank = {
  background: "#2563eb",
};

/* ================= TOP BADGE ================= */

const badge = {
  position: "absolute",
  top: -10,
  left: -8,
  background: "#1e3a8a",
  color: "white",
  padding: "6px 12px",
  borderRadius: 20,
  fontWeight: 800,
  fontSize: 13,
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  gap: 5,
};

/* ================= PROFILE ================= */

const profile = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const profileInfo = {
  minWidth: 0,
  flex: 1,
};

const employeeName = {
  margin: 0,
  fontSize: "clamp(16px, 3vw, 19px)",
  fontWeight: 800,
  overflowWrap: "anywhere",
};

const avatar = {
  width: 55,
  height: 55,
  minWidth: 55,
  borderRadius: "50%",
  background:
    "linear-gradient(135deg,#1e40af,#020617)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  color: "white",
  fontSize: 18,
  flexShrink: 0,
};

const topAvatar = {
  background:
    "linear-gradient(135deg,#2563eb,#020617)",
};

const email = {
  margin: "4px 0 0",
  fontSize: 12,
  overflowWrap: "anywhere",
};

/* ================= DIVIDER ================= */

const divider = (index) => ({
  height: 1,
  background:
    index === 0
      ? "rgba(255,255,255,0.2)"
      : "rgba(0,0,0,0.08)",
  margin: "16px 0",
});

/* ================= REVENUE ================= */

const revenueBox = {
  textAlign: "center",
  width: "100%",
};

const revenueLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
};

const revenueAmount = {
  margin: "6px 0 0",
  fontSize: "clamp(22px, 5vw, 28px)",
  fontWeight: 900,
  overflowWrap: "anywhere",
};

/* ================= WATER SOLD ================= */

const extraBox = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px solid rgba(148,163,184,0.2)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  fontSize: 13,
};

const waterLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

/* ================= LOADING ================= */

const loadingIcon = {
  display: "flex",
  justifyContent: "center",
  color: "#1e3a8a",
};

const loadingText = {
  color: "#475569",
  fontWeight: 600,
};

/* ================= CENTER ================= */

const center = {
  textAlign: "center",
  marginTop: 50,
  color: "#475569",
};

/* ================= ERROR ================= */

const errorBox = {
  width: "100%",
  maxWidth: 500,
  margin: "40px auto",
  padding: 25,
  boxSizing: "border-box",
  textAlign: "center",
  background: "#ffffff",
  border: "1px solid #bfdbfe",
  borderRadius: 16,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
};

const errorIcon = {
  display: "flex",
  justifyContent: "center",
  color: "#dc2626",
};

const errorText = {
  color: "#1e3a8a",
  fontWeight: 600,
  lineHeight: 1.5,
};

/* ================= EMPTY ================= */

const emptyBox = {
  width: "100%",
  maxWidth: 500,
  margin: "40px auto",
  padding: 30,
  boxSizing: "border-box",
  textAlign: "center",
  background: "#ffffff",
  borderRadius: 18,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
};

const emptyIcon = {
  display: "flex",
  justifyContent: "center",
  color: "#1e40af",
};

const emptyTitle = {
  margin: "12px 0 6px",
  color: "#0f172a",
};

const emptyText = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.5,
};

/* ================= BUTTON ================= */

const button = {
  marginTop: 10,
  padding: "11px 18px",
  border: "none",
  background:
    "linear-gradient(135deg,#1e40af,#020617)",
  color: "white",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};