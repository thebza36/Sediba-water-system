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
  CreditCard,
  ShoppingCart,
  CalendarDays,
  User,
  Search,
  CalendarRange,
  Gauge,
  Receipt,
  CircleDollarSign,
  Database,
  CircleHelp,
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
    if (s.totalSold > 0) {
      return s.totalSold;
    }

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
     GET PAYMENT METHOD
  ========================================================= */

  const getPaymentMethod = (sale) => {
    const method =
      sale?.paymentMethod ||
      sale?.payment ||
      sale?.paymentType ||
      sale?.paymentMode ||
      "";

    const normalized = String(method)
      .toLowerCase()
      .trim();

    if (
      normalized === "cash" ||
      normalized === "cash payment"
    ) {
      return "CASH";
    }

    if (
      normalized === "speedpoint" ||
      normalized === "card" ||
      normalized === "credit card" ||
      normalized === "debit card"
    ) {
      return "CARD";
    }

    return "N/A";
  };

  /* =========================================================
     PAYMENT ICON
  ========================================================= */

  const PaymentIcon = ({
    method,
    size = 13,
  }) => {
    if (method === "CASH") {
      return <Banknote size={size} />;
    }

    if (method === "CARD") {
      return <CreditCard size={size} />;
    }

    return <CircleHelp size={size} />;
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
      data = data.filter((s) =>
        (s.employee?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (fromDate) {
      data = data.filter(
        (s) =>
          new Date(s.date) >=
          new Date(fromDate)
      );
    }

    if (toDate) {
      data = data.filter(
        (s) =>
          new Date(s.date) <=
          new Date(toDate)
      );
    }

    setFiltered(data);
  }, [
    search,
    fromDate,
    toDate,
    sales,
  ]);

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteSale = async () => {
    try {
      await API.delete(
        `/water-sales/${deleting}`
      );

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
      new Date(s.date).toDateString() ===
      today
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
      Meter:
        s.meter?.meterNumber ||
        (s.items?.length ? "POS" : "-"),
      PaymentType: getPaymentMethod(s),
      Water: getLiters(s),
      Revenue: s.revenue || 0,
      Date: new Date(
        s.date
      ).toLocaleDateString(),
    }));

    const csv =
      "Employee,Meter,Payment Type,Water,Revenue,Date\n" +
      rows
        .map(
          (r) =>
            `${r.Employee},${r.Meter},${r.PaymentType},${r.Water},${r.Revenue},${r.Date}`
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

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
      Meter:
        s.meter?.meterNumber ||
        (s.items?.length ? "POS" : "-"),
      PaymentType: getPaymentMethod(s),
      Water: getLiters(s),
      Revenue: s.revenue || 0,
      Date: new Date(
        s.date
      ).toLocaleDateString(),
    }));

    const ws =
      XLSX.utils.json_to_sheet(rows);

    const wb =
      XLSX.utils.book_new();

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
    <div
      className="admin-reports-page"
      style={page(theme)}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="reports-header">
        <div className="reports-title-wrap">
          <div
            className="reports-title-icon"
            style={{
              background: `${theme.primary}18`,
              color: theme.primary,
            }}
          >
            <BarChart3
              size={28}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h1 style={title(theme)}>
              Reports Dashboard
            </h1>

            <p style={subtitle(theme)}>
              Review sales performance, revenue
              and water sold.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div
        className="reports-filters"
        style={filtersCard(theme)}
      >
        <div className="filter-field">
          <label style={filterLabel(theme)}>
            <span className="label-with-icon">
              <User
                size={14}
                strokeWidth={2.2}
              />
              Employee
            </span>
          </label>

          <div className="input-with-icon">
            <Search
              className="field-icon"
              size={18}
              strokeWidth={2}
            />

            <input
              style={input(theme)}
              placeholder="Search employee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        <div className="filter-field">
          <label style={filterLabel(theme)}>
            <span className="label-with-icon">
              <CalendarRange
                size={14}
                strokeWidth={2.2}
              />
              From Date
            </span>
          </label>

          <div className="input-with-icon">
            <CalendarDays
              className="field-icon"
              size={18}
              strokeWidth={2}
            />

            <input
              style={input(theme)}
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />
          </div>
        </div>

        <div className="filter-field">
          <label style={filterLabel(theme)}>
            <span className="label-with-icon">
              <CalendarRange
                size={14}
                strokeWidth={2.2}
              />
              To Date
            </span>
          </label>

          <div className="input-with-icon">
            <CalendarDays
              className="field-icon"
              size={18}
              strokeWidth={2}
            />

            <input
              style={input(theme)}
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />
          </div>
        </div>

        <div className="filter-button-wrap">
          <button
            style={refreshBtn(theme)}
            onClick={fetchSales}
            type="button"
          >
            <RefreshCw
              size={17}
              strokeWidth={2.2}
            />

            Refresh Reports
          </button>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div style={loadingText(theme)}>
          <RefreshCw
            size={18}
            strokeWidth={2.2}
            style={{
              animation:
                "reportsSpin 1s linear infinite",
            }}
          />

          Loading reports...
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="summary-grid">
        <div
          className="summary-card"
          style={cardBlue(theme)}
        >
          <div className="summary-card-top">
            <div>
              <p style={summaryLabel}>
                <span className="summary-label-icon">
                  <CircleDollarSign
                    size={15}
                    strokeWidth={2.2}
                  />
                </span>

                Total Revenue
              </p>

              <div style={big}>
                {currency(totalRevenue)}
              </div>
            </div>

            <div className="summary-icon">
              <Banknote
                size={24}
                strokeWidth={2.2}
              />
            </div>
          </div>
        </div>

        <div
          className="summary-card"
          style={cardBlue(theme)}
        >
          <div className="summary-card-top">
            <div>
              <p style={summaryLabel}>
                <span className="summary-label-icon">
                  <Droplets
                    size={15}
                    strokeWidth={2.2}
                  />
                </span>

                Water Sold
              </p>

              <div style={big}>
                {totalWater} L
              </div>
            </div>

            <div className="summary-icon">
              <Droplets
                size={24}
                strokeWidth={2.2}
              />
            </div>
          </div>
        </div>

        <div
          className="summary-card"
          style={cardBlue(theme)}
        >
          <div className="summary-card-top">
            <div>
              <p style={summaryLabel}>
                <span className="summary-label-icon">
                  <Receipt
                    size={15}
                    strokeWidth={2.2}
                  />
                </span>

                Total Sales
              </p>

              <div style={big}>
                {totalSales}
              </div>
            </div>

            <div className="summary-icon">
              <ShoppingCart
                size={24}
                strokeWidth={2.2}
              />
            </div>
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
            strokeWidth={2.2}
          />

          Today's Performance
        </h3>

        <div className="today-grid">
          <div style={miniCard(theme)}>
            <p style={miniLabel(theme)}>
              <span className="mini-label-icon">
                <ShoppingCart
                  size={14}
                  strokeWidth={2.2}
                />
              </span>

              Sales Today
            </p>

            <h2 style={miniValue(theme)}>
              {todaySales.length}
            </h2>
          </div>

          <div style={miniCard(theme)}>
            <p style={miniLabel(theme)}>
              <span className="mini-label-icon">
                <Banknote
                  size={14}
                  strokeWidth={2.2}
                />
              </span>

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
        <div className="section-header">
          <h3 style={sectionTitle(theme)}>
            <FileText
              size={20}
              strokeWidth={2.2}
            />

            Sales Records
          </h3>

          <span style={recordCount(theme)}>
            <Database
              size={13}
              strokeWidth={2.2}
            />

            {filtered.length} record
            {filtered.length === 1
              ? ""
              : "s"}
          </span>
        </div>

        {/* ===================================================
            DESKTOP TABLE
        =================================================== */}

        <div className="desktop-sales-table">
          <div style={tableWrapper}>
            <table style={table}>
              <thead style={thead(theme)}>
                <tr>
                  <th style={th(theme)}>
                    <span className="table-heading">
                      <User
                        size={14}
                        strokeWidth={2.2}
                      />
                      Employee
                    </span>
                  </th>

                  <th style={th(theme)}>
                    <span className="table-heading">
                      <Gauge
                        size={14}
                        strokeWidth={2.2}
                      />
                      Meter
                    </span>
                  </th>

                  {/* PAYMENT TYPE */}
                  <th style={th(theme)}>
                    <span className="table-heading">
                      <CreditCard
                        size={14}
                        strokeWidth={2.2}
                      />
                      Payment Type
                    </span>
                  </th>

                  <th style={th(theme)}>
                    <span className="table-heading">
                      <Droplets
                        size={14}
                        strokeWidth={2.2}
                      />
                      Water
                    </span>
                  </th>

                  <th style={th(theme)}>
                    <span className="table-heading">
                      <Banknote
                        size={14}
                        strokeWidth={2.2}
                      />
                      Revenue
                    </span>
                  </th>

                  <th style={th(theme)}>
                    <span className="table-heading">
                      <CalendarDays
                        size={14}
                        strokeWidth={2.2}
                      />
                      Date
                    </span>
                  </th>

                  <th
                    style={{
                      ...th(theme),
                      textAlign: "center",
                    }}
                  >
                    <span className="table-heading table-heading-center">
                      <Pencil
                        size={14}
                        strokeWidth={2.2}
                      />
                      Action
                    </span>
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
                      <div className="employee-cell">
                        <div
                          className="employee-avatar"
                          style={{
                            background:
                              `${theme.primary}18`,
                            color:
                              theme.primary,
                          }}
                        >
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
                      <span
                        className="meter-badge"
                        style={{
                          background:
                            `${theme.primary}12`,
                          color:
                            theme.primary,
                        }}
                      >
                        <Gauge
                          size={13}
                          strokeWidth={2.2}
                        />

                        {s.meter
                          ?.meterNumber ||
                          (s.items?.length
                            ? "POS"
                            : "-")}
                      </span>
                    </td>

                    {/* PAYMENT TYPE */}
                    <td style={td(theme)}>
                      <span
                        style={paymentBadge(
                          theme,
                          getPaymentMethod(s)
                        )}
                      >
                        <PaymentIcon
                          method={getPaymentMethod(
                            s
                          )}
                          size={13}
                        />

                        {getPaymentMethod(s)}
                      </span>
                    </td>

                    {/* WATER */}
                    <td style={td(theme)}>
                      <strong className="table-value-with-icon">
                        <Droplets
                          size={15}
                          strokeWidth={2.2}
                        />

                        {getLiters(s)} L
                      </strong>
                    </td>

                    {/* REVENUE */}
                    <td style={td(theme)}>
                      <strong className="table-value-with-icon">
                        <Banknote
                          size={15}
                          strokeWidth={2.2}
                        />

                        {currency(s.revenue)}
                      </strong>
                    </td>

                    {/* DATE */}
                    <td style={td(theme)}>
                      <span className="table-date">
                        <CalendarDays
                          size={14}
                          strokeWidth={2.2}
                        />

                        {new Date(
                          s.date
                        ).toLocaleDateString()}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td
                      style={{
                        ...td(theme),
                        textAlign:
                          "center",
                      }}
                    >
                      <div className="action-buttons">
                        <button
                          style={editBtn}
                          onClick={() =>
                            setEditing({
                              ...s,
                            })
                          }
                          title="Edit sale"
                          type="button"
                        >
                          <Pencil
                            size={15}
                            strokeWidth={2.2}
                          />

                          Edit
                        </button>

                        <button
                          style={deleteBtn}
                          onClick={() =>
                            setDeleting(
                              s._id
                            )
                          }
                          title="Delete sale"
                          type="button"
                        >
                          <Trash2
                            size={15}
                            strokeWidth={2.2}
                          />

                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================
            MOBILE SALES CARDS
        =================================================== */}

        <div className="mobile-sales-list">
          {filtered.length === 0 ? (
            <div
              style={mobileEmpty(theme)}
            >
              <FileText
                size={34}
                strokeWidth={1.7}
              />

              <strong>
                No sales records
              </strong>

              <span>
                No records match your
                current filters.
              </span>
            </div>
          ) : (
            filtered.map((s) => (
              <div
                key={s._id}
                className="mobile-sale-card"
                style={{
                  background:
                    theme.card,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="mobile-sale-header">
                  <div className="employee-cell">
                    <div
                      className="employee-avatar"
                      style={{
                        background:
                          `${theme.primary}18`,
                        color:
                          theme.primary,
                      }}
                    >
                      {(s.employee?.name ||
                        "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="mobile-employee-info">
                      <strong
                        style={{
                          color:
                            theme.text,
                        }}
                      >
                        {s.employee?.name ||
                          "Unknown"}
                      </strong>

                      <div
                        className="mobile-sale-date"
                        style={{
                          color:
                            theme.textSecondary ||
                            theme.text,
                        }}
                      >
                        <CalendarDays
                          size={13}
                          strokeWidth={2.2}
                        />

                        {new Date(
                          s.date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <span
                    className="meter-badge"
                    style={{
                      background:
                        `${theme.primary}12`,
                      color:
                        theme.primary,
                    }}
                  >
                    <Gauge
                      size={13}
                      strokeWidth={2.2}
                    />

                    {s.meter
                      ?.meterNumber ||
                      (s.items?.length
                        ? "POS"
                        : "-")}
                  </span>
                </div>

                <div
                  className="mobile-sale-details"
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                >
                  {/* WATER */}
                  <div className="mobile-detail">
                    <span
                      style={mobileDetailLabel(
                        theme
                      )}
                    >
                      <Droplets
                        size={13}
                        strokeWidth={2.2}
                      />

                      Water Sold
                    </span>

                    <strong
                      style={mobileDetailValue(
                        theme
                      )}
                    >
                      {getLiters(s)} L
                    </strong>
                  </div>

                  {/* REVENUE */}
                  <div className="mobile-detail">
                    <span
                      style={mobileDetailLabel(
                        theme
                      )}
                    >
                      <Banknote
                        size={13}
                        strokeWidth={2.2}
                      />

                      Revenue
                    </span>

                    <strong
                      style={mobileDetailValue(
                        theme
                      )}
                    >
                      {currency(s.revenue)}
                    </strong>
                  </div>

                  {/* PAYMENT TYPE */}
                  <div className="mobile-detail mobile-payment-detail">
                    <span
                      style={mobileDetailLabel(
                        theme
                      )}
                    >
                      <CreditCard
                        size={13}
                        strokeWidth={2.2}
                      />

                      Payment Type
                    </span>

                    <strong
                      style={{
                        ...mobileDetailValue(
                          theme
                        ),
                        display:
                          "flex",
                        alignItems:
                          "center",
                      }}
                    >
                      <span
                        style={paymentBadge(
                          theme,
                          getPaymentMethod(
                            s
                          )
                        )}
                      >
                        <PaymentIcon
                          method={getPaymentMethod(
                            s
                          )}
                          size={13}
                        />

                        {getPaymentMethod(
                          s
                        )}
                      </span>
                    </strong>
                  </div>
                </div>

                <div className="mobile-sale-actions">
                  <button
                    style={editBtn}
                    onClick={() =>
                      setEditing({
                        ...s,
                      })
                    }
                    type="button"
                  >
                    <Pencil
                      size={16}
                      strokeWidth={2.2}
                    />

                    Edit Sale
                  </button>

                  <button
                    style={deleteBtn}
                    onClick={() =>
                      setDeleting(
                        s._id
                      )
                    }
                    type="button"
                  >
                    <Trash2
                      size={16}
                      strokeWidth={2.2}
                    />

                    Delete Sale
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length === 0 && (
          <div className="desktop-empty">
            <div
              style={emptyState(theme)}
            >
              <FileText
                size={40}
                strokeWidth={1.6}
              />

              <strong>
                No sales records found
              </strong>

              <span>
                Try changing your filters
                or date range.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          EXPORT BUTTONS
      ===================================================== */}

      <div className="export-grid">
        <button
          style={btn(theme)}
          onClick={exportCSV}
          type="button"
        >
          <FileText
            size={17}
            strokeWidth={2.2}
          />

          Export CSV
        </button>

        <button
          style={btn(theme)}
          onClick={exportExcel}
          type="button"
        >
          <FileSpreadsheet
            size={17}
            strokeWidth={2.2}
          />

          Export Excel
        </button>

        <button
          style={btn(theme)}
          onClick={() =>
            window.print()
          }
          type="button"
        >
          <Printer
            size={17}
            strokeWidth={2.2}
          />

          Print Report
        </button>
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (
        <div style={modal}>
          <div style={modalBox(theme)}>
            <div className="modal-heading">
              <div>
                <h3
                  style={modalTitle(theme)}
                >
                  <Pencil
                    size={20}
                    strokeWidth={2.2}
                  />

                  Edit Sale
                </h3>

                <p
                  style={modalSubtitle(
                    theme
                  )}
                >
                  Update the water sold and
                  revenue.
                </p>
              </div>

              <button
                className="modal-close"
                style={{
                  color:
                    theme.textSecondary ||
                    theme.text,
                  background:
                    theme.input ||
                    theme.tableHeader ||
                    theme.card,
                }}
                onClick={() =>
                  setEditing(null)
                }
                title="Close"
                type="button"
                aria-label="Close edit sale"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-field">
              <label
                style={filterLabel(
                  theme
                )}
              >
                <span className="label-with-icon">
                  <Droplets
                    size={14}
                    strokeWidth={2.2}
                  />
                  Water Sold (L)
                </span>
              </label>

              <div className="input-with-icon">
                <Droplets
                  className="field-icon"
                  size={18}
                  strokeWidth={2}
                />

                <input
                  style={input(theme)}
                  type="number"
                  min="0"
                  placeholder="Water Sold (L)"
                  value={
                    editing.totalSold ||
                    ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      totalSold:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-field">
              <label
                style={filterLabel(
                  theme
                )}
              >
                <span className="label-with-icon">
                  <Banknote
                    size={14}
                    strokeWidth={2.2}
                  />
                  Revenue
                </span>
              </label>

              <div className="input-with-icon">
                <Banknote
                  className="field-icon"
                  size={18}
                  strokeWidth={2}
                />

                <input
                  style={input(theme)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Revenue"
                  value={
                    editing.revenue ||
                    ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      revenue:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                style={saveBtn}
                onClick={updateSale}
                type="button"
              >
                <Save
                  size={17}
                  strokeWidth={2.2}
                />

                Save Changes
              </button>

              <button
                style={cancelBtn}
                onClick={() =>
                  setEditing(null)
                }
                type="button"
              >
                <X
                  size={17}
                  strokeWidth={2.2}
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
            <div className="modal-heading">
              <div>
                <h3
                  style={modalTitle(theme)}
                >
                  <AlertTriangle
                    size={21}
                    strokeWidth={2.2}
                  />

                  Confirm Delete
                </h3>

                <p
                  style={modalSubtitle(
                    theme
                  )}
                >
                  This action cannot be
                  undone.
                </p>
              </div>

              <button
                className="modal-close"
                style={{
                  color:
                    theme.textSecondary ||
                    theme.text,
                  background:
                    theme.input ||
                    theme.tableHeader ||
                    theme.card,
                }}
                onClick={() =>
                  setDeleting(null)
                }
                title="Close"
                type="button"
                aria-label="Close delete confirmation"
              >
                <X size={20} />
              </button>
            </div>

            <div className="delete-warning">
              <Trash2
                size={24}
                strokeWidth={2}
              />

              <p
                style={modalText(theme)}
              >
                Are you sure you want to
                delete this sale?
              </p>
            </div>

            <div className="modal-actions">
              <button
                style={deleteConfirmBtn}
                onClick={deleteSale}
                type="button"
              >
                <Trash2
                  size={17}
                  strokeWidth={2.2}
                />

                Yes, Delete
              </button>

              <button
                style={cancelBtn}
                onClick={() =>
                  setDeleting(null)
                }
                type="button"
              >
                <X
                  size={17}
                  strokeWidth={2.2}
                />

                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RESPONSIVE STYLES
      ===================================================== */}

      <style>
        {`
          @keyframes reportsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .admin-reports-page {
            width: 100%;
          }

          .reports-header {
            width: 100%;
            margin-bottom: 22px;
          }

          .reports-title-wrap {
            display: flex;
            align-items: center;
            gap: 13px;
            min-width: 0;
          }

          .reports-title-wrap > div:last-child {
            min-width: 0;
          }

          .reports-title-icon {
            width: 50px;
            height: 50px;
            border-radius: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .reports-filters {
            display: grid;
            grid-template-columns:
              minmax(200px, 1.5fr)
              minmax(160px, 1fr)
              minmax(160px, 1fr)
              auto;
            gap: 14px;
            align-items: end;
          }

          .filter-field {
            min-width: 0;
          }

          .filter-button-wrap {
            min-width: 145px;
          }

          .label-with-icon {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .input-with-icon {
            position: relative;
            width: 100%;
          }

          .input-with-icon input {
            padding-left: 42px !important;
          }

          .field-icon {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: ${theme.textSecondary || theme.text};
            pointer-events: none;
            z-index: 2;
          }

          .summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 18px;
            width: 100%;
          }

          .summary-card {
            min-width: 0;
          }

          .summary-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            min-width: 0;
          }

          .summary-card-top > div:first-child {
            min-width: 0;
          }

          .summary-label-icon {
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            margin-right: 5px;
          }

          .summary-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.14);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .today-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .mini-label-icon {
            display: inline-flex;
            align-items: center;
            margin-right: 5px;
            vertical-align: middle;
          }

          .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 4px;
          }

          .section-header h3 {
            margin-bottom: 0 !important;
          }

          .record-count {
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .table-heading {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .table-heading-center {
            justify-content: center;
            width: 100%;
          }

          .table-value-with-icon {
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .table-date {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .action-buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .employee-cell {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .employee-cell > span,
          .mobile-employee-info strong {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .employee-avatar {
            width: 36px;
            height: 36px;
            min-width: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
          }

          .meter-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
          }

          .mobile-sales-list {
            display: none;
          }

          .mobile-sale-card {
            border-radius: 13px;
            padding: 15px;
            width: 100%;
            box-sizing: border-box;
          }

          .mobile-sale-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            min-width: 0;
          }

          .mobile-employee-info {
            min-width: 0;
          }

          .mobile-sale-date {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 13px;
            margin-top: 4px;
          }

          .mobile-sale-details {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
            padding: 13px 0;
          }

          .mobile-payment-detail {
            grid-column: 1 / -1;
          }

          .mobile-detail {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 0;
          }

          .mobile-detail > span {
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .mobile-sale-actions {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 9px;
            margin-top: 13px;
          }

          .export-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 10px;
            margin-top: 20px;
          }

          .modal-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
          }

          .modal-close {
            border: none;
            width: 38px;
            height: 38px;
            border-radius: 9px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .modal-close:hover {
            opacity: 0.85;
          }

          .modal-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .delete-warning {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 13px;
            border-radius: 10px;
            background: rgba(220, 38, 38, 0.08);
            border: 1px solid rgba(220, 38, 38, 0.2);
            color: #dc2626;
          }

          .delete-warning p {
            flex: 1;
          }

          .desktop-empty {
            display: block;
          }

          .mobile-empty {
            display: none;
          }

          @media (max-width: 1100px) {
            .reports-filters {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .filter-button-wrap {
              min-width: 0;
            }

            .summary-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .summary-grid > :last-child {
              grid-column: 1 / -1;
            }

            .export-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .export-grid > :last-child {
              grid-column: 1 / -1;
            }
          }

          @media (max-width: 767px) {
            .reports-title-wrap {
              align-items: flex-start;
              gap: 10px;
            }

            .reports-title-icon {
              width: 44px;
              height: 44px;
              border-radius: 11px;
            }

            .reports-filters {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .filter-button-wrap {
              width: 100%;
            }

            .summary-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .summary-grid > :last-child {
              grid-column: auto;
            }

            .today-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .section-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 8px;
            }

            .desktop-sales-table {
              display: none;
            }

            .mobile-sales-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-top: 14px;
            }

            .desktop-empty {
              display: none;
            }

            .export-grid {
              grid-template-columns: 1fr;
              gap: 9px;
            }

            .export-grid > :last-child {
              grid-column: auto;
            }

            .modal {
              align-items: center !important;
              padding: 12px !important;
              overflow-y: auto;
            }

            .modal-actions {
              flex-direction: column !important;
            }

            .modal-actions button {
              width: 100%;
            }

            .admin-reports-page {
              padding-left: 10px !important;
              padding-right: 10px !important;
            }
          }

          @media (max-width: 500px) {
            .reports-title-icon {
              width: 40px;
              height: 40px;
            }

            .reports-title-wrap {
              gap: 9px;
            }

            .mobile-sale-header {
              align-items: flex-start;
            }

            .mobile-sale-header .meter-badge {
              font-size: 12px;
              padding: 5px 8px;
            }

            .employee-avatar {
              width: 34px;
              height: 34px;
              min-width: 34px;
            }

            .mobile-sale-details {
              gap: 8px;
            }

            .mobile-sale-actions {
              grid-template-columns: 1fr;
            }

            .summary-icon {
              width: 42px;
              height: 42px;
            }

            .summary-card {
              padding: 17px !important;
            }

            .todayBox {
              padding: 16px !important;
            }
          }

          @media (max-width: 380px) {
            .mobile-sale-header {
              flex-direction: column;
              align-items: stretch;
            }

            .mobile-sale-header .meter-badge {
              align-self: flex-start;
            }

            .mobile-sale-details {
              grid-template-columns: 1fr;
            }

            .mobile-payment-detail {
              grid-column: auto;
            }
          }

          @media print {
            .reports-filters,
            .export-grid,
            .action-buttons,
            .mobile-sales-list {
              display: none !important;
            }

            .desktop-sales-table {
              display: block !important;
            }

            .reports-header {
              margin-bottom: 10px;
            }

            .modal {
              display: none !important;
            }

            .admin-reports-page {
              padding: 0 !important;
              max-width: none !important;
            }
          }
        `}
      </style>
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
  padding: "0 15px 35px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});

const title = (theme) => ({
  fontSize: "clamp(22px, 5vw, 30px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
  lineHeight: 1.2,
  wordBreak: "break-word",
});

const subtitle = (theme) => ({
  margin: "5px 0 0",
  color:
    theme.textSecondary || theme.text,
  fontSize: 14,
  lineHeight: 1.5,
});

const filtersCard = (theme) => ({
  width: "100%",
  padding: 18,
  marginBottom: 20,
  background: theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: 14,
  boxSizing: "border-box",
  boxShadow:
    "0 8px 22px rgba(0,0,0,0.06)",
});

const filterLabel = (theme) => ({
  display: "block",
  color:
    theme.textSecondary || theme.text,
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 7,
});

const input = (theme) => ({
  width: "100%",
  minHeight: 46,
  padding: "11px 12px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background:
    theme.input || theme.card,
  color: theme.text,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
});

const refreshBtn = (theme) => ({
  width: "100%",
  minHeight: 46,
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: "11px 18px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
});

const loadingText = (theme) => ({
  color:
    theme.textSecondary || theme.text,
  padding: "4px 2px 15px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
});

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 14,
  boxShadow:
    "0 10px 25px rgba(0,0,0,0.08)",
  marginTop: 20,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  width: "100%",
});

const cardBlue = (theme) => ({
  padding: 22,
  borderRadius: 16,
  background:
    `linear-gradient(135deg, ${theme.primary}, #1e3a8a)`,
  color: "white",
  boxSizing: "border-box",
  minWidth: 0,
});

const summaryLabel = {
  margin: "0 0 7px",
  opacity: 0.86,
  fontSize: 14,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

const big = {
  fontSize:
    "clamp(23px, 4vw, 29px)",
  fontWeight: 700,
  lineHeight: 1.2,
  wordBreak: "break-word",
};

const todayBox = (theme) => ({
  marginTop: 24,
  padding: 20,
  background:
    theme.tableHeader || theme.card,
  color: theme.text,
  borderRadius: 14,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});

const todayTitle = (theme) => ({
  margin: "0 0 15px",
  color: theme.text,
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 18,
});

const miniCard = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 16,
  borderRadius: 11,
  minWidth: 0,
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});

const miniLabel = (theme) => ({
  color:
    theme.textSecondary || theme.text,
  margin: "0 0 6px",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
});

const miniValue = (theme) => ({
  color: theme.text,
  margin: 0,
  fontSize: 24,
  wordBreak: "break-word",
});

const sectionTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const recordCount = (theme) => ({
  color:
    theme.textSecondary || theme.text,
  background:
    theme.input ||
    theme.tableHeader ||
    theme.card,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  padding: "5px 9px",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
});

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
  marginTop: 14,
};

const table = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
};

const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});

const th = (theme) => ({
  padding: "13px 12px",
  textAlign: "left",
  whiteSpace: "nowrap",
  color: "white",
  fontWeight: 600,
  fontSize: 13,
});

const td = (theme) => ({
  padding: "13px 12px",
  borderBottom:
    `1px solid ${theme.border}`,
  whiteSpace: "nowrap",
  color: theme.text,
  fontSize: 14,
  verticalAlign: "middle",
});

const row = (theme) => ({
  background: theme.card,
  color: theme.text,
});

const btn = (theme) => ({
  padding: "12px 16px",
  border: "none",
  borderRadius: 10,
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 0,
  minHeight: 46,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  boxSizing: "border-box",
});

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 13px",
  fontWeight: 600,
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
};

const editBtn = {
  background: "#2563eb",
  color: "white",
  padding: "10px 13px",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
};

/* =========================================================
   PAYMENT BADGE
========================================================= */

const paymentBadge = (
  theme,
  method
) => {
  let background;
  let color;

  if (method === "CASH") {
    background = theme.darkMode
      ? "rgba(34,197,94,.18)"
      : "#dcfce7";

    color = theme.darkMode
      ? "#86efac"
      : "#166534";
  } else if (method === "CARD") {
    background = theme.darkMode
      ? "rgba(59,130,246,.20)"
      : "#dbeafe";

    color = theme.darkMode
      ? "#93c5fd"
      : "#1e3a8a";
  } else {
    background = theme.darkMode
      ? "rgba(148,163,184,.16)"
      : "#f1f5f9";

    color = theme.darkMode
      ? "#cbd5e1"
      : "#64748b";
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    background,
    color,
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
};

const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: 15,
  boxSizing: "border-box",
  overflowY: "auto",
};

const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 22,
  borderRadius: 16,
  width: "100%",
  maxWidth: 430,
  maxHeight:
    "calc(100vh - 30px)",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 15,
  boxShadow:
    "0 10px 30px rgba(0,0,0,0.25)",
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
});

const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 19,
});

const modalSubtitle = (theme) => ({
  color:
    theme.textSecondary || theme.text,
  margin: "5px 0 0",
  fontSize: 13,
  lineHeight: 1.4,
});

const modalText = (theme) => ({
  color:
    theme.textSecondary || theme.text,
  margin: 0,
  lineHeight: 1.5,
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
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const deleteConfirmBtn = {
  background: "#dc2626",
  color: "white",
  padding: 11,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const cancelBtn = {
  background: "#6b7280",
  color: "white",
  padding: 11,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const mobileDetailLabel = (theme) => ({
  color:
    theme.textSecondary || theme.text,
  fontSize: 12,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 5,
});

const mobileDetailValue = (theme) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: 700,
  wordBreak: "break-word",
});

const emptyState = (theme) => ({
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color:
    theme.textSecondary || theme.text,
  textAlign: "center",
});

const mobileEmpty = (theme) => ({
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color:
    theme.textSecondary || theme.text,
  textAlign: "center",
  border:
    `1px dashed ${theme.border}`,
  borderRadius: 12,
  padding: 20,
  boxSizing: "border-box",
});