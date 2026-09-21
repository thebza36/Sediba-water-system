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
  ClipboardList,
  User,
  Gauge,
  Droplets,
  CalendarDays,
  Banknote,
  CreditCard,
  CircleHelp
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
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingSale, setDeletingSale] = useState(false);

  const token = localStorage.getItem("token");


  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(Number(amount || 0));


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (value) => {

    if (!value) {
      return "N/A";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  /* =========================================================
     GET WATER SOLD FOR SALE
  ========================================================= */

  const getLitres = (sale) => {

    if (Number(sale?.totalSold) > 0) {

      return Number(sale.totalSold);

    }


    if (
      Number(sale?.closingReading) >
      Number(sale?.openingReading)
    ) {

      return (
        Number(sale.closingReading) -
        Number(sale.openingReading)
      );

    }


    if (
      Array.isArray(sale?.items) &&
      sale.items.length > 0
    ) {

      return sale.items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );

    }


    return 0;
  };


  /* =========================================================
     GET METER DISPLAY
  ========================================================= */

  const getMeterDisplay = (sale) => {

    if (sale?.meter?.meterNumber) {
      return sale.meter.meterNumber;
    }

    if (
      Array.isArray(sale?.items) &&
      sale.items.length > 0
    ) {
      return "POS";
    }

    return "N/A";
  };


  /* =========================================================
     GET PAYMENT METHOD
  ========================================================= */

  const getPaymentMethod = (sale) => {

    const method =
      sale?.paymentMethod ||
      sale?.payment ||
      sale?.paymentType ||
      "";

    const normalized =
      String(method)
        .toLowerCase()
        .trim();


    if (
      normalized === "cash" ||
      normalized === "cash payment"
    ) {

      return "CASH";

    }


    if (
      normalized === "card" ||
      normalized === "speedpoint" ||
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
    size = 13
  }) => {

    if (method === "CASH") {

      return (
        <Banknote
          size={size}
          strokeWidth={2}
        />
      );

    }


    if (method === "CARD") {

      return (
        <CreditCard
          size={size}
          strokeWidth={2}
        />
      );

    }


    return (
      <CircleHelp
        size={size}
        strokeWidth={2}
      />
    );

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

      background =
        theme.darkMode
          ? "rgba(34,197,94,.18)"
          : "#dcfce7";

      color =
        theme.darkMode
          ? "#86efac"
          : "#166534";

    } else if (method === "CARD") {

      background =
        theme.darkMode
          ? "rgba(59,130,246,.20)"
          : "#dbeafe";

      color =
        theme.darkMode
          ? "#93c5fd"
          : "#1e3a8a";

    } else {

      background =
        theme.darkMode
          ? "rgba(148,163,184,.16)"
          : "#f1f5f9";

      color =
        theme.darkMode
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
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap"
    };

  };


  /* =========================================================
     LOAD SALES
  ========================================================= */

  const loadSales = async (showRefresh = false) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      const res = await fetch(`${API}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      if (res.status === 401) {

        localStorage.removeItem("token");

        window.location.href = "/";

        return;
      }


      if (!res.ok) {
        throw new Error("Failed to load sales");
      }


      const data = await res.json();

      console.log("SALES:", data);


      const salesData = Array.isArray(data)
        ? data
        : [];


      setSales(salesData);
      setFiltered(salesData);

    } catch (error) {

      console.error(
        "LOAD SALES ERROR:",
        error
      );

      alert("Failed to load sales");

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    loadSales();

  }, []);


  /* =========================================================
     DELETE SALE
  ========================================================= */

  const deleteSale = async () => {

    if (!deleting) {
      return;
    }


    try {

      setDeletingSale(true);


      const res = await fetch(
        `${API}/${deleting}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      if (res.status === 401) {

        localStorage.removeItem("token");

        window.location.href = "/";

        return;
      }


      if (!res.ok) {
        throw new Error("Delete failed");
      }


      setDeleting(null);

      await loadSales(true);

    } catch (error) {

      console.error(
        "DELETE SALE ERROR:",
        error
      );

      alert("Failed to delete sale");

    } finally {

      setDeletingSale(false);

    }

  };


  /* =========================================================
     UPDATE SALE
  ========================================================= */

  const updateSale = async () => {

    if (!editing?._id) {
      return;
    }


    try {

      setSaving(true);


      const res = await fetch(
        `${API}/${editing._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...editing,
            totalSold: Number(
              editing.totalSold || 0
            ),
            revenue: Number(
              editing.revenue || 0
            )
          })
        }
      );


      if (res.status === 401) {

        localStorage.removeItem("token");

        window.location.href = "/";

        return;
      }


      if (!res.ok) {
        throw new Error("Update failed");
      }


      setEditing(null);

      await loadSales(true);

    } catch (error) {

      console.error(
        "UPDATE SALE ERROR:",
        error
      );

      alert("Failed to update sale");

    } finally {

      setSaving(false);

    }

  };


  /* =========================================================
     SEARCH + DATE FILTER
  ========================================================= */

  useEffect(() => {

    let result = [...sales];


    if (search.trim()) {

      const query =
        search
          .toLowerCase()
          .trim();


      result = result.filter((sale) => {

        const employeeName =
          sale.employee?.name ||
          "";


        const meterNumber =
          sale.meter?.meterNumber ||
          "";


        return (
          employeeName
            .toLowerCase()
            .includes(query) ||

          meterNumber
            .toLowerCase()
            .includes(query)
        );

      });

    }


    if (date) {

      result = result.filter((sale) => {

        if (!sale.date) {
          return false;
        }


        const saleDate =
          new Date(sale.date);


        const selectedDate =
          new Date(`${date}T00:00:00`);


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

  }, [
    search,
    date,
    sales
  ]);


  /* =========================================================
     TOTAL REVENUE
  ========================================================= */

  const totalRevenue =
    filtered.reduce(
      (sum, sale) =>
        sum +
        Number(sale.revenue || 0),
      0
    );


  /* =========================================================
     TOTAL LITRES
  ========================================================= */

  const totalLitres =
    filtered.reduce(
      (sum, sale) =>
        sum + getLitres(sale),
      0
    );


  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {

    setSearch("");
    setDate("");

  };


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

      <style>
        {`

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }


          .sales-desktop-table {
            display: block;
          }


          .sales-mobile-list {
            display: none;
          }


          .sales-filter-grid {
            display: grid;
            grid-template-columns:
              minmax(220px, 1fr)
              minmax(180px, 220px)
              auto;

            gap: 14px;
            align-items: end;
          }


          .sales-summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));

            gap: 16px;
          }


          .sales-modal-actions {
            display: flex;
            gap: 10px;
            width: 100%;
          }


          .sales-modal-actions button {
            flex: 1;
          }


          @media (max-width: 1100px) {

            .sales-desktop-table {
              overflow-x: auto;
            }

          }


          @media (max-width: 900px) {

            .sales-filter-grid {
              grid-template-columns:
                1fr 1fr;
            }

            .sales-refresh-wrapper {
              grid-column: 1 / -1;
            }

          }


          @media (max-width: 767px) {

            .sales-desktop-table {
              display: none;
            }


            .sales-mobile-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }


            .sales-summary-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }


            .sales-filter-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }


            .sales-refresh-wrapper {
              grid-column: auto;
            }


            .sales-mobile-actions {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
            }


            .sales-modal-actions {
              flex-direction: column;
            }


            .sales-modal-actions button {
              width: 100%;
              min-width: 0 !important;
            }


            .sales-page-title {
              font-size: 25px !important;
            }


            .sales-card {
              padding: 15px !important;
            }

          }


          @media (max-width: 420px) {

            .sales-mobile-actions {
              grid-template-columns: 1fr !important;
            }

          }

        `}
      </style>


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div style={header}>

        <div style={headerContent}>

          <div style={headerIcon(theme)}>

            <BarChart3
              size={25}
              strokeWidth={2.2}
            />

          </div>


          <div>

            <h1
              className="sales-page-title"
              style={title(theme)}
            >
              Sales History
            </h1>


            <p style={subtitle(theme)}>
              View and manage all recorded sales
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div
        className="sales-summary-grid"
        style={summaryGrid}
      >

        {/* REVENUE */}

        <div style={summaryCard(theme)}>

          <div style={summaryTop}>

            <div>

              <div style={summaryLabel}>
                Total Revenue
              </div>

              <div style={totalText}>
                {formatMoney(totalRevenue)}
              </div>

            </div>


            <div style={summaryIcon}>

              <Banknote
                size={22}
                strokeWidth={2}
              />

            </div>

          </div>

        </div>


        {/* WATER */}

        <div style={summaryCard(theme)}>

          <div style={summaryTop}>

            <div>

              <div style={summaryLabel}>
                Water Sold
              </div>

              <div style={totalText}>
                {totalLitres.toLocaleString()} L
              </div>

            </div>


            <div style={summaryIcon}>

              <Droplets
                size={22}
                strokeWidth={2}
              />

            </div>

          </div>

        </div>


        {/* RECORDS */}

        <div style={summaryCard(theme)}>

          <div style={summaryTop}>

            <div>

              <div style={summaryLabel}>
                Sales Records
              </div>

              <div style={totalText}>
                {filtered.length}
              </div>

            </div>


            <div style={summaryIcon}>

              <ClipboardList
                size={22}
                strokeWidth={2}
              />

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div style={card(theme)}>

        <div style={sectionHeader}>

          <div>

            <h3 style={sectionTitle(theme)}>
              Search & Filter
            </h3>

            <p style={sectionSubtitle(theme)}>
              Find sales by employee, meter or date
            </p>

          </div>

        </div>


        <div
          className="sales-filter-grid"
          style={filterRow}
        >

          {/* SEARCH */}

          <div style={filterField}>

            <label style={label(theme)}>
              Employee or Meter
            </label>

            <div style={inputWrapper(theme)}>

              <User
                size={17}
                strokeWidth={2}
                style={inputIcon(theme)}
              />

              <input
                style={inputWithIcon(theme)}
                placeholder="Search employee or meter..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>


          {/* DATE */}

          <div style={filterField}>

            <label style={label(theme)}>
              Date
            </label>

            <div style={inputWrapper(theme)}>

              <CalendarDays
                size={17}
                strokeWidth={2}
                style={inputIcon(theme)}
              />

              <input
                style={inputWithIcon(theme)}
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />

            </div>

          </div>


          {/* BUTTONS */}

          <div
            className="sales-refresh-wrapper"
            style={filterButtonWrapper}
          >

            <button
              type="button"
              style={refreshBtn(theme)}
              onClick={() =>
                loadSales(true)
              }
              disabled={refreshing}
              title="Refresh sales"
            >

              <RefreshCw
                size={17}
                strokeWidth={2.2}
                style={
                  refreshing
                    ? {
                        animation:
                          "spin 0.8s linear infinite"
                      }
                    : undefined
                }
              />

              <span>
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>

            </button>


            {(search || date) && (

              <button
                type="button"
                style={clearBtn(theme)}
                onClick={clearFilters}
              >

                <X
                  size={16}
                  strokeWidth={2.2}
                />

                <span>
                  Clear
                </span>

              </button>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          SALES RECORDS CARD
      ===================================================== */}

      <div
        className="sales-card"
        style={card(theme)}
      >

        <div style={tableHeaderRow}>

          <div>

            <h3 style={tableTitle(theme)}>
              Sales Records
            </h3>

            <p style={recordCount(theme)}>
              Showing {filtered.length} record
              {filtered.length === 1
                ? ""
                : "s"}
            </p>

          </div>

        </div>


        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {filtered.length === 0 ? (

          <div style={emptyState(theme)}>

            <div style={emptyIcon(theme)}>

              <ClipboardList
                size={48}
                strokeWidth={1.7}
              />

            </div>


            <h3 style={emptyTitle(theme)}>
              No sales found
            </h3>


            <p style={emptyText(theme)}>
              No sales match your current
              search or date filter.
            </p>


            {(search || date) && (

              <button
                type="button"
                style={emptyClearBtn(theme)}
                onClick={clearFilters}
              >

                <X
                  size={16}
                  strokeWidth={2.2}
                />

                Clear Filters

              </button>

            )}

          </div>

        ) : (

          <>

            {/* ===============================================
                DESKTOP TABLE
            =============================================== */}

            <div
              className="sales-desktop-table"
              style={tableWrapper}
            >

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
                      Type
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

                    <th
                      style={{
                        ...th,
                        textAlign: "center"
                      }}
                    >
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filtered.map(
                    (sale, index) => {

                      const liters =
                        getLitres(sale);


                      const meterDisplay =
                        getMeterDisplay(sale);


                      const paymentMethod =
                        getPaymentMethod(sale);


                      const employeeName =
                        sale.employee?.name ||
                        "Unknown";


                      return (

                        <tr
                          key={sale._id}
                          style={
                            index % 2 === 0
                              ? row(theme)
                              : rowAlt(theme)
                          }
                        >

                          {/* EMPLOYEE */}

                          <td style={td(theme)}>

                            <div style={employeeCell}>

                              <div
                                style={employeeAvatar(
                                  theme
                                )}
                              >
                                {employeeName
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>


                              <div
                                style={{
                                  minWidth: 0
                                }}
                              >

                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: theme.text,
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                    maxWidth: 190
                                  }}
                                >
                                  {employeeName}
                                </div>

                              </div>

                            </div>

                          </td>


                          {/* METER */}

                          <td style={td(theme)}>

                            <span
                              style={meterBadge(
                                theme
                              )}
                            >

                              <Gauge
                                size={13}
                                strokeWidth={2}
                              />

                              {meterDisplay}

                            </span>

                          </td>


                          {/* PAYMENT TYPE */}

                          <td style={td(theme)}>

                            <span
                              style={paymentBadge(
                                theme,
                                paymentMethod
                              )}
                            >

                              <PaymentIcon
                                method={
                                  paymentMethod
                                }
                                size={13}
                              />

                              {paymentMethod}

                            </span>

                          </td>


                          {/* WATER */}

                          <td style={td(theme)}>

                            <strong
                              style={{
                                color: theme.text
                              }}
                            >

                              {liters > 0
                                ? `${liters.toLocaleString()} L`
                                : "0 L"}

                            </strong>

                          </td>


                          {/* REVENUE */}

                          <td style={td(theme)}>

                            <strong
                              style={revenueText}
                            >
                              {formatMoney(
                                sale.revenue
                              )}
                            </strong>

                          </td>


                          {/* DATE */}

                          <td style={td(theme)}>

                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: 6
                              }}
                            >

                              <CalendarDays
                                size={14}
                                strokeWidth={2}
                              />

                              {formatDate(
                                sale.date
                              )}

                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td
                            style={actionCell(theme)}
                          >

                            <button
                              type="button"
                              style={editBtn}
                              onClick={() =>
                                setEditing({
                                  ...sale
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
                              type="button"
                              style={deleteBtn}
                              onClick={() =>
                                setDeleting(
                                  sale._id
                                )
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

                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* ===============================================
                MOBILE SALES CARDS
            =============================================== */}

            <div
              className="sales-mobile-list"
              style={mobileList}
            >

              {filtered.map((sale) => {

                const liters =
                  getLitres(sale);


                const meterDisplay =
                  getMeterDisplay(sale);


                const paymentMethod =
                  getPaymentMethod(sale);


                const employeeName =
                  sale.employee?.name ||
                  "Unknown";


                return (

                  <div
                    key={sale._id}
                    style={mobileSaleCard(theme)}
                  >

                    {/* MOBILE CARD HEADER */}

                    <div
                      style={mobileSaleHeader}
                    >

                      <div
                        style={
                          mobileEmployeeSection
                        }
                      >

                        <div
                          style={employeeAvatar(
                            theme
                          )}
                        >
                          {employeeName
                            .charAt(0)
                            .toUpperCase()}
                        </div>


                        <div
                          style={{
                            minWidth: 0
                          }}
                        >

                          <div
                            style={
                              mobileEmployeeName(
                                theme
                              )
                            }
                          >
                            {employeeName}
                          </div>


                          <div
                            style={
                              mobileDate(theme)
                            }
                          >

                            <CalendarDays
                              size={13}
                              strokeWidth={2}
                            />

                            {formatDate(
                              sale.date
                            )}

                          </div>

                        </div>

                      </div>


                      <span
                        style={mobileMeterBadge(
                          theme
                        )}
                      >

                        <Gauge
                          size={13}
                          strokeWidth={2}
                        />

                        {meterDisplay}

                      </span>

                    </div>


                    {/* MOBILE PAYMENT TYPE */}

                    <div
                      style={mobilePaymentRow}
                    >

                      <span
                        style={
                          mobilePaymentLabel(
                            theme
                          )
                        }
                      >
                        Payment Type
                      </span>


                      <span
                        style={paymentBadge(
                          theme,
                          paymentMethod
                        )}
                      >

                        <PaymentIcon
                          method={
                            paymentMethod
                          }
                          size={13}
                        />

                        {paymentMethod}

                      </span>

                    </div>


                    {/* MOBILE INFORMATION GRID */}

                    <div
                      style={mobileInfoGrid}
                    >

                      <div
                        style={mobileInfoBox(
                          theme
                        )}
                      >

                        <div
                          style={mobileInfoLabel(
                            theme
                          )}
                        >

                          <Droplets
                            size={14}
                            strokeWidth={2}
                          />

                          Water Sold

                        </div>


                        <div
                          style={
                            mobileInfoValue(
                              theme
                            )
                          }
                        >
                          {liters > 0
                            ? `${liters.toLocaleString()} L`
                            : "0 L"}
                        </div>

                      </div>


                      <div
                        style={mobileInfoBox(
                          theme
                        )}
                      >

                        <div
                          style={mobileInfoLabel(
                            theme
                          )}
                        >

                          <Banknote
                            size={14}
                            strokeWidth={2}
                          />

                          Revenue

                        </div>


                        <div
                          style={
                            mobileRevenueValue
                          }
                        >
                          {formatMoney(
                            sale.revenue
                          )}
                        </div>

                      </div>

                    </div>


                    {/* MOBILE ACTIONS */}

                    <div
                      className="sales-mobile-actions"
                      style={mobileActions}
                    >

                      <button
                        type="button"
                        style={mobileEditBtn}
                        onClick={() =>
                          setEditing({
                            ...sale
                          })
                        }
                      >

                        <Pencil
                          size={16}
                          strokeWidth={2.2}
                        />

                        Edit Sale

                      </button>


                      <button
                        type="button"
                        style={mobileDeleteBtn}
                        onClick={() =>
                          setDeleting(
                            sale._id
                          )
                        }
                      >

                        <Trash2
                          size={16}
                          strokeWidth={2.2}
                        />

                        Delete Sale

                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          </>

        )}

      </div>


      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (

        <div
          style={modal}
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setEditing(null);
            }

          }}
        >

          <div style={modalBox(theme)}>

            <div style={modalHeader}>

              <div
                style={{
                  minWidth: 0
                }}
              >

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
                  style={modalSubtitle(theme)}
                >
                  Update the sale information
                </p>

              </div>


              <button
                type="button"
                style={modalClose(theme)}
                onClick={() =>
                  setEditing(null)
                }
                title="Close"
                aria-label="Close edit modal"
              >

                <X
                  size={18}
                  strokeWidth={2.2}
                />

              </button>

            </div>


            <div style={editEmployeePreview(theme)}>

              <div
                style={employeeAvatar(theme)}
              >
                {(editing.employee?.name ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div
                style={{
                  minWidth: 0
                }}
              >

                <strong
                  style={{
                    color: theme.text,
                    display: "block",
                    overflow: "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap"
                  }}
                >
                  {editing.employee?.name ||
                    "Unknown"}
                </strong>


                <span
                  style={{
                    color:
                      theme.textSecondary ||
                      theme.text,
                    fontSize: 12
                  }}
                >
                  {getMeterDisplay(
                    editing
                  )}
                </span>

              </div>

            </div>


            <div style={modalForm}>

              <div>

                <label
                  style={label(theme)}
                >
                  Total Water Sold (Litres)
                </label>

                <input
                  style={modalInput(theme)}
                  type="number"
                  min="0"
                  value={
                    editing.totalSold ??
                    ""
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

                <label
                  style={label(theme)}
                >
                  Revenue
                </label>

                <input
                  style={modalInput(theme)}
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editing.revenue ??
                    ""
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


            <div
              className="sales-modal-actions"
              style={modalActions}
            >

              <button
                type="button"
                style={{
                  ...saveBtn,
                  opacity: saving
                    ? 0.7
                    : 1,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer"
                }}
                onClick={updateSale}
                disabled={saving}
              >

                {saving ? (

                  <RefreshCw
                    size={17}
                    strokeWidth={2.2}
                    style={{
                      animation:
                        "spin 0.8s linear infinite"
                    }}
                  />

                ) : (

                  <Save
                    size={17}
                    strokeWidth={2.2}
                  />

                )}


                <span>
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </span>

              </button>


              <button
                type="button"
                style={cancelBtn}
                onClick={() =>
                  setEditing(null)
                }
                disabled={saving}
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

            if (
              e.target ===
              e.currentTarget
            ) {
              setDeleting(null);
            }

          }}
        >

          <div style={modalBox(theme)}>

            <div style={modalHeader}>

              <div
                style={{
                  minWidth: 0
                }}
              >

                <h3
                  style={modalTitle(theme)}
                >

                  <AlertTriangle
                    size={20}
                    strokeWidth={2.2}
                    color="#dc2626"
                  />

                  Confirm Delete

                </h3>


                <p
                  style={modalSubtitle(theme)}
                >
                  This action cannot be undone.
                </p>

              </div>


              <button
                type="button"
                style={modalClose(theme)}
                onClick={() =>
                  setDeleting(null)
                }
                title="Close"
                aria-label="Close delete modal"
              >

                <X
                  size={18}
                  strokeWidth={2.2}
                />

              </button>

            </div>


            <div
              style={deleteWarning(theme)}
            >

              <div
                style={
                  deleteWarningIcon
                }
              >

                <AlertTriangle
                  size={25}
                  strokeWidth={2}
                />

              </div>


              <div>

                <p
                  style={modalText(theme)}
                >
                  Are you sure you want to
                  delete this sale?
                </p>


                <p
                  style={warningSmall(theme)}
                >
                  The sale will be permanently
                  removed from the sales history.
                </p>

              </div>

            </div>


            <div
              className="sales-modal-actions"
              style={modalActions}
            >

              <button
                type="button"
                style={{
                  ...deleteConfirmBtn,
                  opacity:
                    deletingSale
                      ? 0.7
                      : 1,
                  cursor:
                    deletingSale
                      ? "not-allowed"
                      : "pointer"
                }}
                onClick={deleteSale}
                disabled={deletingSale}
              >

                {deletingSale ? (

                  <RefreshCw
                    size={17}
                    strokeWidth={2.2}
                    style={{
                      animation:
                        "spin 0.8s linear infinite"
                    }}
                  />

                ) : (

                  <Trash2
                    size={17}
                    strokeWidth={2.2}
                  />

                )}


                <span>
                  {deletingSale
                    ? "Deleting..."
                    : "Yes, Delete"}
                </span>

              </button>


              <button
                type="button"
                style={cancelBtn}
                onClick={() =>
                  setDeleting(null)
                }
                disabled={deletingSale}
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
   PAGE
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "clamp(12px, 3vw, 25px)",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden"
});


/* =========================================================
   HEADER
========================================================= */

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
  marginBottom: 22,
  width: "100%"
};


const headerContent = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0
};


const headerIcon = (theme) => ({
  width: 48,
  height: 48,
  minWidth: 48,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  boxShadow:
    "0 8px 20px rgba(37,99,235,.18)"
});


const title = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
  lineHeight: 1.2
});


const subtitle = (theme) => ({
  margin: "6px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 14,
  lineHeight: 1.5
});


/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  width: "100%",
  marginBottom: 20
};


const summaryCard = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: "clamp(17px, 3vw, 22px)",
  borderRadius: 18,
  boxShadow:
    "0 8px 25px rgba(15,23,42,.12)",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box"
});


const summaryTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15
};


const summaryLabel = {
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.9
};


const totalText = {
  fontSize: "clamp(24px, 5vw, 30px)",
  fontWeight: 700,
  margin: "8px 0 0",
  wordBreak: "break-word",
  lineHeight: 1.2
};


const summaryIcon = {
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: 12,
  background: "rgba(255,255,255,.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};


/* =========================================================
   GENERAL CARD
========================================================= */

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: "clamp(15px, 3vw, 21px)",
  borderRadius: 18,
  marginBottom: 20,
  border:
    `1px solid ${theme.border}`,
  boxShadow:
    "0 10px 30px rgba(15,23,42,.08)",
  width: "100%",
  boxSizing: "border-box"
});


/* =========================================================
   SECTION HEADERS
========================================================= */

const sectionHeader = {
  marginBottom: 16
};


const sectionTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 18,
  fontWeight: 700
});


const sectionSubtitle = (theme) => ({
  margin: "4px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13
});


/* =========================================================
   FILTERS
========================================================= */

const filterRow = {
  width: "100%"
};


const filterField = {
  width: "100%",
  minWidth: 0
};


const label = (theme) => ({
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color:
    theme.textSecondary ||
    theme.text
});


const inputWrapper = (theme) => ({
  position: "relative",
  width: "100%"
});


const inputIcon = (theme) => ({
  position: "absolute",
  left: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color:
    theme.textSecondary ||
    theme.text,
  pointerEvents: "none"
});


const inputWithIcon = (theme) => ({
  width: "100%",
  minWidth: 0,
  padding: "12px 12px 12px 40px",
  border:
    `1px solid ${theme.border}`,
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  background:
    theme.input ||
    theme.card,
  color: theme.text,
  boxSizing: "border-box",
  minHeight: 44
});


const filterButtonWrapper = {
  display: "flex",
  gap: 9,
  width: "100%"
};


const refreshBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: "12px 17px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  flex: 1,
  minWidth: 110,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7
});


const clearBtn = (theme) => ({
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.text,
  padding: "12px 15px",
  border:
    `1px solid ${theme.border}`,
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6
});


/* =========================================================
   TABLE HEADER
========================================================= */

const tableHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  marginBottom: 16
};


const tableTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
  fontWeight: 700
});


const recordCount = (theme) => ({
  margin: "4px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13
});


/* =========================================================
   TABLE
========================================================= */

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 12,
  overscrollBehaviorX: "contain"
};


const table = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
  tableLayout: "auto"
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white"
});


const th = {
  padding: "13px 14px",
  textAlign: "left",
  whiteSpace: "nowrap",
  fontWeight: 600,
  color: "white",
  fontSize: 13
};


const td = (theme) => ({
  padding: "13px 14px",
  borderBottom:
    `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
  fontSize: 14,
  verticalAlign: "middle"
});


const row = (theme) => ({
  background: theme.card
});


const rowAlt = (theme) => ({
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card
});


const employeeCell = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0
};


const employeeAvatar = (theme) => ({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.primary,
  color: "white",
  fontWeight: 700,
  fontSize: 13
});


const meterBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 9px",
  borderRadius: 8,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`,
  fontSize: 12,
  fontWeight: 600,
  color: theme.text
});


const revenueText = {
  color: "#16a34a"
};


const actionCell = (theme) => ({
  ...td(theme),
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  alignItems: "center",
  justifyContent: "center"
});


const editBtn = {
  background: "#2563eb",
  color: "white",
  padding: "8px 12px",
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 37,
  minWidth: 68,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6
};


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  padding: "8px 12px",
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 37,
  minWidth: 75,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6
};


/* =========================================================
   MOBILE SALES
========================================================= */

const mobileList = {
  width: "100%"
};


const mobileSaleCard = (theme) => ({
  width: "100%",
  boxSizing: "border-box",
  padding: 15,
  borderRadius: 14,
  border:
    `1px solid ${theme.border}`,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  boxShadow:
    "0 5px 15px rgba(15,23,42,.06)"
});


const mobileSaleHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  marginBottom: 12
};


const mobileEmployeeSection = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0,
  flex: 1
};


const mobileEmployeeName = (theme) => ({
  color: theme.text,
  fontSize: 14,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});


const mobileDate = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 3,
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 12
});


const mobileMeterBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 8px",
  borderRadius: 8,
  background: theme.card,
  border:
    `1px solid ${theme.border}`,
  color: theme.text,
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap"
});


/* =========================================================
   MOBILE PAYMENT
========================================================= */

const mobilePaymentRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  width: "100%",
  padding: "9px 0",
  marginBottom: 10
};


const mobilePaymentLabel = (theme) => ({
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 12,
  fontWeight: 600
});


const mobileInfoGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  width: "100%",
  marginBottom: 13
};


const mobileInfoBox = (theme) => ({
  padding: 11,
  borderRadius: 10,
  background: theme.card,
  border:
    `1px solid ${theme.border}`,
  minWidth: 0
});


const mobileInfoLabel = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 5,
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 11,
  fontWeight: 600,
  marginBottom: 5
});


const mobileInfoValue = (theme) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: 700,
  wordBreak: "break-word"
});


const mobileRevenueValue = {
  color: "#16a34a",
  fontSize: 16,
  fontWeight: 700,
  wordBreak: "break-word"
};


const mobileActions = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  width: "100%"
};


const mobileEditBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 9,
  minHeight: 42,
  padding: "10px 12px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6
};


const mobileDeleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 9,
  minHeight: 42,
  padding: "10px 12px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6
};


/* =========================================================
   EMPTY STATE
========================================================= */

const emptyState = (theme) => ({
  textAlign: "center",
  padding: "clamp(35px, 8vw, 60px) 20px",
  color:
    theme.textSecondary ||
    theme.text
});


const emptyIcon = (theme) => ({
  width: 64,
  height: 64,
  margin: "0 auto 12px",
  borderRadius: 16,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: theme.primary,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card
});


const emptyTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 18
});


const emptyText = (theme) => ({
  margin: "8px auto 0",
  fontSize: 14,
  maxWidth: 430,
  lineHeight: 1.5
});


const emptyClearBtn = (theme) => ({
  marginTop: 15,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  background: theme.primary,
  color: "white",
  border: "none",
  borderRadius: 9,
  padding: "10px 15px",
  minHeight: 40,
  fontWeight: 600,
  cursor: "pointer"
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
  background:
    "rgba(0,0,0,0.6)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  boxSizing: "border-box",
  overflowY: "auto"
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding:
    "clamp(18px, 5vw, 25px)",
  borderRadius: 18,
  width: "100%",
  maxWidth: 450,
  display: "flex",
  flexDirection: "column",
  gap: 15,
  boxShadow:
    "0 15px 40px rgba(0,0,0,0.25)",
  border:
    `1px solid ${theme.border}`,
  boxSizing: "border-box",
  maxHeight: "90vh",
  overflowY: "auto"
});


const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15
};


const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  gap: 7
});


const modalSubtitle = (theme) => ({
  margin: "5px 0 0",
  color:
    theme.textSecondary ||
    theme.text,
  fontSize: 13
});


const modalClose = (theme) => ({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: "50%",
  border:
    `1px solid ${theme.border}`,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.text,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});


const editEmployeePreview = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 11,
  borderRadius: 11,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`
});


const modalForm = {
  display: "flex",
  flexDirection: "column",
  gap: 14
};


const modalInput = (theme) => ({
  width: "100%",
  padding: 12,
  border:
    `1px solid ${theme.border}`,
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  background:
    theme.input ||
    theme.card,
  color: theme.text,
  boxSizing: "border-box",
  minHeight: 44
});


const deleteWarning = (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: 15,
  borderRadius: 11,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border:
    `1px solid ${theme.border}`
});


const deleteWarningIcon = {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(220,38,38,.12)",
  color: "#dc2626"
};


const modalText = (theme) => ({
  color: theme.text,
  margin: 0,
  fontWeight: 600,
  lineHeight: 1.5
});


const warningSmall = (theme) => ({
  color:
    theme.textSecondary ||
    theme.text,
  margin: "7px 0 0",
  fontSize: 13,
  lineHeight: 1.5
});


const modalActions = {
  display: "flex",
  gap: 10,
  width: "100%"
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
  gap: 7
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
  gap: 7
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
  gap: 7
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
  background: "transparent"
});


const loadingBox = (theme) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  color: theme.text,
  fontWeight: 600
});


const spinner = (theme) => ({
  width: 30,
  height: 30,
  borderRadius: "50%",
  border:
    `3px solid ${theme.border}`,
  borderTopColor:
    theme.primary,
  animation:
    "spin 0.8s linear infinite"
});