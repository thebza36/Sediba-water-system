import React, { useContext, useEffect, useState } from "react";
import {
  FileText,
  DollarSign,
  Droplets,
  BarChart3,
  Search,
  RefreshCw,
  X,
  ShoppingCart,
  Receipt,
  Gauge
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const API = `${import.meta.env.VITE_API_URL}/sales-history`;

export default function EmployeeMySales() {
  const { theme } = useContext(ThemeContext);

  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [date, setDate] = useState("");
  const [meterSearch, setMeterSearch] = useState("");

  const [loading, setLoading] = useState(true);

  /* =========================================================
     MONEY FORMAT
  ========================================================= */

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount) || 0);
  };

  /* =========================================================
     LOAD SALES
  ========================================================= */

  const loadSales = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/my-sales`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      setSales(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadSales();
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  useEffect(() => {
    let result = [...sales];

    if (date) {
      result = result.filter(
        (s) =>
          new Date(s.createdAt).toLocaleDateString() ===
          new Date(date).toLocaleDateString()
      );
    }

    if (meterSearch) {
      result = result.filter((s) =>
        (s.meter?.meterNumber || "")
          .toLowerCase()
          .includes(meterSearch.toLowerCase())
      );
    }

    setFiltered(result);
  }, [date, meterSearch, sales]);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setDate("");
    setMeterSearch("");
    setFiltered(sales);
  };

  /* =========================================================
     TOTALS
  ========================================================= */

  const totalRevenue = filtered.reduce(
    (sum, s) => sum + Number(s.revenue || 0),
    0
  );

  const totalLiters = filtered.reduce(
    (sum, s) => sum + Number(s.totalSold || 0),
    0
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          ...center,
          color: theme.text,
          background: theme.background
        }}
      >
        <RefreshCw
          size={22}
          style={loadingIcon}
        />
        <span>Loading sales...</span>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div style={page(theme)}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={header}>

        <div style={titleIcon(theme)}>
          <FileText size={22} strokeWidth={2.2} />
        </div>

        <div style={titleContent}>

          <h1 style={title(theme)}>
            My Sales History
          </h1>

          <p style={subtitle(theme)}>
            Review your sales records, revenue and water usage.
          </p>

        </div>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div style={summaryGrid}>

        {/* TOTAL REVENUE */}

        <div style={summaryCard(theme)}>

          <div style={summaryIcon}>
            <DollarSign size={19} strokeWidth={2.2} />
          </div>

          <div style={summaryTitle}>
            Total Revenue
          </div>

          <div style={totalText}>
            R {formatMoney(totalRevenue)}
          </div>

          <div style={summarySubtext}>
            Filtered sales
          </div>

        </div>

        {/* TOTAL WATER */}

        <div style={summaryCard(theme)}>

          <div style={summaryIcon}>
            <Droplets size={19} strokeWidth={2.2} />
          </div>

          <div style={summaryTitle}>
            Total Water Sold
          </div>

          <div style={totalText}>
            {totalLiters} L
          </div>

          <div style={summarySubtext}>
            Filtered sales
          </div>

        </div>

        {/* TOTAL SALES */}

        <div style={summaryCard(theme)}>

          <div style={summaryIcon}>
            <BarChart3 size={19} strokeWidth={2.2} />
          </div>

          <div style={summaryTitle}>
            Total Sales
          </div>

          <div style={totalText}>
            {filtered.length}
          </div>

          <div style={summarySubtext}>
            Records found
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div style={filterCard(theme)}>

        <div style={filterHeader}>

          <div style={filterTitleRow}>

            <div style={filterIcon(theme)}>
              <Search size={18} strokeWidth={2.2} />
            </div>

            <div>

              <h3 style={sectionTitle(theme)}>
                Sales Filters
              </h3>

              <p style={sectionSubtitle(theme)}>
                Filter your sales history
              </p>

            </div>

          </div>

        </div>

        <div style={filterGrid}>

          {/* DATE */}

          <div style={filterGroup}>

            <label style={label(theme)}>
              Date
            </label>

            <div style={inputWrapper(theme)}>

              <input
                type="date"
                style={input(theme)}
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />

            </div>

          </div>

          {/* METER SEARCH */}

          <div style={filterGroup}>

            <label style={label(theme)}>
              Search Meter
            </label>

            <div style={inputWrapper(theme)}>

              <Search
                size={16}
                color={theme.textSecondary}
              />

              <input
                type="text"
                placeholder="Meter number..."
                style={searchInput(theme)}
                value={meterSearch}
                onChange={(e) =>
                  setMeterSearch(e.target.value)
                }
              />

            </div>

          </div>

          {/* REFRESH */}

          <button
            style={refreshBtn(theme)}
            onClick={loadSales}
          >
            <RefreshCw size={17} />
            <span>Refresh</span>
          </button>

          {/* CLEAR */}

          <button
            style={clearBtn(theme)}
            onClick={clearFilters}
          >
            <X size={17} />
            <span>Clear</span>
          </button>

        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div style={tableCard(theme)}>

        {/* TABLE HEADER */}

        <div style={tableHeader}>

          <div style={tableTitleRow}>

            <div style={tableIcon(theme)}>
              <Receipt size={18} strokeWidth={2.2} />
            </div>

            <div>

              <h3 style={sectionTitle(theme)}>
                Sales Records
              </h3>

              <p style={sectionSubtitle(theme)}>
                Showing {filtered.length} sales record
                {filtered.length !== 1 ? "s" : ""}
              </p>

            </div>

          </div>

        </div>

        {filtered.length === 0 ? (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div style={empty(theme)}>

            <div style={emptyIcon(theme)}>
              <ShoppingCart
                size={34}
                strokeWidth={1.8}
              />
            </div>

            <div style={emptyTitle(theme)}>
              No sales found
            </div>

            <div style={emptyText(theme)}>
              Try changing your filters or refresh the page.
            </div>

          </div>

        ) : (

          /* =================================================
             RESPONSIVE TABLE
          ================================================= */

          <div style={tableWrapper}>

            <table style={table}>

              <thead>

                <tr style={thead(theme)}>

                  <th style={th(theme)}>
                    Type
                  </th>

                  <th style={th(theme)}>
                    Liters
                  </th>

                  <th style={th(theme)}>
                    Revenue
                  </th>

                  <th style={th(theme)}>
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {filtered.map((s) => (

                  <tr
                    key={s._id}
                    style={row(theme)}
                  >

                    {/* TYPE */}

                    <td style={td(theme)}>

                      {s.meter?.meterNumber ? (

                        <span
                          style={meterBadge(theme)}
                        >
                          <Gauge size={13} />
                          {s.meter.meterNumber}
                        </span>

                      ) : (

                        <span
                          style={posBadge(theme)}
                        >
                          <ShoppingCart size={13} />
                          POS Sale
                        </span>

                      )}

                    </td>

                    {/* LITERS */}

                    <td style={td(theme)}>

                      {s.totalSold
                        ? `${s.totalSold} L`
                        : "-"}

                    </td>

                    {/* REVENUE */}

                    <td
                      style={{
                        ...td(theme),
                        fontWeight: 700
                      }}
                    >

                      <span style={revenue(theme)}>
                        R {formatMoney(s.revenue)}
                      </span>

                    </td>

                    {/* DATE */}

                    <td style={td(theme)}>

                      {new Date(
                        s.createdAt
                      ).toLocaleDateString()}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

const page = (theme) => ({
  width: "100%",
  minHeight: "100vh",
  padding: "clamp(10px, 3vw, 30px)",
  boxSizing: "border-box",
  color: theme.text,
  background: "transparent",
  overflowX: "hidden"
});

/* =========================================================
   HEADER
========================================================= */

const header = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  marginBottom: 25,
  width: "100%",
  boxSizing: "border-box"
};

const titleIcon = (theme) => ({
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.darkMode
    ? "rgba(255,255,255,.10)"
    : "#e0f2fe",
  border: theme.darkMode
    ? "1px solid rgba(255,255,255,.12)"
    : "1px solid #bae6fd",
  color: theme.primary,
  boxSizing: "border-box",
  boxShadow: theme.darkMode
    ? "0 3px 10px rgba(0,0,0,.20)"
    : "0 3px 10px rgba(14,116,144,.12)"
});

const titleContent = {
  minWidth: 0,
  flex: 1
};

/* =========================================================
   TITLE
========================================================= */

const title = (theme) => ({
  margin: 0,
  fontSize: "clamp(24px, 5vw, 32px)",
  lineHeight: 1.2,
  fontWeight: 800,
  color: theme.darkMode
    ? "#f8fafc"
    : "#0f172a",
  letterSpacing: "-0.5px",
  wordBreak: "break-word"
});

const subtitle = (theme) => ({
  margin: "7px 0 0",
  color: theme.darkMode
    ? "#cbd5e1"
    : "#64748b",
  fontSize: 14,
  lineHeight: 1.5,
  maxWidth: 700
});

/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  width: "100%",
  marginBottom: 25
};

const summaryCard = (theme) => ({
  background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
  color: "#ffffff",
  padding: 20,
  borderRadius: 16,
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  boxShadow: "0 8px 20px rgba(37,99,235,.20)"
});

const summaryIcon = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "rgba(255,255,255,.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  marginBottom: 12
};

const summaryTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(255,255,255,.85)"
};

const totalText = {
  fontSize: "clamp(24px, 6vw, 32px)",
  fontWeight: 800,
  marginTop: 6,
  lineHeight: 1.2,
  wordBreak: "break-word",
  color: "#ffffff"
};

const summarySubtext = {
  marginTop: 7,
  fontSize: 12,
  color: "rgba(255,255,255,.7)"
};

/* =========================================================
   FILTER CARD
========================================================= */

const filterCard = (theme) => ({
  background: theme.card,
  border: `1px solid ${theme.border}`,
  padding: "clamp(15px, 3vw, 20px)",
  borderRadius: 16,
  boxShadow: "0 6px 18px rgba(0,0,0,.06)",
  marginBottom: 25,
  boxSizing: "border-box",
  width: "100%"
});

const filterHeader = {
  marginBottom: 16
};

const filterTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: 11
};

const filterIcon = (theme) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.cardSecondary,
  color: theme.primary,
  border: `1px solid ${theme.border}`
});

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  width: "100%",
  alignItems: "end"
};

const filterGroup = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  width: "100%"
};

const label = (theme) => ({
  fontWeight: 600,
  marginBottom: 6,
  color: theme.text,
  fontSize: 13
});

const input = (theme) => ({
  width: "100%",
  minWidth: 0,
  padding: "12px 13px",
  border: `1px solid ${theme.border}`,
  borderRadius: 9,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
  background: theme.input,
  color: theme.text
});

const inputWrapper = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  minWidth: 0,
  padding: "0 12px",
  border: `1px solid ${theme.border}`,
  borderRadius: 9,
  background: theme.input,
  boxSizing: "border-box"
});

const searchInput = (theme) => ({
  flex: 1,
  width: "100%",
  minWidth: 0,
  padding: "12px 0",
  border: "none",
  outline: "none",
  background: "transparent",
  color: theme.text,
  fontSize: 15,
  boxSizing: "border-box"
});

/* =========================================================
   BUTTONS
========================================================= */

const refreshBtn = (theme) => ({
  width: "100%",
  minWidth: 0,
  background: theme.primary,
  color: "#ffffff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8
});

const clearBtn = (theme) => ({
  width: "100%",
  minWidth: 0,
  background: theme.cardSecondary,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  padding: "12px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8
});

/* =========================================================
   SECTION TITLES
========================================================= */

const sectionTitle = (theme) => ({
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: theme.text
});

const sectionSubtitle = (theme) => ({
  margin: "5px 0 0",
  color: theme.textSecondary,
  fontSize: 13
});

/* =========================================================
   TABLE CARD
========================================================= */

const tableCard = (theme) => ({
  background: theme.card,
  border: `1px solid ${theme.border}`,
  padding: "clamp(15px, 3vw, 20px)",
  borderRadius: 16,
  boxShadow: "0 8px 22px rgba(0,0,0,.07)",
  boxSizing: "border-box",
  width: "100%",
  overflow: "hidden"
});

const tableHeader = {
  marginBottom: 18
};

const tableTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: 11
};

const tableIcon = (theme) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.cardSecondary,
  color: theme.primary,
  border: `1px solid ${theme.border}`
});

/* =========================================================
   TABLE
========================================================= */

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch"
};

const table = {
  width: "100%",
  minWidth: 560,
  borderCollapse: "collapse"
};

const thead = (theme) => ({
  background: theme.cardSecondary
});

const th = (theme) => ({
  padding: "12px 10px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 13,
  color: theme.text,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${theme.border}`
});

const td = (theme) => ({
  padding: "13px 10px",
  fontSize: 14,
  color: theme.text,
  borderTop: `1px solid ${theme.border}`,
  whiteSpace: "nowrap"
});

const row = (theme) => ({
  transition: "background .2s"
});

/* =========================================================
   BADGES
========================================================= */

const meterBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: theme.darkMode
    ? "rgba(59,130,246,.20)"
    : "#dbeafe",
  color: theme.darkMode
    ? "#93c5fd"
    : "#1e3a8a",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600
});

const posBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: theme.darkMode
    ? "rgba(245,158,11,.18)"
    : "#fef3c7",
  color: theme.darkMode
    ? "#fbbf24"
    : "#92400e",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600
});

const revenue = (theme) => ({
  color: theme.primary
});

/* =========================================================
   EMPTY STATE
========================================================= */

const empty = (theme) => ({
  padding: "40px 20px",
  textAlign: "center",
  background: theme.cardSecondary,
  borderRadius: 12,
  color: theme.textSecondary
});

const emptyIcon = (theme) => ({
  width: 52,
  height: 52,
  margin: "0 auto 12px",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.input,
  color: theme.primary,
  border: `1px solid ${theme.border}`
});

const emptyTitle = (theme) => ({
  fontSize: 16,
  fontWeight: 700,
  color: theme.text
});

const emptyText = (theme) => ({
  marginTop: 5,
  fontSize: 13,
  color: theme.textSecondary
});

/* =========================================================
   LOADING
========================================================= */

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  minHeight: "60vh",
  width: "100%",
  fontSize: 18,
  boxSizing: "border-box"
};

const loadingIcon = {
  animation: "employeeSalesSpin 1s linear infinite"
};