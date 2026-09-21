import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Banknote,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  Droplets,
  Filter,
  Gauge,
  ListFilter,
  Package,
  RefreshCw,
  ShoppingCart,
  Trophy,
  Wallet,
  X,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token");

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    return {};
  }
};

const user = getStoredUser();

/* =========================================================
   PAYMENT METHOD
========================================================= */

const getPaymentMethod = (sale) => {
  const method =
    sale?.paymentMethod ||
    sale?.payment ||
    sale?.paymentType ||
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
  size = 16,
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
   MAIN COMPONENT
========================================================= */

export default function EmployeePage() {
  const { theme } =
    useContext(ThemeContext);

  /* =====================================================
     STATES
  ===================================================== */

  const [sales, setSales] = useState([]);
  const [meters, setMeters] = useState([]);
  const [stats, setStats] = useState({});
  const [topEmployees, setTopEmployees] =
    useState([]);

  const [filterType, setFilterType] =
    useState("all");

  const [filterDate, setFilterDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const load = async (
    showLoader = false
  ) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        salesRes,
        metersRes,
        statsRes,
        employeesRes,
      ] = await Promise.all([
        fetch(
          `${API}/water-sales/my-sales`,
          {
            headers,
          }
        ),

        fetch(`${API}/meters`, {
          headers,
        }),

        fetch(
          `${API}/water-sales/my-stats`,
          {
            headers,
          }
        ),

        fetch(
          `${API}/water-sales/top-employees`,
          {
            headers,
          }
        ),
      ]);

      /* ================================================
         SALES
      ================================================= */

      if (salesRes.ok) {
        const salesData =
          await salesRes.json();

        setSales(
          Array.isArray(salesData)
            ? salesData
            : salesData.sales || []
        );
      }

      /* ================================================
         METERS
      ================================================= */

      if (metersRes.ok) {
        const metersData =
          await metersRes.json();

        setMeters(
          Array.isArray(metersData)
            ? metersData
            : metersData.meters || []
        );
      }

      /* ================================================
         STATS
      ================================================= */

      if (statsRes.ok) {
        const statsData =
          await statsRes.json();

        setStats(
          statsData || {}
        );
      }

      /* ================================================
         TOP EMPLOYEES
      ================================================= */

      if (employeesRes.ok) {
        const employeesData =
          await employeesRes.json();

        setTopEmployees(
          Array.isArray(
            employeesData
          )
            ? employeesData
            : employeesData.employees ||
                []
        );
      }
    } catch (error) {
      console.error(
        "Employee dashboard error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD + AUTO REFRESH
  ===================================================== */

  useEffect(() => {
    load();

    const interval =
      setInterval(() => {
        load();
      }, 15000);

    return () =>
      clearInterval(interval);
  }, []);

  /* =====================================================
     CURRENCY
  ===================================================== */

  const currency = (amount) => {
    return new Intl.NumberFormat(
      "en-ZA",
      {
        style: "currency",
        currency: "ZAR",
      }
    ).format(
      Number(amount || 0)
    );
  };

  /* =====================================================
     SALE TYPE LOGIC
  ===================================================== */

  const isPOS = (sale) => {
    return (
      sale?.saleMode === "pos"
    );
  };

  /* =====================================================
     FILTERED SALES
  ===================================================== */

  const filteredSales = useMemo(() => {
    return sales.filter(
      (sale) => {
        const posSale =
          isPOS(sale);

        /* ---------------------------------------------
           SALE TYPE FILTER
        --------------------------------------------- */

        if (
          filterType === "pos" &&
          !posSale
        ) {
          return false;
        }

        if (
          filterType === "meter" &&
          posSale
        ) {
          return false;
        }

        /* ---------------------------------------------
           DATE FILTER
        --------------------------------------------- */

        if (filterDate) {
          const saleDate =
            new Date(
              sale.createdAt ||
                sale.date ||
                sale.saleDate
            )
              .toISOString()
              .split("T")[0];

          if (
            saleDate !==
            filterDate
          ) {
            return false;
          }
        }

        return true;
      }
    );
  }, [
    sales,
    filterType,
    filterDate,
  ]);

  /* =====================================================
     TODAY SALES
  ===================================================== */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todaySales = useMemo(() => {
    return sales.filter(
      (sale) => {
        const saleDate =
          new Date(
            sale.createdAt ||
              sale.date ||
              sale.saleDate
          )
            .toISOString()
            .split("T")[0];

        return (
          saleDate === today
        );
      }
    );
  }, [sales]);

  /* =====================================================
     TODAY WATER SOLD
  ===================================================== */

  const todayWater = useMemo(() => {
    return todaySales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.totalSold || 0
        ),
      0
    );
  }, [todaySales]);

  /* =====================================================
     TODAY REVENUE
  ===================================================== */

  const todayRevenue =
    useMemo(() => {
      return todaySales.reduce(
        (total, sale) =>
          total +
          Number(
            sale.revenue || 0
          ),
        0
      );
    }, [todaySales]);

  /* =====================================================
     ASSIGNED METERS
     
     IMPORTANT:
     SUPPORTS BOTH:
       meter.employee
       meter.employee._id
       meter.assignedTo
       meter.assignedTo._id
  ===================================================== */

  const myMeters = useMemo(() => {
    if (!Array.isArray(meters)) {
      return [];
    }

    return meters.filter(
      (meter) => {
        const employee =
          meter?.employee;

        const assignedTo =
          meter?.assignedTo;

        const employeeId =
          employee?._id ||
          employee ||
          assignedTo?._id ||
          assignedTo;

        return (
          employeeId &&
          String(employeeId) ===
            String(user?._id)
        );
      }
    );
  }, [meters]);

  /* =====================================================
     MY REVENUE
     
     Used for employee ranking.
  ===================================================== */

  const myRevenue = useMemo(() => {
    return Number(
      stats?.monthRevenue ||
        stats?.totalRevenue ||
        stats?.revenue ||
        0
    );
  }, [stats]);

  /* =====================================================
     EMPLOYEE POSITION
     
     FIRST:
     Find employee directly in
     topEmployees.

     IF NOT FOUND:
     Calculate position by counting
     employees with higher revenue.
  ===================================================== */

  const myRank = useMemo(() => {
    if (
      !Array.isArray(
        topEmployees
      ) ||
      topEmployees.length === 0
    ) {
      return "—";
    }

    /* ================================================
       FIND CURRENT EMPLOYEE DIRECTLY
    ================================================= */

    const directIndex =
      topEmployees.findIndex(
        (employee) => {
          const employeeId =
            employee?._id ||
            employee?.employee?._id ||
            employee?.employeeId ||
            employee?.user?._id;

          return (
            employeeId &&
            String(employeeId) ===
              String(user?._id)
          );
        }
      );

    /* ================================================
       IF FOUND, USE API RANK
    ================================================= */

    if (
      directIndex !== -1
    ) {
      return directIndex + 1;
    }

    /* ================================================
       OTHERWISE CALCULATE POSITION
    ================================================= */

    const employeesAhead =
      topEmployees.filter(
        (employee) => {
          const employeeRevenue =
            Number(
              employee?.totalRevenue ||
                employee?.revenue ||
                employee?.monthRevenue ||
                employee?.salesRevenue ||
                0
            );

          return (
            employeeRevenue >
            myRevenue
          );
        }
      ).length;

    return (
      employeesAhead + 1
    );
  }, [
    topEmployees,
    myRevenue,
  ]);

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setFilterType("all");
    setFilterDate("");
  };

  const hasFilters =
    filterType !== "all" ||
    filterDate !== "";

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <div
        className={`employee-page ${
          theme === "dark"
            ? "dark"
            : ""
        }`}
      >
        <div className="employee-loading">

          <div className="loading-icon">
            <Droplets size={34} />
          </div>

          <h2>
            Loading Dashboard...
          </h2>

          <p>
            Please wait while we
            load your sales
            information.
          </p>

        </div>

        <style>{`

          .employee-page {
            min-height: 100vh;
            padding: 28px;
            background: #f5f7fb;
            color: #172033;
          }

          .employee-page.dark {
            background: #151922;
            color: #f4f6fa;
          }

          .employee-loading {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .loading-icon {
            width: 70px;
            height: 70px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(
              135deg,
              #0d6efd,
              #084298
            );
            color: white;
            margin-bottom: 18px;
          }

          .employee-loading h2 {
            margin: 0 0 8px;
          }

          .employee-loading p {
            margin: 0;
            opacity: .7;
          }

        `}</style>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div
      className={`employee-page ${
        theme === "dark"
          ? "dark"
          : ""
      }`}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>
          <div className="title-row">

            <div className="title-icon">
              <Droplets size={26} />
            </div>

            <div>

              <h1>
                Employee Dashboard
              </h1>

              <p>
                Welcome back{" "}
                <strong>
                  {user?.name ||
                    "Employee"}
                </strong>
              </p>

            </div>

          </div>
        </div>

        <button
          className="refresh-button"
          onClick={() =>
            load(true)
          }
          disabled={refreshing}
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "spin"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>

        </button>

      </div>

      {/* =================================================
          MAIN STATS
      ================================================= */}

      <div className="stats-grid">

        {/* TOTAL SALES */}

        <div className="stat-card">

          <div className="stat-icon">
            <ShoppingCart
              size={24}
            />
          </div>

          <div className="stat-content">

            <span>
              Total Sales
            </span>

            <strong>
              {sales.length}
            </strong>

            <small>
              All your recorded
              sales
            </small>

          </div>

        </div>

        {/* WATER SOLD */}

        <div className="stat-card">

          <div className="stat-icon">
            <Droplets size={24} />
          </div>

          <div className="stat-content">

            <span>
              Water Sold
            </span>

            <strong>
              {Number(
                stats?.totalSold ||
                  sales.reduce(
                    (
                      sum,
                      sale
                    ) =>
                      sum +
                      Number(
                        sale.totalSold ||
                          0
                      ),
                    0
                  )
              ).toLocaleString()}
            </strong>

            <small>
              Total units sold
            </small>

          </div>

        </div>

        {/* REVENUE */}

        <div className="stat-card">

          <div className="stat-icon">
            <CircleDollarSign
              size={24}
            />
          </div>

          <div className="stat-content">

            <span>
              Revenue
            </span>

            <strong>
              {currency(
                stats?.monthRevenue ||
                  stats?.totalRevenue ||
                  sales.reduce(
                    (
                      sum,
                      sale
                    ) =>
                      sum +
                      Number(
                        sale.revenue ||
                          0
                      ),
                    0
                  )
              )}
            </strong>

            <small>
              Revenue generated
            </small>

          </div>

        </div>

        {/* MY METERS */}

        <div className="stat-card">

          <div className="stat-icon">
            <Gauge size={24} />
          </div>

          <div className="stat-content">

            <span>
              My Meters
            </span>

            <strong>
              {myMeters.length}
            </strong>

            <small>
              Assigned meters
            </small>

          </div>

        </div>

        {/* MY POSITION */}

        <div className="stat-card">

          <div className="stat-icon">
            <Trophy size={24} />
          </div>

          <div className="stat-content">

            <span>
              My Position
            </span>

            <strong>
              {myRank === "—"
                ? "—"
                : `#${myRank}`}
            </strong>

            <small>
              Employee ranking
            </small>

          </div>

        </div>

      </div>

      {/* =================================================
          TODAY'S PERFORMANCE
      ================================================= */}

      <div className="section-card performance-card">

        <div className="section-heading">

          <div className="section-heading-left">

            <div className="section-icon">
              <Activity size={21} />
            </div>

            <div>

              <h2>
                Today&apos;s Performance
              </h2>

              <p>
                Your sales activity
                for today
              </p>

            </div>

          </div>

          <div className="today-badge">

            <CalendarDays
              size={15}
            />

            {new Date().toLocaleDateString(
              "en-ZA",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}

          </div>

        </div>

        <div className="today-grid">

          <div className="today-item">

            <div className="today-item-icon">
              <ShoppingCart
                size={20}
              />
            </div>

            <div>

              <span>
                Sales Today
              </span>

              <strong>
                {todaySales.length}
              </strong>

            </div>

          </div>

          <div className="today-item">

            <div className="today-item-icon">
              <Droplets size={20} />
            </div>

            <div>

              <span>
                Water Sold
              </span>

              <strong>
                {todayWater.toLocaleString()}
              </strong>

            </div>

          </div>

          <div className="today-item">

            <div className="today-item-icon">
              <Wallet size={20} />
            </div>

            <div>

              <span>
                Revenue
              </span>

              <strong>
                {currency(
                  todayRevenue
                )}
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SALES FILTERS
      ================================================= */}

      <div className="section-card">

        <div className="section-heading">

          <div className="section-heading-left">

            <div className="section-icon">
              <Filter size={21} />
            </div>

            <div>

              <h2>
                Sales Filters
              </h2>

              <p>
                Filter your sales
                records
              </p>

            </div>

          </div>

          {hasFilters && (
            <button
              className="clear-button"
              onClick={
                clearFilters
              }
            >

              <X size={16} />

              Clear

            </button>
          )}

        </div>

        <div className="filters">

          {/* SALE TYPE */}

          <div className="filter-group">

            <label>
              <ListFilter
                size={15}
              />

              Sale Type
            </label>

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Sales
              </option>

              <option value="meter">
                Meter Sales
              </option>

              <option value="pos">
                POS Sales
              </option>

            </select>

          </div>

          {/* DATE */}

          <div className="filter-group">

            <label>
              <CalendarDays
                size={15}
              />

              Date
            </label>

            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(
                  e.target.value
                )
              }
            />

          </div>

          {/* RESULTS */}

          <div className="filter-result">

            <span>
              Showing
            </span>

            <strong>
              {filteredSales.length}
            </strong>

            <small>
              sales
            </small>

          </div>

        </div>

      </div>

      {/* =================================================
          SALES
      ================================================= */}

      <div className="section-card sales-card">

        <div className="section-heading">

          <div className="section-heading-left">

            <div className="section-icon">
              <BarChart3 size={21} />
            </div>

            <div>

              <h2>
                Recent Sales
              </h2>

              <p>
                Your latest recorded
                sales
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="desktop-table">

          {filteredSales.length ===
          0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                <ShoppingCart
                  size={28}
                />
              </div>

              <h3>
                No sales found
              </h3>

              <p>
                There are no sales
                matching your
                current filters.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>
                      Type
                    </th>

                    <th>
                      Units
                    </th>

                    <th>
                      Revenue
                    </th>

                    <th>
                      Date
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredSales.map(
                    (
                      sale,
                      index
                    ) => {

                      const paymentMethod =
                        getPaymentMethod(
                          sale
                        );

                      const posSale =
                        isPOS(sale);

                      return (
                        <tr
                          key={
                            sale._id ||
                            sale.id ||
                            index
                          }
                        >

                          {/* TYPE */}

                          <td>

                            <div
                              className={`type-badge ${
                                paymentMethod ===
                                "CARD"
                                  ? "card"
                                  : paymentMethod ===
                                    "CASH"
                                  ? "cash"
                                  : "unknown"
                              }`}
                            >

                              <PaymentIcon
                                method={
                                  paymentMethod
                                }
                                size={15}
                              />

                              <span>
                                {
                                  paymentMethod
                                }
                              </span>

                            </div>

                          </td>

                          {/* UNITS */}

                          <td>

                            <div className="units-cell">

                              <Package
                                size={15}
                              />

                              <span>

                                {posSale
                                  ? (
                                      sale.items ||
                                      []
                                    ).reduce(
                                      (
                                        total,
                                        item
                                      ) =>
                                        total +
                                        Number(
                                          item.quantity ||
                                            0
                                        ),
                                      0
                                    )
                                  : Number(
                                      sale.totalSold ||
                                        0
                                    )}

                              </span>

                            </div>

                          </td>

                          {/* REVENUE */}

                          <td>

                            <strong className="revenue">

                              {currency(
                                sale.revenue
                              )}

                            </strong>

                          </td>

                          {/* DATE */}

                          <td>

                            <div className="date-cell">

                              <CalendarDays
                                size={15}
                              />

                              <span>

                                {new Date(
                                  sale.createdAt ||
                                    sale.date ||
                                    sale.saleDate
                                ).toLocaleDateString(
                                  "en-ZA",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}

                              </span>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* =================================================
            MOBILE SALES CARDS
        ================================================= */}

        <div className="mobile-sales">

          {filteredSales.length ===
          0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                <ShoppingCart
                  size={28}
                />
              </div>

              <h3>
                No sales found
              </h3>

              <p>
                There are no sales
                matching your
                current filters.
              </p>

            </div>
          ) : (
            filteredSales.map(
              (
                sale,
                index
              ) => {

                const paymentMethod =
                  getPaymentMethod(
                    sale
                  );

                const posSale =
                  isPOS(sale);

                const units =
                  posSale
                    ? (
                        sale.items ||
                        []
                      ).reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item.quantity ||
                              0
                          ),
                        0
                      )
                    : Number(
                        sale.totalSold ||
                          0
                      );

                return (
                  <div
                    className="mobile-sale-card"
                    key={
                      sale._id ||
                      sale.id ||
                      index
                    }
                  >

                    {/* TOP */}

                    <div className="mobile-sale-top">

                      <div
                        className={`type-badge ${
                          paymentMethod ===
                          "CARD"
                            ? "card"
                            : paymentMethod ===
                              "CASH"
                            ? "cash"
                            : "unknown"
                        }`}
                      >

                        <PaymentIcon
                          method={
                            paymentMethod
                          }
                          size={15}
                        />

                        <span>
                          {
                            paymentMethod
                          }
                        </span>

                      </div>

                      <div className="mobile-sale-date">

                        <CalendarDays
                          size={14}
                        />

                        {new Date(
                          sale.createdAt ||
                            sale.date ||
                            sale.saleDate
                        ).toLocaleDateString(
                          "en-ZA",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="mobile-sale-details">

                      <div className="mobile-detail">

                        <span>
                          Units
                        </span>

                        <strong>
                          {units}
                        </strong>

                      </div>

                      <div className="mobile-detail revenue-detail">

                        <span>
                          Revenue
                        </span>

                        <strong>
                          {currency(
                            sale.revenue
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>
                );
              }
            )
          )}

        </div>

      </div>

      {/* =================================================
          STYLES
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .employee-page {
          width: 100%;
          min-height: 100vh;
          padding: 28px;
          background: #f5f7fb;
          color: #172033;
          overflow-x: hidden;
        }

        .employee-page.dark {
          background: #151922;
          color: #f4f6fa;
        }

        /* ================================================
           HEADER
        ================================================= */

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .title-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #0d6efd,
            #084298
          );
          color: white;
          flex-shrink: 0;
        }

        .page-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -.4px;
        }

        .page-header p {
          margin: 5px 0 0;
          opacity: .68;
          font-size: 14px;
        }

        .refresh-button {
          border: none;
          background: #0d6efd;
          color: white;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .refresh-button:hover {
          transform: translateY(-1px);
        }

        .refresh-button:disabled {
          opacity: .7;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ================================================
           STAT CARDS
        ================================================= */

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          min-width: 0;
          padding: 20px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            #0d6efd,
            #084298
          );
          color: white;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow:
            0 10px 25px
            rgba(
              13,
              110,
              253,
              .15
            );
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background:
            rgba(
              255,
              255,
              255,
              .16
            );
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content {
          min-width: 0;
        }

        .stat-content span {
          display: block;
          font-size: 13px;
          opacity: .82;
          margin-bottom: 5px;
        }

        .stat-content strong {
          display: block;
          font-size: 23px;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-content small {
          display: block;
          margin-top: 6px;
          opacity: .72;
          font-size: 11px;
        }

        /* ================================================
           SECTION CARDS
        ================================================= */

        .section-card {
          background: white;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 20px;
          border: 1px solid #e5e9f1;
          box-shadow:
            0 6px 20px
            rgba(
              15,
              23,
              42,
              .04
            );
        }

        .dark .section-card {
          background: #1d222d;
          border-color: #2b3341;
          box-shadow: none;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .section-heading-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .section-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8f1ff;
          color: #0d6efd;
          flex-shrink: 0;
        }

        .dark .section-icon {
          background: #24334e;
          color: #69a4ff;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }

        .section-heading p {
          margin: 4px 0 0;
          font-size: 13px;
          opacity: .62;
        }

        /* ================================================
           TODAY
        ================================================= */

        .today-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 11px;
          border-radius: 9px;
          background: #f0f5ff;
          color: #0d6efd;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dark .today-badge {
          background: #24334e;
          color: #8bb8ff;
        }

        .today-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 14px;
        }

        .today-item {
          padding: 16px;
          border: 1px solid #e6eaf1;
          border-radius: 13px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dark .today-item {
          border-color: #303846;
          background: #191e27;
        }

        .today-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #edf4ff;
          color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dark .today-item-icon {
          background: #25334a;
          color: #77adff;
        }

        .today-item span {
          display: block;
          font-size: 12px;
          opacity: .62;
          margin-bottom: 4px;
        }

        .today-item strong {
          display: block;
          font-size: 18px;
        }

        /* ================================================
           FILTERS
        ================================================= */

        .filters {
          display: grid;
          grid-template-columns:
            minmax(180px, 1fr)
            minmax(180px, 1fr)
            minmax(130px, auto);
          gap: 14px;
          align-items: end;
        }

        .filter-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 7px;
          opacity: .75;
        }

        .filter-group select,
        .filter-group input {
          width: 100%;
          height: 42px;
          border: 1px solid #d9dee8;
          background: white;
          color: #172033;
          border-radius: 9px;
          padding: 0 12px;
          outline: none;
          font-size: 14px;
        }

        .dark .filter-group select,
        .dark .filter-group input {
          background: #171c24;
          color: #f3f5f8;
          border-color: #353e4d;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          border-color: #0d6efd;
        }

        .filter-result {
          min-height: 42px;
          padding: 0 14px;
          border-radius: 9px;
          background: #f4f7fb;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .dark .filter-result {
          background: #171c24;
        }

        .filter-result span,
        .filter-result small {
          font-size: 12px;
          opacity: .65;
        }

        .filter-result strong {
          font-size: 16px;
          color: #0d6efd;
        }

        .clear-button {
          border: 1px solid #dfe4ec;
          background: transparent;
          color: inherit;
          min-height: 38px;
          padding: 0 12px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-weight: 700;
        }

        .dark .clear-button {
          border-color: #3a4351;
        }

        /* ================================================
           DESKTOP TABLE
        ================================================= */

        .desktop-table {
          width: 100%;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        th {
          text-align: left;
          padding: 13px 14px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .5px;
          color: #6d7788;
          border-bottom: 1px solid #e5e9f0;
          background: #fafbfc;
        }

        .dark th {
          background: #181d26;
          color: #929baa;
          border-color: #303744;
        }

        td {
          padding: 15px 14px;
          border-bottom: 1px solid #edf0f4;
          font-size: 14px;
        }

        .dark td {
          border-color: #2d3440;
        }

        tbody tr:hover {
          background: #f8faff;
        }

        .dark tbody tr:hover {
          background: #202632;
        }

        /* ================================================
           PAYMENT TYPE
        ================================================= */

        .type-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-width: 82px;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .3px;
        }

        .type-badge.cash {
          background: #e9f8ef;
          color: #198754;
        }

        .dark .type-badge.cash {
          background: #173326;
          color: #6fdaa0;
        }

        .type-badge.card {
          background: #e8f1ff;
          color: #0d6efd;
        }

        .dark .type-badge.card {
          background: #1d3151;
          color: #77adff;
        }

        .type-badge.unknown {
          background: #f0f1f3;
          color: #68707d;
        }

        .dark .type-badge.unknown {
          background: #303640;
          color: #b5bcc8;
        }

        /* ================================================
           TABLE DETAILS
        ================================================= */

        .units-cell,
        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .units-cell {
          color: #5c6675;
        }

        .dark .units-cell {
          color: #b5bdc9;
        }

        .revenue {
          color: #198754;
          font-weight: 800;
        }

        .dark .revenue {
          color: #72d9a0;
        }

        .date-cell {
          color: #687383;
          font-size: 13px;
        }

        .dark .date-cell {
          color: #a8b0bd;
        }

        /* ================================================
           MOBILE SALES
        ================================================= */

        .mobile-sales {
          display: none;
        }

        .mobile-sale-card {
          border: 1px solid #e3e7ee;
          border-radius: 13px;
          padding: 14px;
          margin-bottom: 12px;
        }

        .dark .mobile-sale-card {
          border-color: #313947;
          background: #191e27;
        }

        .mobile-sale-card:last-child {
          margin-bottom: 0;
        }

        .mobile-sale-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .mobile-sale-date {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          opacity: .65;
        }

        .mobile-sale-details {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
        }

        .mobile-detail {
          padding: 11px;
          border-radius: 9px;
          background: #f5f7fa;
        }

        .dark .mobile-detail {
          background: #222832;
        }

        .mobile-detail span {
          display: block;
          font-size: 11px;
          opacity: .6;
          margin-bottom: 4px;
        }

        .mobile-detail strong {
          font-size: 15px;
        }

        .revenue-detail strong {
          color: #198754;
        }

        .dark .revenue-detail strong {
          color: #72d9a0;
        }

        /* ================================================
           EMPTY STATE
        ================================================= */

        .empty-state {
          padding: 55px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: #eef3fa;
          color: #738095;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }

        .dark .empty-icon {
          background: #252c37;
          color: #aeb7c5;
        }

        .empty-state h3 {
          margin: 0 0 6px;
          font-size: 17px;
        }

        .empty-state p {
          margin: 0;
          opacity: .62;
          font-size: 13px;
        }

        /* ================================================
           TABLET
        ================================================= */

        @media (max-width: 1200px) {

          .stats-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }

        }

        /* ================================================
           MOBILE
        ================================================= */

        @media (max-width: 767px) {

          .employee-page {
            padding: 16px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
          }

          .page-header h1 {
            font-size: 23px;
          }

          .title-icon {
            width: 46px;
            height: 46px;
          }

          .refresh-button {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns:
              1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
            border-radius: 13px;
            gap: 10px;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .stat-content span {
            font-size: 11px;
          }

          .stat-content strong {
            font-size: 18px;
          }

          .stat-content small {
            display: none;
          }

          .section-card {
            padding: 16px;
            border-radius: 13px;
            margin-bottom: 14px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .section-heading h2 {
            font-size: 16px;
          }

          .section-heading p {
            font-size: 12px;
          }

          .section-icon {
            width: 38px;
            height: 38px;
          }

          .today-badge {
            font-size: 10px;
            padding: 7px 8px;
          }

          .today-grid {
            grid-template-columns:
              1fr;
          }

          .today-item {
            padding: 13px;
          }

          .filters {
            grid-template-columns:
              1fr;
          }

          .filter-result {
            justify-content: center;
          }

          .clear-button {
            font-size: 12px;
          }

          .desktop-table {
            display: none;
          }

          .mobile-sales {
            display: block;
          }

          .sales-card {
            padding-bottom: 12px;
          }

        }

        /* ================================================
           VERY SMALL PHONES
        ================================================= */

        @media (max-width: 420px) {

          .employee-page {
            padding: 12px;
          }

          .stats-grid {
            gap: 8px;
          }

          .stat-card {
            padding: 12px;
          }

          .stat-icon {
            width: 36px;
            height: 36px;
          }

          .stat-content strong {
            font-size: 16px;
          }

          .stat-content span {
            font-size: 10px;
          }

          .section-card {
            padding: 13px;
          }

          .mobile-sale-top {
            align-items: flex-start;
          }

          .type-badge {
            min-width: 74px;
            padding: 6px 8px;
            font-size: 10px;
          }

          .mobile-sale-date {
            font-size: 10px;
          }

        }

      `}</style>
    </div>
  );
}