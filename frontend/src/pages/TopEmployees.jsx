import { useEffect, useRef, useState } from "react";

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
      maximumFractionDigits: 2
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
        return;
      }

      const data = await res.json();

      // ✅ SAFE SORT (always rank by revenue)
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) =>
          (b.totalRevenue || b.revenue || 0) -
          (a.totalRevenue || a.revenue || 0)
      );

      setTopEmployees(sorted);

      // 🔍 DEBUG (remove later if you want)
      console.log("TOP EMPLOYEES:", sorted);

    } catch (err) {
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
      <h1 style={title}>🏆 Top Employees</h1>
      <p style={subtitle}>Live performance leaderboard</p>

      {loading && <p style={center}>Loading leaderboard...</p>}

      {!loading && error && (
        <div style={errorBox}>
          <p>{error}</p>
          <button onClick={fetchTopEmployees} style={button}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && topEmployees.length === 0 && (
        <p style={center}>No employees found</p>
      )}

      {!loading && !error && topEmployees.length > 0 && (
        <div style={grid}>
          {topEmployees.map((emp, index) => {

            const initials = emp.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            /* ✅ FIX: HANDLE ANY BACKEND FIELD */
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

            return (
              <div
                key={emp._id || index}
                style={{
                  ...card,
                  ...(index === 0 ? topCard : {}),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px rgba(15,23,42,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    index === 0 ? "scale(1.05)" : "scale(1)";
                  e.currentTarget.style.boxShadow =
                    index === 0
                      ? "0 0 50px rgba(2,6,23,0.7)"
                      : "0 10px 25px rgba(0,0,0,0.08)";
                }}
              >
                {/* RANK */}
                <div style={rank}>#{index + 1}</div>

                {/* TOP BADGE */}
                {index === 0 && <div style={badge}>🏆 TOP</div>}

                <div style={innerCard(index)}>
                  <div style={profile}>
                    <div style={avatar}>{initials}</div>
                    <div>
                      <h3 style={{ margin: 0 }}>{emp.name}</h3>
                      <p style={email}>{emp.email}</p>
                    </div>
                  </div>

                  <div style={divider(index)} />

                  {/* REVENUE */}
                  <div style={revenueBox}>
                    <span style={{ fontSize: "13px", opacity: 0.8 }}>
                      Total Revenue
                    </span>
                    <h2 style={{ margin: "5px 0" }}>
                      {formatMoney(revenue)}
                    </h2>
                  </div>

                  {/* ✅ WATER SOLD (FIXED) */}
                  <div style={extraBox}>
                    <span>Water Sold</span>
                    <strong>{waterSold} L</strong>
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

/* ======================= STYLES ======================= */

const container = {
  minHeight: "100vh",
  padding: "40px",
  fontFamily: "Segoe UI, sans-serif",
  background: "#f1f5f9",
  color: "#0f172a",
};

const title = {
  textAlign: "center",
  fontSize: "40px",
  fontWeight: "900",
  marginBottom: "5px",
  background: "linear-gradient(135deg,#0284c7,#1e3a8a)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitle = {
  textAlign: "center",
  color: "#64748b",
  marginBottom: "40px",
};

const center = {
  textAlign: "center",
  marginTop: "40px",
};

const grid = {
  display: "grid",
  gap: "30px",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
};

const card = {
  position: "relative",
  padding: "15px",
  borderRadius: "20px",
  background: "#ffffff",
  transition: "all 0.35s ease",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const topCard = {
  background: "linear-gradient(135deg,#1e3a8a,#020617)",
  color: "white",
  transform: "scale(1.05)",
  boxShadow: "0 0 50px rgba(2,6,23,0.8)",
};

const innerCard = (index) => ({
  background: index === 0 ? "rgba(255,255,255,0.08)" : "#ffffff",
  borderRadius: "16px",
  padding: "15px",
  backdropFilter: "blur(10px)",
  color: index === 0 ? "white" : "#0f172a",
});

const rank = {
  position: "absolute",
  top: "-12px",
  right: "-12px",
  background: "#1e40af",
  color: "white",
  padding: "6px 12px",
  borderRadius: "20px",
  fontWeight: "bold",
};

const badge = {
  position: "absolute",
  top: "-12px",
  left: "-12px",
  background: "#1e3a8a",
  color: "white",
  padding: "6px 12px",
  borderRadius: "20px",
  fontWeight: "bold",
};

const profile = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const avatar = {
  width: "55px",
  height: "55px",
  borderRadius: "50%",
  background: "linear-gradient(135deg,#1e40af,#020617)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  color: "white",
  fontSize: "18px",
};

const email = {
  margin: 0,
  fontSize: "12px",
  opacity: 0.7,
};

const divider = (index) => ({
  height: "1px",
  background: index === 0 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
  margin: "15px 0",
});

const revenueBox = {
  textAlign: "center",
};

const extraBox = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  fontSize: "13px",
  opacity: 0.8,
};

const button = {
  marginTop: "10px",
  padding: "10px 16px",
  border: "none",
  background: "linear-gradient(135deg,#1e40af,#020617)",
  color: "white",
  borderRadius: "10px",
  cursor: "pointer",
};

const errorBox = {
  textAlign: "center",
  background: "rgba(30,64,175,0.1)",
  border: "1px solid rgba(30,64,175,0.4)",
  padding: "15px",
  borderRadius: "10px",
  color: "#1e3a8a",
};