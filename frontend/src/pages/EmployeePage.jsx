import React, { useEffect, useState } from "react";
import SalesAnalytics from "../components/SalesAnalytics";

export default function EmployeePage() {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const API = import.meta.env.VITE_API_URL;

  const [sales, setSales] = useState([]);
  const [meters, setMeters] = useState([]);
  const [stats, setStats] = useState({});
  const [topEmployees, setTopEmployees] = useState([]);

  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const [salesRes, metersRes, statsRes, topRes] = await Promise.all([
        fetch(`${API}/water-sales/my-sales`, { headers }),
        fetch(`${API}/meters`, { headers }),
        fetch(`${API}/water-sales/my-stats`, { headers }),
        fetch(`${API}/water-sales/top-employees`, { headers })
      ]);

      const salesData = salesRes.ok ? await salesRes.json() : [];
      const meterData = metersRes.ok ? await metersRes.json() : [];
      const statsData = statsRes.ok ? await statsRes.json() : {};
      const topData = topRes.ok ? await topRes.json() : [];

      setSales(Array.isArray(salesData) ? salesData : []);
      setMeters(Array.isArray(meterData) ? meterData : []);
      setStats(statsData || {});
      setTopEmployees(Array.isArray(topData) ? topData : []);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(n || 0);

  /* ================= FILTER LOGIC ================= */

  const filteredSales = sales.filter((s) => {

    const isPOS = s.saleMode === "pos";

    if (filterType === "pos" && !isPOS) return false;
    if (filterType === "meter" && isPOS) return false;

    if (filterDate) {
      const d = new Date(s.date).toISOString().slice(0, 10);
      if (d !== filterDate) return false;
    }

    return true;
  });

  /* ================= TODAY ================= */

  const today = new Date().toDateString();

  const todaySales = sales.filter(
    s => new Date(s.date).toDateString() === today
  );

  const todayWater = todaySales.reduce((sum, s) => sum + (s.totalSold || 0), 0);
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.revenue || 0), 0);

  /* ================= METERS ================= */

  const myMeters = meters.filter((m) => {
    const emp = m.employee || m.assignedTo;
    return String(emp?._id || emp) === String(user?._id);
  });

  /* ================= 🔥 SMART RANK FIX ================= */

  const myRevenue = stats.monthRevenue || 0;

  let myRank = null;

  const foundIndex = topEmployees.findIndex(
    (e) => String(e._id) === String(user?._id)
  );

  if (foundIndex >= 0) {
    myRank = foundIndex + 1;
  } else {
    // 🔥 Estimate rank based on revenue
    const higher = topEmployees.filter(
      (e) => (e.totalRevenue || 0) > myRevenue
    ).length;

    myRank = higher + 1;
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (

    <div style={page}>

      <h1 style={title}>💧 Employee Sales Dashboard</h1>

      {/* STATS */}
      <div style={grid}>

        <div style={card}>
          <div style={cardTitle}>Total Sales</div>
          <div style={big}>{stats.totalSubmissionsThisMonth || 0}</div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Water Sold</div>
          <div style={big}>{stats.monthTotalSold || 0} L</div>
        </div>

        <div style={card}>
          <div style={cardTitle}>Revenue</div>
          <div style={big}>{currency(stats.monthRevenue)}</div>
        </div>

        <div style={card}>
          <div style={cardTitle}>My Meters</div>
          <div style={big}>{myMeters.length}</div>
        </div>

        <div style={card}>
          <div style={cardTitle}>My Position</div>
          <div style={big}>
            #{myRank}
          </div>
        </div>

      </div>

      {/* TODAY */}
      <div style={todayBox}>
        <h2 style={todayTitle}>Today's Performance</h2>

        <div style={grid}>

          <div style={miniCard}>
            <div style={miniTitle}>Sales Today</div>
            <div style={miniBig}>{todaySales.length}</div>
          </div>

          <div style={miniCard}>
            <div style={miniTitle}>Water Sold</div>
            <div style={miniBig}>{todayWater} L</div>
          </div>

          <div style={miniCard}>
            <div style={miniTitle}>Revenue</div>
            <div style={miniBig}>{currency(todayRevenue)}</div>
          </div>

        </div>
      </div>

      {/* FILTERS */}
      <div style={filterBox}>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={input}
        >
          <option value="all">All Sales</option>
          <option value="pos">POS Only</option>
          <option value="meter">Meter Only</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={input}
        />

        <button style={btn} onClick={load}>Refresh</button>

        <button
          style={clearBtn}
          onClick={() => {
            setFilterType("all");
            setFilterDate("");
          }}
        >
          Clear
        </button>

      </div>

      {/* TABLE */}
      <div style={tableCard}>

        <h3 style={{ marginBottom: 20 }}>Recent Sales</h3>

        {filteredSales.length === 0 ? (
          <div style={{ padding: 20, opacity: 0.6 }}>
            No matching sales.
          </div>
        ) : (

          <table style={table}>

            <thead>
              <tr style={headerRow}>
                <th style={th}>Type</th>
                <th style={th}>Units</th>
                <th style={th}>Revenue</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>

              {filteredSales.slice(0,10).map((s) => {

                const isPOS = s.saleMode === "pos";

                const units = isPOS
                  ? (s.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0)
                  : (s.totalSold || 0);

                return (
                  <tr key={s._id} style={row}>

                    <td style={td}>
                      <span style={isPOS ? posBadge : meterBadge}>
                        {isPOS ? "POS Sale" : "Meter"}
                      </span>
                    </td>

                    <td style={td}>
                      {isPOS ? `${units} item(s)` : `${units} L`}
                    </td>

                    <td style={revenue}>
                      {currency(s.revenue)}
                    </td>

                    <td style={td}>
                      {new Date(s.date).toLocaleDateString()}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );
}

/* ================= STYLES ================= */

const page = { width: "100%", paddingBottom: 30 };
const title = { fontSize: 30, fontWeight: 700, marginBottom: 30 };

const grid = { display: "flex", flexWrap: "wrap", gap: 20 };

const card = {
  flex: 1,
  minWidth: 220,
  padding: 25,
  borderRadius: 16,
  background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
  color: "white"
};

const cardTitle = { fontSize: 14 };
const big = { fontSize: 30, fontWeight: 700 };

const todayBox = { marginTop: 30, padding: 25, background: "#eff6ff", borderRadius: 16 };
const todayTitle = { marginBottom: 20 };

const miniCard = { flex: 1, minWidth: 200, background: "white", padding: 20, borderRadius: 12 };
const miniTitle = { fontSize: 13 };
const miniBig = { fontSize: 24, fontWeight: 700 };

const filterBox = {
  marginTop: 30,
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const btn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: 8
};

const clearBtn = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: 8
};

const tableCard = {
  marginTop: 30,
  background: "white",
  padding: 20,
  borderRadius: 16
};

const table = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 10px"
};

const headerRow = { background: "#eff6ff" };
const th = { textAlign: "left", padding: 12 };

const td = { padding: 12 };
const revenue = { padding: 12, fontWeight: 600 };

const row = {
  background: "#f8fafc",
  borderRadius: 10
};

const posBadge = {
  background: "#fde68a",
  padding: "5px 10px",
  borderRadius: 999
};

const meterBadge = {
  background: "#dbeafe",
  padding: "5px 10px",
  borderRadius: 999
};