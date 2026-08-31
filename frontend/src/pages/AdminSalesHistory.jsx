import React, {
  useContext,
  useEffect,
  useState
} from "react";

import {
  BarChart3,
  RefreshCw,
  Pencil,
  Trash2,
  Save,
  X,
  AlertTriangle,
  ClipboardList
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = `${import.meta.env.VITE_API_URL}/water-sales`;

export default function AdminSalesHistory() {

  const { theme } = useContext(ThemeContext);

  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem("token");


  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(amount || 0);


  /* =========================================================
     LOAD SALES
  ========================================================= */

  const loadSales = async () => {

    try {

      setLoading(true);

      const res = await fetch(`${API}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      console.log("SALES:", data);

      const salesData = Array.isArray(data)
        ? data
        : [];

      setSales(salesData);
      setFiltered(salesData);

    } catch (error) {

      console.error(error);

      alert("Failed to load sales");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadSales();

  }, []);


  /* =========================================================
     DELETE SALE
  ========================================================= */

  const deleteSale = async () => {

    try {

      const res = await fetch(`${API}/${deleting}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setDeleting(null);

      loadSales();

    } catch (error) {

      console.error(error);

      alert("Failed to delete sale");

    }

  };


  /* =========================================================
     UPDATE SALE
  ========================================================= */

  const updateSale = async () => {

    try {

      const res = await fetch(`${API}/${editing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editing,
          totalSold: Number(editing.totalSold),
          revenue: Number(editing.revenue)
        })
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      setEditing(null);

      loadSales();

    } catch (error) {

      console.error(error);

      alert("Failed to update sale");

    }

  };


  /* =========================================================
     SEARCH + DATE FILTER
  ========================================================= */

  useEffect(() => {

    let result = [...sales];

    if (search.trim()) {

      const query = search.toLowerCase().trim();

      result = result.filter((s) =>
        s.employee?.name
          ?.toLowerCase()
          .includes(query)
      );

    }

    if (date) {

      result = result.filter((s) => {

        const saleDate = new Date(s.date);

        const selectedDate = new Date(`${date}T00:00:00`);

        return (
          saleDate.getFullYear() ===
            selectedDate.getFullYear() &&
          saleDate.getMonth() ===
            selectedDate.getMonth() &&
          saleDate.getDate() ===
            selectedDate.getDate()
        );

      });

    }

    setFiltered(result);

  }, [search, date, sales]);


  /* =========================================================
     TOTAL REVENUE
  ========================================================= */

  const totalRevenue = filtered.reduce(
    (sum, s) =>
      sum + Number(s.revenue || 0),
    0
  );


  /* =========================================================
     TOTAL LITRES
  ========================================================= */

  const totalLitres = filtered.reduce(
    (sum, s) => {

      let liters = 0;

      if (Number(s.totalSold) > 0) {

        liters = Number(s.totalSold);

      } else if (
        Number(s.closingReading) >
        Number(s.openingReading)
      ) {

        liters =
          Number(s.closingReading) -
          Number(s.openingReading);

      } else if (
        s.items?.length > 0
      ) {

        liters =
          s.items.reduce(
            (itemTotal, item) =>
              itemTotal +
              Number(item.quantity || 0),
            0
          );

      }

      return sum + liters;

    },
    0
  );


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div style={center(theme)}>

        <div style={loadingBox(theme)}>

          <div style={spinner(theme)} />

          <span>
            Loading Sales History...
          </span>

        </div>

      </div>
    );

  }


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div style={page(theme)}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={header}>

        <div>

          <h1 style={title(theme)}>

            <BarChart3
              size={28}
              strokeWidth={2.3}
              style={{
                verticalAlign: "middle",
                marginRight: 8
              }}
            />

            Sales History

          </h1>

          <p style={subtitle(theme)}>
            View and manage all recorded sales
          </p>

        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div style={summaryGrid}>

        <div style={summaryCard(theme)}>

          <div style={summaryLabel}>
            Total Revenue
          </div>

          <div style={totalText}>
            {formatMoney(totalRevenue)}
          </div>

        </div>


        <div style={summaryCard(theme)}>

          <div style={summaryLabel}>
            Water Sold
          </div>

          <div style={totalText}>
            {totalLitres.toLocaleString()} L
          </div>

        </div>


        <div style={summaryCard(theme)}>

          <div style={summaryLabel}>
            Sales Records
          </div>

          <div style={totalText}>
            {filtered.length}
          </div>

        </div>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div style={card(theme)}>

        <div style={filterHeader(theme)}>

          <h3 style={filterTitle(theme)}>
            Search & Filter
          </h3>

        </div>

        <div style={filterRow}>

          <div style={filterField}>

            <label style={label(theme)}>
              Employee
            </label>

            <input
              style={input(theme)}
              placeholder="Search employee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div style={filterField}>

            <label style={label(theme)}>
              Date
            </label>

            <input
              style={input(theme)}
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

          </div>


          <div style={filterButtonWrapper}>

            <button
              style={refreshBtn(theme)}
              onClick={loadSales}
              title="Refresh sales"
            >

              <RefreshCw
                size={17}
                strokeWidth={2.2}
              />

              <span>
                Refresh
              </span>

            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          SALES TABLE
      ===================================================== */}

      <div style={card(theme)}>

        <div style={tableHeaderRow}>

          <div>

            <h3 style={tableTitle(theme)}>
              Sales Records
            </h3>

            <p style={recordCount(theme)}>
              Showing {filtered.length} record
              {filtered.length === 1 ? "" : "s"}
            </p>

          </div>

        </div>


        {filtered.length === 0 ? (

          <div style={emptyState(theme)}>

            <div style={emptyIcon(theme)}>

              <ClipboardList
                size={46}
                strokeWidth={1.7}
              />

            </div>

            <h3 style={emptyTitle(theme)}>
              No sales found
            </h3>

            <p style={emptyText(theme)}>
              No sales match your current search or date filter.
            </p>

          </div>

        ) : (

          <div style={tableWrapper}>

            <table style={table}>

              <thead style={thead(theme)}>

                <tr>

                  <th style={th}>
                    Employee
                  </th>

                  <th style={th}>
                    Meter
                  </th>

                  <th style={th}>
                    Water
                  </th>

                  <th style={th}>
                    Revenue
                  </th>

                  <th style={th}>
                    Date
                  </th>

                  <th style={th}>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filtered.map((s, index) => {

                  /* ==========================================
                     METER
                  ========================================== */

                  const meterDisplay =
                    s.meter?.meterNumber ||
                    (s.items?.length
                      ? "POS"
                      : "N/A");


                  /* ==========================================
                     LITERS
                  ========================================== */

                  let liters = 0;

                  if (
                    Number(s.totalSold) > 0
                  ) {

                    liters =
                      Number(s.totalSold);

                  } else if (
                    Number(s.closingReading) >
                    Number(s.openingReading)
                  ) {

                    liters =
                      Number(s.closingReading) -
                      Number(s.openingReading);

                  } else if (
                    s.items?.length > 0
                  ) {

                    liters =
                      s.items.reduce(
                        (sum, i) =>
                          sum +
                          Number(i.quantity || 0),
                        0
                      );

                  }


                  return (

                    <tr
                      key={s._id}
                      style={
                        index % 2 === 0
                          ? row(theme)
                          : rowAlt(theme)
                      }
                    >

                      {/* EMPLOYEE */}

                      <td style={td(theme)}>

                        <div style={employeeCell}>

                          <div style={employeeAvatar(theme)}>
                            {(s.employee?.name ||
                              "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span>
                            {s.employee?.name ||
                              "Unknown"}
                          </span>

                        </div>

                      </td>


                      {/* METER */}

                      <td style={td(theme)}>

                        <span style={meterBadge(theme)}>
                          {meterDisplay}
                        </span>

                      </td>


                      {/* WATER */}

                      <td style={td(theme)}>

                        <strong>
                          {liters > 0
                            ? `${liters.toLocaleString()} L`
                            : "0 L"}
                        </strong>

                      </td>


                      {/* REVENUE */}

                      <td style={td(theme)}>

                        <strong style={revenueText}>
                          {formatMoney(s.revenue)}
                        </strong>

                      </td>


                      {/* DATE */}

                      <td style={td(theme)}>

                        {new Date(
                          s.date
                        ).toLocaleDateString(
                          "en-ZA",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          }
                        )}

                      </td>


                      {/* ACTIONS */}

                      <td style={actionCell(theme)}>

                        <button
                          style={editBtn}
                          onClick={() =>
                            setEditing({
                              ...s
                            })
                          }
                          title="Edit sale"
                        >

                          <Pencil
                            size={16}
                            strokeWidth={2.2}
                          />

                          <span>
                            Edit
                          </span>

                        </button>


                        <button
                          style={deleteBtn}
                          onClick={() =>
                            setDeleting(s._id)
                          }
                          title="Delete sale"
                        >

                          <Trash2
                            size={16}
                            strokeWidth={2.2}
                          />

                          <span>
                            Delete
                          </span>

                        </button>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (

        <div
          style={modal}
          onClick={(e) => {

            if (e.target === e.currentTarget) {
              setEditing(null);
            }

          }}
        >

          <div style={modalBox(theme)}>

            <div style={modalHeader}>

              <div>

                <h3 style={modalTitle(theme)}>

                  <Pencil
                    size={20}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7
                    }}
                  />

                  Edit Sale

                </h3>

                <p style={modalSubtitle(theme)}>
                  Update the sale information
                </p>

              </div>


              <button
                style={modalClose(theme)}
                onClick={() =>
                  setEditing(null)
                }
                title="Close"
              >

                <X
                  size={18}
                  strokeWidth={2.2}
                />

              </button>

            </div>


            <div style={modalForm}>

              <div>

                <label style={label(theme)}>
                  Total Water Sold (Litres)
                </label>

                <input
                  style={modalInput(theme)}
                  type="number"
                  min="0"
                  value={
                    editing.totalSold ?? ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      totalSold:
                        e.target.value
                    })
                  }
                />

              </div>


              <div>

                <label style={label(theme)}>
                  Revenue
                </label>

                <input
                  style={modalInput(theme)}
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editing.revenue ?? ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      revenue:
                        e.target.value
                    })
                  }
                />

              </div>

            </div>


            <div style={modalActions}>

              <button
                style={saveBtn}
                onClick={updateSale}
              >

                <Save
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  Save Changes
                </span>

              </button>


              <button
                style={cancelBtn}
                onClick={() =>
                  setEditing(null)
                }
              >

                <X
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  Cancel
                </span>

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleting && (

        <div
          style={modal}
          onClick={(e) => {

            if (e.target === e.currentTarget) {
              setDeleting(null);
            }

          }}
        >

          <div style={modalBox(theme)}>

            <div style={modalHeader}>

              <div>

                <h3 style={modalTitle(theme)}>

                  <AlertTriangle
                    size={20}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7,
                      color: "#dc2626"
                    }}
                  />

                  Confirm Delete

                </h3>

                <p style={modalSubtitle(theme)}>
                  This action cannot be undone.
                </p>

              </div>


              <button
                style={modalClose(theme)}
                onClick={() =>
                  setDeleting(null)
                }
                title="Close"
              >

                <X
                  size={18}
                  strokeWidth={2.2}
                />

              </button>

            </div>


            <div style={deleteWarning(theme)}>

              <p style={modalText(theme)}>
                Are you sure you want to delete
                this sale?
              </p>

              <p style={warningSmall(theme)}>
                The sale will be permanently removed
                from the sales history.
              </p>

            </div>


            <div style={modalActions}>

              <button
                style={deleteConfirmBtn}
                onClick={deleteSale}
              >

                <Trash2
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  Yes, Delete
                </span>

              </button>


              <button
                style={cancelBtn}
                onClick={() =>
                  setDeleting(null)
                }
              >

                <X
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  Cancel
                </span>

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "clamp(12px, 3vw, 25px)",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});


const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 15,
  marginBottom: 20,
};


const title = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
});


const subtitle = (theme) => ({
  margin: "6px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 14,
});


/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 15,
  width: "100%",
  marginBottom: 20,
};


const summaryCard = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: "clamp(16px, 3vw, 22px)",
  borderRadius: 18,
  boxShadow: "0 8px 25px rgba(0,0,0,.12)",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
});


const summaryLabel = {
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.9,
};


const totalText = {
  fontSize: "clamp(24px, 5vw, 30px)",
  fontWeight: 700,
  margin: "8px 0 0",
  wordBreak: "break-word",
};


/* =========================================================
   CARDS
========================================================= */

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: "clamp(15px, 3vw, 20px)",
  borderRadius: 18,
  marginBottom: 20,
  border: `1px solid ${theme.border}`,
  boxShadow: "0 10px 30px rgba(15,23,42,.08)",
  width: "100%",
  boxSizing: "border-box",
});


/* =========================================================
   FILTERS
========================================================= */

const filterHeader = (theme) => ({
  marginBottom: 15,
});


const filterTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 18,
});


const filterRow = {
  display: "grid",
  gridTemplateColumns:
    "minmax(200px, 1fr) minmax(180px, 220px) auto",
  gap: 12,
  alignItems: "end",
  width: "100%",
};


const filterField = {
  width: "100%",
  minWidth: 0,
};


const label = (theme) => ({
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: theme.textSecondary || theme.text,
});


const input = (theme) => ({
  width: "100%",
  minWidth: 0,
  padding: 12,
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  background: theme.input || theme.card,
  color: theme.text,
  boxSizing: "border-box",
  minHeight: 44,
});


const filterButtonWrapper = {
  display: "flex",
  width: "100%",
};


const refreshBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: "12px 18px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  minWidth: 110,
  minHeight: 44,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
});


/* =========================================================
   TABLE
========================================================= */

const tableHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15,
};


const tableTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
});


const recordCount = (theme) => ({
  margin: "4px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 13,
});


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
  overscrollBehaviorX: "contain",
};


const table = {
  width: "100%",
  minWidth: 760,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});


const th = {
  padding: 14,
  textAlign: "left",
  whiteSpace: "nowrap",
  fontWeight: 600,
  color: "white",
  fontSize: 14,
};


const td = (theme) => ({
  padding: 14,
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
  fontSize: 14,
});


const row = (theme) => ({
  background: theme.card,
});


const rowAlt = (theme) => ({
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
});


const employeeCell = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};


const employeeAvatar = (theme) => ({
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.primary,
  color: "white",
  fontWeight: 700,
  fontSize: 13,
});


const meterBadge = (theme) => ({
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 8,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border: `1px solid ${theme.border}`,
  fontSize: 12,
  fontWeight: 600,
  color: theme.text,
});


const revenueText = {
  color: "#16a34a",
};


const actionCell = (theme) => ({
  ...td(theme),
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
});


const editBtn = {
  background: "#2563eb",
  color: "white",
  padding: "9px 13px",
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 38,
  minWidth: 70,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  padding: "9px 13px",
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 38,
  minWidth: 70,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


/* =========================================================
   EMPTY STATE
========================================================= */

const emptyState = (theme) => ({
  textAlign: "center",
  padding: "clamp(35px, 8vw, 60px) 20px",
  color: theme.textSecondary || theme.text,
});


const emptyIcon = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: theme.primary,
  marginBottom: 10,
});


const emptyTitle = (theme) => ({
  margin: 0,
  color: theme.text,
});


const emptyText = (theme) => ({
  margin: "8px 0 0",
  fontSize: 14,
});


/* =========================================================
   MODALS
========================================================= */

const modal = {
  position: "fixed",
  inset: 0,
  padding: 15,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  boxSizing: "border-box",
  overflowY: "auto",
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: "clamp(18px, 5vw, 25px)",
  borderRadius: 18,
  width: "100%",
  maxWidth: 430,
  display: "flex",
  flexDirection: "column",
  gap: 15,
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  maxHeight: "90vh",
  overflowY: "auto",
});


const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
};


const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 20,

  display: "flex",
  alignItems: "center",
});


const modalSubtitle = (theme) => ({
  margin: "5px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 13,
});


const modalClose = (theme) => ({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: "50%",
  border: `1px solid ${theme.border}`,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.text,
  cursor: "pointer",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const modalForm = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};


const modalInput = (theme) => ({
  width: "100%",
  padding: 12,
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  background: theme.input || theme.card,
  color: theme.text,
  boxSizing: "border-box",
  minHeight: 44,
});


const deleteWarning = (theme) => ({
  padding: 15,
  borderRadius: 10,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border: `1px solid ${theme.border}`,
});


const modalText = (theme) => ({
  color: theme.text,
  margin: 0,
  fontWeight: 600,
});


const warningSmall = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: "8px 0 0",
  fontSize: 13,
});


const modalActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  width: "100%",
};


const saveBtn = {
  background: "#16a34a",
  color: "white",
  padding: 11,
  border: "none",
  borderRadius: 9,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  minWidth: 130,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


const deleteConfirmBtn = {
  background: "#dc2626",
  color: "white",
  padding: 11,
  border: "none",
  borderRadius: 9,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  minWidth: 130,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


const cancelBtn = {
  background: "#6b7280",
  color: "white",
  padding: 11,
  border: "none",
  borderRadius: 9,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  minWidth: 110,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


/* =========================================================
   LOADING
========================================================= */

const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
  color: theme.text,
  background: "transparent",
});


const loadingBox = (theme) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  color: theme.text,
  fontWeight: 600,
});


const spinner = (theme) => ({
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: `3px solid ${theme.border}`,
  borderTopColor: theme.primary,
  animation: "spin 0.8s linear infinite",
});