import React, { useContext, useEffect, useState } from "react";
import {
  Droplets,
  BarChart3,
  Wallet,
  Gauge,
  Trophy,
  RefreshCw,
  Filter,
  CalendarDays,
  X,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

export default function EmployeePage() {
  const { theme } = useContext(ThemeContext);
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
        "Content-Type": "application/json",
      };

      const [salesRes, metersRes, statsRes, topRes] = await Promise.all([
        fetch(`${API}/water-sales/my-sales`, { headers }),
        fetch(`${API}/meters`, { headers }),
        fetch(`${API}/water-sales/my-stats`, { headers }),
        fetch(`${API}/water-sales/top-employees`, { headers }),
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
      currency: "ZAR",
    }).format(n || 0);

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

  const today = new Date().toDateString();

  const todaySales = sales.filter(
    (s) => new Date(s.date).toDateString() === today
  );

  const todayWater = todaySales.reduce(
    (sum, s) => sum + (s.totalSold || 0),
    0
  );

  const todayRevenue = todaySales.reduce(
    (sum, s) => sum + (s.revenue || 0),
    0
  );

  const myMeters = meters.filter((m) => {
    const emp = m.employee || m.assignedTo;
    return String(emp?._id || emp) === String(user?._id);
  });

  const myRevenue = stats.monthRevenue || 0;

  let myRank = null;

  const foundIndex = topEmployees.findIndex(
    (e) => String(e._id) === String(user?._id)
  );

  if (foundIndex >= 0) {
    myRank = foundIndex + 1;
  } else {
    const higher = topEmployees.filter(
      (e) => (e.totalRevenue || 0) > myRevenue
    ).length;
    myRank = higher + 1;
  }

  if (loading) {
    return (
      <div style={center(theme)}>
        <div style={loadingBox(theme)}>
          <RefreshCw size={22} style={loadingIcon} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setFilterType("all");
    setFilterDate("");
  };

  const hasFilters = filterType !== "all" || filterDate !== "";

  return (
    <div style={page(theme)}>
      {/* DASHBOARD HEADING */}
      <div style={dashboardHeading}>
        <div style={dashboardHeadingIcon(theme)}>
          <Droplets size={28} strokeWidth={2.2} />
        </div>
        <div style={headerContent}>
          <h1 style={dashboardTitle(theme)}>Employee Sales Dashboard</h1>
          <p style={dashboardSubtitle(theme)}>
            Monitor your sales, water usage, meters and performance.
          </p>
        </div>
      </div>

      {/* MAIN STATS */}
      <div style={statsGrid}>
        <div style={blueStatCard(theme)}>
          <div style={blueStatIcon}><BarChart3 size={19} /></div>
          <div style={blueStatTitle}>Total Sales</div>
          <div style={blueStatNumber}>
            {stats.totalSubmissionsThisMonth || 0}
          </div>
          <div style={blueStatSubtitle}>This month</div>
        </div>

        <div style={blueStatCard(theme)}>
          <div style={blueStatIcon}><Droplets size={19} /></div>
          <div style={blueStatTitle}>Water Sold</div>
          <div style={blueStatNumber}>
            {stats.monthTotalSold || 0} L
          </div>
          <div style={blueStatSubtitle}>This month</div>
        </div>

        <div style={blueStatCard(theme)}>
          <div style={blueStatIcon}><Wallet size={19} /></div>
          <div style={blueStatTitle}>Revenue</div>
          <div style={blueStatNumber}>
            {currency(stats.monthRevenue)}
          </div>
          <div style={blueStatSubtitle}>This month</div>
        </div>

        <div style={blueStatCard(theme)}>
          <div style={blueStatIcon}><Gauge size={19} /></div>
          <div style={blueStatTitle}>My Meters</div>
          <div style={blueStatNumber}>{myMeters.length}</div>
          <div style={blueStatSubtitle}>Assigned to you</div>
        </div>

        <div style={blueStatCard(theme)}>
          <div style={blueStatIcon}><Trophy size={19} /></div>
          <div style={blueStatTitle}>My Position</div>
          <div style={blueStatNumber}>#{myRank}</div>
          <div style={blueStatSubtitle}>Employee ranking</div>
        </div>
      </div>

      {/* TODAY'S PERFORMANCE */}
      <div style={card(theme)}>
        <div style={sectionHeader}>
          <div style={sectionIcon(theme)}>
            <Activity size={19} />
          </div>
          <div>
            <h2 style={sectionTitle(theme)}>Today's Performance</h2>
            <p style={sectionSubtitle(theme)}>Your activity for today</p>
          </div>
        </div>

        <div style={performanceGrid}>
          <div style={performanceCard(theme)}>
            <div style={performanceLabel(theme)}>Sales Today</div>
            <div style={performanceNumber(theme)}>
              {todaySales.length}
            </div>
          </div>

          <div style={performanceCard(theme)}>
            <div style={performanceLabel(theme)}>Water Sold</div>
            <div style={performanceNumber(theme)}>
              {todayWater} L
            </div>
          </div>

          <div style={performanceCard(theme)}>
            <div style={performanceLabel(theme)}>Revenue</div>
            <div style={{ ...performanceNumber(theme), color: theme.primary }}>
              {currency(todayRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={card(theme)}>
        <div style={sectionHeader}>
          <div style={sectionIcon(theme)}>
            <Filter size={18} />
          </div>
          <div>
            <h3 style={sectionTitle(theme)}>Sales Filters</h3>
            <p style={sectionSubtitle(theme)}>Filter your recent sales</p>
          </div>
        </div>

        <div style={filterGrid}>
          <div style={inputWrapper}>
            <label style={inputLabel(theme)}>Sale Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={inputStyle(theme)}
            >
              <option value="all">All Sales</option>
              <option value="pos">POS Only</option>
              <option value="meter">Meter Only</option>
            </select>
          </div>

          <div style={inputWrapper}>
            <label style={inputLabel(theme)}>Date</label>
            <div style={dateInputWrapper(theme)}>
              <CalendarDays size={17} color={theme.textSecondary} />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={dateInput(theme)}
              />
            </div>
          </div>

          <button style={primaryButton(theme)} onClick={load}>
            <RefreshCw size={17} />
            <span>Refresh</span>
          </button>

          <button style={secondaryButton(theme)} onClick={clearFilters}>
            <X size={17} />
            <span>Clear Filters</span>
          </button>
        </div>

        {hasFilters && (
          <div style={filterStatus(theme)}>
            Showing <strong>{filteredSales.length}</strong> matching sale
            {filteredSales.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* RECENT SALES */}
      <div style={card(theme)}>
        <div style={sectionHeader}>
          <div style={sectionIcon(theme)}>
            <ShoppingCart size={18} />
          </div>
          <div>
            <h3 style={sectionTitle(theme)}>Recent Sales</h3>
            <p style={sectionSubtitle(theme)}>
              Showing your latest sales records
            </p>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div style={emptyState(theme)}>
            <ShoppingCart size={28} />
            <div>No matching sales.</div>
            {hasFilters && (
              <button
                style={emptyClearButton(theme)}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr style={tableHeader(theme)}>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Units</th>
                  <th style={thStyle}>Revenue</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.slice(0, 10).map((s) => {
                  const isPOS = s.saleMode === "pos";

                  const units = isPOS
                    ? s.items?.reduce(
                        (sum, i) => sum + (i.quantity || 0),
                        0
                      ) || 0
                    : s.totalSold || 0;

                  return (
                    <tr key={s._id} style={tableRow(theme)}>
                      <td style={tdStyle(theme)}>
                        <span
                          style={
                            isPOS ? posBadge : meterBadge(theme)
                          }
                        >
                          {isPOS ? (
                            <>
                              <ShoppingCart size={13} />
                              POS Sale
                            </>
                          ) : (
                            <>
                              <Gauge size={13} />
                              Meter
                            </>
                          )}
                        </span>
                      </td>

                      <td style={tdStyle(theme)}>
                        {isPOS ? `${units} item(s)` : `${units} L`}
                      </td>

                      <td
                        style={{
                          ...tdStyle(theme),
                          fontWeight: 700,
                          color: theme.primary,
                        }}
                      >
                        {currency(s.revenue)}
                      </td>

                      <td style={tdStyle(theme)}>
                        {new Date(s.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* PAGE */
const page = (theme) => ({
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "15px 15px 35px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});

/* DASHBOARD HEADING */
const dashboardHeading = {
  display: "flex",
  alignItems: "center",
  gap: 13,
  marginBottom: 25,
  padding: "5px 2px",
  width: "100%",
};

const dashboardHeadingIcon = (theme) => ({
  width: 48,
  height: 48,
  minWidth: 48,
  borderRadius: 13,
  background: theme.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(37,99,235,0.18)",
});

const headerContent = {
  minWidth: 0,
};

const dashboardTitle = (theme) => ({
  margin: 0,
  fontSize: "clamp(22px, 5vw, 30px)",
  fontWeight: 800,
  lineHeight: 1.2,
  color: theme.text,
  letterSpacing: "-0.3px",
});

const dashboardSubtitle = (theme) => ({
  margin: "6px 0 0",
  fontSize: 14,
  lineHeight: 1.5,
  color: theme.textSecondary || theme.text,
});

/* STATS */
const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 15,
  width: "100%",
};

const blueStatCard = (theme) => ({
  background: `linear-gradient(135deg, ${theme.primary}, #1e3a8a)`,
  color: "#ffffff",
  borderRadius: 14,
  padding: 18,
  boxSizing: "border-box",
  minWidth: 0,
  boxShadow: "0 5px 15px rgba(37,99,235,0.20)",
});

const blueStatIcon = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "rgba(255,255,255,0.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
  color: "#ffffff",
};

const blueStatTitle = {
  color: "rgba(255,255,255,0.85)",
  fontSize: 13,
  marginBottom: 6,
  fontWeight: 500,
};

const blueStatNumber = {
  color: "#ffffff",
  fontSize: "clamp(22px, 6vw, 30px)",
  fontWeight: 700,
  lineHeight: 1.2,
  wordBreak: "break-word",
};

const blueStatSubtitle = {
  color: "rgba(255,255,255,0.68)",
  fontSize: 12,
  marginTop: 6,
};

/* GENERAL CARDS */
const card = (theme) => ({
  marginTop: 25,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: 16,
  padding: 20,
  boxSizing: "border-box",
  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
  width: "100%",
  overflow: "hidden",
});

/* SECTION HEADER */
const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  marginBottom: 18,
};

const sectionIcon = (theme) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 10,
  background: theme.tableHeader || theme.cardSecondary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.primary,
  border: `1px solid ${theme.border}`,
});

const sectionTitle = (theme) => ({
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: theme.text,
});

const sectionSubtitle = (theme) => ({
  margin: "4px 0 0",
  fontSize: 13,
  color: theme.textSecondary || theme.text,
});

/* TODAY PERFORMANCE */
const performanceGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 15,
};

const performanceCard = (theme) => ({
  background: theme.cardSecondary || theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: 12,
  padding: 18,
  boxSizing: "border-box",
});

const performanceLabel = (theme) => ({
  color: theme.textSecondary || theme.text,
  fontSize: 13,
});

const performanceNumber = (theme) => ({
  marginTop: 6,
  fontSize: 25,
  fontWeight: 700,
  color: theme.text,
  wordBreak: "break-word",
});

/* FILTERS */
const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  alignItems: "end",
};

const inputWrapper = {
  width: "100%",
  minWidth: 0,
};

const inputLabel = (theme) => ({
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 600,
  color: theme.text,
});

const inputStyle = (theme) => ({
  width: "100%",
  minWidth: 0,
  minHeight: 44,
  padding: "11px 13px",
  borderRadius: 9,
  border: `1px solid ${theme.border}`,
  background: theme.input || theme.cardSecondary || theme.card,
  color: theme.text,
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
});

const dateInputWrapper = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  minHeight: 44,
  padding: "0 12px",
  borderRadius: 9,
  border: `1px solid ${theme.border}`,
  background: theme.input || theme.cardSecondary || theme.card,
  boxSizing: "border-box",
});

const dateInput = (theme) => ({
  flex: 1,
  width: "100%",
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  color: theme.text,
  fontSize: 14,
  padding: "11px 0",
});

const primaryButton = (theme) => ({
  width: "100%",
  minHeight: 44,
  padding: "11px 14px",
  borderRadius: 9,
  border: "none",
  background: theme.primary,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

const secondaryButton = (theme) => ({
  width: "100%",
  minHeight: 44,
  padding: "11px 14px",
  borderRadius: 9,
  border: `1px solid ${theme.border}`,
  background: theme.cardSecondary || theme.card,
  color: theme.text,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
});

const filterStatus = (theme) => ({
  marginTop: 14,
  padding: "9px 12px",
  borderRadius: 8,
  background: theme.tableHeader || theme.cardSecondary,
  color: theme.textSecondary || theme.text,
  fontSize: 12,
  border: `1px solid ${theme.border}`,
});

/* TABLE */
const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
};

const table = {
  width: "100%",
  minWidth: 600,
  borderCollapse: "collapse",
};

const tableHeader = (theme) => ({
  background: theme.tableHeader || theme.cardSecondary,
  color: theme.text,
});

const thStyle = {
  textAlign: "left",
  padding: "13px 12px",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tableRow = (theme) => ({
  borderBottom: `1px solid ${theme.border}`,
});

const tdStyle = (theme) => ({
  padding: "13px 12px",
  fontSize: 14,
  color: theme.text,
  whiteSpace: "nowrap",
});

const posBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: "#eab308",
  color: "#111827",
  whiteSpace: "nowrap",
};

const meterBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: theme.primary,
  color: "#ffffff",
  whiteSpace: "nowrap",
});

/* EMPTY STATE */
const emptyState = (theme) => ({
  padding: 35,
  textAlign: "center",
  color: theme.textSecondary || theme.text,
  background: theme.cardSecondary || theme.card,
  borderRadius: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: `1px solid ${theme.border}`,
});

const emptyClearButton = (theme) => ({
  marginTop: 4,
  border: "none",
  background: "transparent",
  color: theme.primary,
  fontWeight: 600,
  cursor: "pointer",
});

/* LOADING */
const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
  color: theme.text,
});

const loadingBox = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 16px",
  borderRadius: 10,
  background: theme.cardSecondary || theme.card,
  border: `1px solid ${theme.border}`,
  color: theme.text,
  fontWeight: 600,
});

const loadingIcon = {
  animation: "employeeDashboardSpin 1s linear infinite",
};