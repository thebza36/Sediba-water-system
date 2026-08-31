import React, { useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import API from "../api/axios";
import { saveAs } from "file-saver";
import { ThemeContext } from "../context/ThemeContext";

import {
  BarChart3,
  Pencil,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Printer,
  Trash2,
  Save,
  X,
  Droplets,
  Banknote,
  ShoppingCart,
  CalendarDays,
} from "lucide-react";


const Reports = () => {

  const { theme } = useContext(ThemeContext);

  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);


  /* =========================================================
     GET LITERS
  ========================================================= */

  const getLiters = (s) => {

    if (s.totalSold > 0) return s.totalSold;

    if (s.closingReading > s.openingReading) {
      return s.closingReading - s.openingReading;
    }

    if (s.items?.length > 0) {
      return s.items.reduce(
        (sum, i) => sum + (i.quantity || 0),
        0
      );
    }

    return 0;
  };


  /* =========================================================
     FETCH
  ========================================================= */

  const fetchSales = async () => {

    try {

      setLoading(true);

      const res = await API.get("/water-sales");

      const data = res.data;

      setSales(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);

    } catch (err) {

      console.error(err);
      alert("Failed to load reports");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {
    fetchSales();
  }, []);


  /* =========================================================
     FILTER
  ========================================================= */

  useEffect(() => {

    let data = [...sales];

    if (search) {

      data = data.filter(
        (s) =>
          (s.employee?.name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      );

    }

    if (fromDate) {

      data = data.filter(
        (s) => new Date(s.date) >= new Date(fromDate)
      );

    }

    if (toDate) {

      data = data.filter(
        (s) => new Date(s.date) <= new Date(toDate)
      );

    }

    setFiltered(data);

  }, [search, fromDate, toDate, sales]);


  /* =========================================================
     DELETE
  ========================================================= */

  const deleteSale = async () => {

    try {

      await API.delete(`/water-sales/${deleting}`);

      setDeleting(null);

      fetchSales();

    } catch (err) {

      console.error(err);

      alert("Failed to delete sale");

    }

  };


  /* =========================================================
     EDIT
  ========================================================= */

  const updateSale = async () => {

    try {

      await API.put(
        `/water-sales/${editing._id}`,
        editing
      );

      setEditing(null);

      fetchSales();

    } catch (err) {

      console.error(err);

      alert("Failed to update sale");

    }

  };


  /* =========================================================
     TOTALS
  ========================================================= */

  const totalWater = filtered.reduce(
    (s, x) => s + getLiters(x),
    0
  );

  const totalRevenue = filtered.reduce(
    (s, x) => s + (x.revenue || 0),
    0
  );

  const totalSales = filtered.length;

  const today = new Date().toDateString();

  const todaySales = filtered.filter(
    (s) =>
      new Date(s.date).toDateString() === today
  );

  const todayRevenue = todaySales.reduce(
    (s, x) => s + (x.revenue || 0),
    0
  );


  /* =========================================================
     CURRENCY
  ========================================================= */

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n || 0);


  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const exportCSV = () => {

    const rows = filtered.map((s) => ({
      Employee: s.employee?.name || "-",
      Water: getLiters(s),
      Revenue: s.revenue || 0,
      Date: new Date(s.date).toLocaleDateString(),
    }));

    const csv =
      "Employee,Water,Revenue,Date\n" +
      rows
        .map(
          (r) =>
            `${r.Employee},${r.Water},${r.Revenue},${r.Date}`
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "report.csv";

    link.click();

    URL.revokeObjectURL(link.href);

  };


  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

  const exportExcel = () => {

    const rows = filtered.map((s) => ({
      Employee: s.employee?.name || "-",
      Water: getLiters(s),
      Revenue: s.revenue || 0,
      Date: new Date(s.date).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Sales"
    );

    const file = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([file]),
      "report.xlsx"
    );

  };


  /* =========================================================
     UI
  ========================================================= */

  return (

    <div style={page(theme)}>

      <h1 style={title(theme)}>

        <BarChart3
          size={30}
          strokeWidth={2.2}
          style={{
            verticalAlign: "middle",
            marginRight: 9,
          }}
        />

        Reports Dashboard

      </h1>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div style={filters}>

        <input
          style={input(theme)}
          placeholder="Search employee..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <input
          style={input(theme)}
          type="date"
          value={fromDate}
          onChange={(e) =>
            setFromDate(e.target.value)
          }
        />

        <input
          style={input(theme)}
          type="date"
          value={toDate}
          onChange={(e) =>
            setToDate(e.target.value)
          }
        />

        <button
          style={refreshBtn(theme)}
          onClick={fetchSales}
        >

          <RefreshCw
            size={17}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />

          Refresh

        </button>

      </div>


      {loading && (

        <div style={loadingText(theme)}>

          <RefreshCw
            size={18}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
              animation: "spin 1s linear infinite",
            }}
          />

          Loading...

        </div>

      )}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div style={grid}>

        <div style={cardBlue(theme)}>

          <h3>

            <Banknote
              size={20}
              style={{
                verticalAlign: "middle",
                marginRight: 7,
              }}
            />

            Total Revenue

          </h3>

          <div style={big}>
            {currency(totalRevenue)}
          </div>

        </div>


        <div style={cardBlue(theme)}>

          <h3>

            <Droplets
              size={20}
              style={{
                verticalAlign: "middle",
                marginRight: 7,
              }}
            />

            Water Sold

          </h3>

          <div style={big}>
            {totalWater} L
          </div>

        </div>


        <div style={cardBlue(theme)}>

          <h3>

            <ShoppingCart
              size={20}
              style={{
                verticalAlign: "middle",
                marginRight: 7,
              }}
            />

            Total Sales

          </h3>

          <div style={big}>
            {totalSales}
          </div>

        </div>

      </div>


      {/* =====================================================
          TODAY'S PERFORMANCE
      ===================================================== */}

      <div style={todayBox(theme)}>

        <h3 style={todayTitle(theme)}>

          <CalendarDays
            size={20}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />

          Today's Performance

        </h3>

        <div style={grid}>

          <div style={miniCard(theme)}>

            <p style={miniLabel(theme)}>
              Sales Today
            </p>

            <h2 style={miniValue(theme)}>
              {todaySales.length}
            </h2>

          </div>


          <div style={miniCard(theme)}>

            <p style={miniLabel(theme)}>
              Revenue Today
            </p>

            <h2 style={miniValue(theme)}>
              {currency(todayRevenue)}
            </h2>

          </div>

        </div>

      </div>


      {/* =====================================================
          SALES RECORDS
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>

          <FileText
            size={20}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />

          Sales Records

        </h3>

        <div style={tableWrapper}>

          <table style={table}>

            <thead style={thead(theme)}>

              <tr>

                <th style={th(theme)}>
                  Employee
                </th>

                <th style={th(theme)}>
                  Meter
                </th>

                <th style={th(theme)}>
                  Water
                </th>

                <th style={th(theme)}>
                  Revenue
                </th>

                <th style={th(theme)}>
                  Date
                </th>

                <th style={th(theme)}>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.map((s) => (

                <tr
                  key={s._id}
                  style={row(theme)}
                >

                  <td style={td(theme)}>
                    {s.employee?.name || "Unknown"}
                  </td>


                  <td style={td(theme)}>

                    {s.meter?.meterNumber ||
                      (s.items?.length
                        ? "POS"
                        : "-")}

                  </td>


                  <td style={td(theme)}>
                    {getLiters(s)} L
                  </td>


                  <td style={td(theme)}>
                    {currency(s.revenue)}
                  </td>


                  <td style={td(theme)}>
                    {new Date(
                      s.date
                    ).toLocaleDateString()}
                  </td>


                  <td
                    style={{
                      ...td(theme),
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >

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
                        style={{
                          verticalAlign: "middle",
                          marginRight: 5,
                        }}
                      />

                      Edit

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
                        style={{
                          verticalAlign: "middle",
                          marginRight: 5,
                        }}
                      />

                      Delete

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          EXPORT BUTTONS
      ===================================================== */}

      <div style={btnRow}>

        <button
          style={btn(theme)}
          onClick={exportCSV}
        >

          <FileText
            size={17}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />

          CSV

        </button>


        <button
          style={btn(theme)}
          onClick={exportExcel}
        >

          <FileSpreadsheet
            size={17}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />

          Excel

        </button>


        <button
          style={btn(theme)}
          onClick={() => window.print()}
        >

          <Printer
            size={17}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />

          Print

        </button>

      </div>


      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (

        <div style={modal}>

          <div style={modalBox(theme)}>

            <h3 style={modalTitle(theme)}>

              <Pencil
                size={20}
                strokeWidth={2.2}
                style={{
                  verticalAlign: "middle",
                  marginRight: 7,
                }}
              />

              Edit Sale

            </h3>


            <input
              style={input(theme)}
              type="number"
              placeholder="Water Sold (L)"
              value={editing.totalSold || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  totalSold:
                    Number(e.target.value),
                })
              }
            />


            <input
              style={input(theme)}
              type="number"
              placeholder="Revenue"
              value={editing.revenue || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  revenue:
                    Number(e.target.value),
                })
              }
            />


            <div style={modalActions}>

              <button
                style={saveBtn}
                onClick={updateSale}
              >

                <Save
                  size={17}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                />

                Save Changes

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
                  style={{
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                />

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleting && (

        <div style={modal}>

          <div style={modalBox(theme)}>

            <h3 style={modalTitle(theme)}>

              <AlertTriangle
                size={21}
                strokeWidth={2.2}
                style={{
                  verticalAlign: "middle",
                  marginRight: 7,
                }}
              />

              Confirm Delete

            </h3>


            <p style={modalText(theme)}>
              Are you sure you want to delete
              this sale?
            </p>


            <div style={modalActions}>

              <button
                style={deleteConfirmBtn}
                onClick={deleteSale}
              >

                <Trash2
                  size={17}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                />

                Yes, Delete

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
                  style={{
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                />

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default Reports;


/* =========================================================
   STYLES
========================================================= */


const page = (theme) => ({
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "0 15px 30px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});


const title = (theme) => ({
  fontSize: "clamp(22px, 5vw, 30px)",
  fontWeight: 700,
  marginBottom: 20,
  color: theme.primary,
  display: "flex",
  alignItems: "center",
});


const filters = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 20,
  width: "100%",
};


const input = (theme) => ({
  flex: 1,
  minWidth: 180,
  padding: 12,
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: theme.input || theme.card,
  color: theme.text,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
});


const refreshBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: "12px 18px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  minWidth: 120,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const loadingText = (theme) => ({
  color: theme.textSecondary || theme.text,
  padding: 10,
  display: "flex",
  alignItems: "center",
});


const grid = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
  width: "100%",
};


const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  marginTop: 20,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  width: "100%",
});


const cardBlue = (theme) => ({
  flex: 1,
  minWidth: 220,
  padding: 25,
  borderRadius: 16,
  background:
    `linear-gradient(135deg, ${theme.primary}, #1e3a8a)`,
  color: "white",
  boxSizing: "border-box",
});


const big = {
  fontSize: 28,
  fontWeight: 700,
};


const todayBox = (theme) => ({
  marginTop: 30,
  padding: 20,
  background: theme.tableHeader || theme.card,
  color: theme.text,
  borderRadius: 14,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});


const todayTitle = (theme) => ({
  marginTop: 0,
  color: theme.text,
  display: "flex",
  alignItems: "center",
});


const miniCard = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 15,
  borderRadius: 10,
  flex: 1,
  minWidth: 180,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});


const miniLabel = (theme) => ({
  color: theme.textSecondary || theme.text,
  marginTop: 0,
});


const miniValue = (theme) => ({
  color: theme.text,
  marginBottom: 0,
});


const sectionTitle = (theme) => ({
  marginTop: 0,
  color: theme.text,
  fontSize: 19,
  display: "flex",
  alignItems: "center",
});


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
};


const table = {
  width: "100%",
  minWidth: 700,
  borderCollapse: "collapse",
  marginTop: 15,
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});


const th = (theme) => ({
  padding: 14,
  textAlign: "left",
  whiteSpace: "nowrap",
  color: "white",
  fontWeight: 600,
});


const td = (theme) => ({
  padding: 14,
  borderBottom: `1px solid ${theme.border}`,
  whiteSpace: "nowrap",
  color: theme.text,
});


const row = (theme) => ({
  background: theme.card,
  color: theme.text,
});


const btnRow = {
  marginTop: 20,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  width: "100%",
};


const btn = (theme) => ({
  padding: "12px 18px",
  border: "none",
  borderRadius: 10,
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  flex: 1,
  minWidth: 120,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  fontWeight: 600,
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: 15,
  boxSizing: "border-box",
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 25,
  borderRadius: 16,
  width: "100%",
  maxWidth: 360,
  display: "flex",
  flexDirection: "column",
  gap: 15,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});


const modalTitle = (theme) => ({
  marginTop: 0,
  marginBottom: 0,
  color: theme.text,
  display: "flex",
  alignItems: "center",
});


const modalText = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: 0,
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
  padding: 10,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const deleteConfirmBtn = {
  background: "#dc2626",
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const cancelBtn = {
  background: "#6b7280",
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const editBtn = {
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};