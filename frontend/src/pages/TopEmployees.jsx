import { useEffect, useMemo, useRef, useState } from "react";
import {
  Trophy,
  AlertTriangle,
  Users,
  RotateCcw,
  Droplets,
  Medal,
  Search,
  RefreshCw,
  UserRound,
  Banknote,
  Award,
  Crown,
  BarChart3,
  CircleDollarSign,
  Activity,
  Mail,
  UserCheck,
  X,
  TrendingUp,
  ShieldCheck,
  ListOrdered,
  ChevronUp,
  Target,
} from "lucide-react";

export default function TopEmployees() {
  const API = import.meta.env.VITE_API_URL;

  const [topEmployees, setTopEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const hasFetched = useRef(false);

  /* =====================================================
     MONEY FORMAT
  ===================================================== */

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  /* =====================================================
     NUMBER FORMAT
  ===================================================== */

  const formatNumber = (amount) => {
    return new Intl.NumberFormat("en-ZA").format(
      Number(amount) || 0
    );
  };

  /* =====================================================
     GET REVENUE
  ===================================================== */

  const getRevenue = (employee) => {
    return Number(
      employee?.totalRevenue ??
        employee?.revenue ??
        employee?.salesRevenue ??
        employee?.totalSales ??
        0
    );
  };

  /* =====================================================
     GET WATER SOLD
  ===================================================== */

  const getWaterSold = (employee) => {
    return Number(
      employee?.totalWater ??
        employee?.totalSold ??
        employee?.waterSold ??
        employee?.liters ??
        employee?.volume ??
        employee?.totalLiters ??
        0
    );
  };

  /* =====================================================
     GET NAME
  ===================================================== */

  const getEmployeeName = (employee) => {
    return (
      employee?.name ||
      employee?.employeeName ||
      employee?.userName ||
      employee?.fullName ||
      employee?.user?.name ||
      "Unknown Employee"
    );
  };

  /* =====================================================
     GET ID
  ===================================================== */

  const getEmployeeId = (employee) => {
    return (
      employee?._id ||
      employee?.id ||
      employee?.employeeId ||
      employee?.userId ||
      employee?.user?._id ||
      employee?.user?.id ||
      null
    );
  };

  /* =====================================================
     GET EMAIL
  ===================================================== */

  const getEmployeeEmail = (employee) => {
    return (
      employee?.email ||
      employee?.employeeEmail ||
      employee?.user?.email ||
      ""
    );
  };

  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials = (name) => {
    if (!name) return "?";

    const initials = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return initials || "?";
  };

  /* =====================================================
     NORMALIZE ARRAY RESPONSE
  ===================================================== */

  const normalizeArrayResponse = (data, keys = []) => {
    if (Array.isArray(data)) {
      return data;
    }

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

  /* =====================================================
     FETCH ALL EMPLOYEES + PERFORMANCE
  ===================================================== */

  const fetchTopEmployees = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please login again.");
        setTopEmployees([]);
        return;
      }

      /* =================================================
         LOAD:
         1. ALL USERS
         2. EMPLOYEE PERFORMANCE
      ================================================= */

      const [employeesResponse, performanceResponse] =
        await Promise.all([
          fetch(`${API}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API}/analytics/top-employees`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      /* =================================================
         READ ALL USERS
      ================================================= */

      let employees = [];

      if (employeesResponse.ok) {
        const employeesData =
          await employeesResponse.json();

        employees = normalizeArrayResponse(
          employeesData,
          [
            "users",
            "employees",
            "data",
            "results",
          ]
        );
      }

      /* =================================================
         KEEP EMPLOYEES / STAFF
      ================================================= */

      employees = employees.filter((employee) => {
        const role = String(
          employee?.role ||
            employee?.userRole ||
            employee?.type ||
            ""
        )
          .toLowerCase()
          .trim();

        /*
         * If the API doesn't provide a role,
         * keep the record because it may still
         * be an employee record.
         */

        if (!role) {
          return true;
        }

        return (
          role === "employee" ||
          role === "staff"
        );
      });

      /* =================================================
         READ PERFORMANCE DATA
      ================================================= */

      let performance = [];

      if (performanceResponse.ok) {
        const performanceData =
          await performanceResponse.json();

        performance = normalizeArrayResponse(
          performanceData,
          [
            "employees",
            "data",
            "results",
            "topEmployees",
          ]
        );
      }

      /* =================================================
         PERFORMANCE LOOKUP BY ID / EMAIL / NAME
      ================================================= */

      const performanceById = new Map();
      const performanceByEmail = new Map();
      const performanceByName = new Map();

      performance.forEach((item) => {
        const id = getEmployeeId(item);

        const email = String(
          getEmployeeEmail(item)
        )
          .toLowerCase()
          .trim();

        const name = String(
          getEmployeeName(item)
        )
          .toLowerCase()
          .trim();

        if (id) {
          performanceById.set(
            String(id),
            item
          );
        }

        if (email) {
          performanceByEmail.set(
            email,
            item
          );
        }

        if (
          name &&
          name !== "unknown employee"
        ) {
          performanceByName.set(
            name,
            item
          );
        }
      });

      /* =================================================
         MERGE ALL EMPLOYEES
      ================================================= */

      const mergedEmployees = employees.map(
        (employee) => {
          const employeeId =
            getEmployeeId(employee);

          const employeeEmail =
            String(
              getEmployeeEmail(employee)
            )
              .toLowerCase()
              .trim();

          const employeeName =
            String(
              getEmployeeName(employee)
            )
              .toLowerCase()
              .trim();

          let performanceData = null;

          /* MATCH BY ID FIRST */

          if (employeeId) {
            performanceData =
              performanceById.get(
                String(employeeId)
              );
          }

          /* MATCH BY EMAIL */

          if (
            !performanceData &&
            employeeEmail
          ) {
            performanceData =
              performanceByEmail.get(
                employeeEmail
              );
          }

          /* MATCH BY NAME */

          if (
            !performanceData &&
            employeeName
          ) {
            performanceData =
              performanceByName.get(
                employeeName
              );
          }

          /*
           * IMPORTANT:
           * Even when there is NO performance
           * record, the employee remains visible.
           */

          return {
            ...employee,

            ...(performanceData || {}),

            _id:
              employeeId ||
              performanceData?._id ||
              null,

            name:
              employee?.name ||
              employee?.fullName ||
              performanceData?.name ||
              "Unknown Employee",

            email:
              employee?.email ||
              performanceData?.email ||
              "",

            totalRevenue:
              performanceData
                ? getRevenue(
                    performanceData
                  )
                : 0,

            totalWater:
              performanceData
                ? getWaterSold(
                    performanceData
                  )
                : 0,
          };
        }
      );

      /* =================================================
         FALLBACK
         IF /users IS EMPTY
      ================================================= */

      let finalEmployees = [];

      if (mergedEmployees.length > 0) {
        finalEmployees = mergedEmployees;
      } else {
        finalEmployees = performance.map(
          (employee) => ({
            ...employee,

            totalRevenue:
              getRevenue(employee),

            totalWater:
              getWaterSold(employee),
          })
        );
      }

      /* =================================================
         SORT ALL EMPLOYEES
      ================================================= */

      finalEmployees.sort((a, b) => {
        const revenueDifference =
          getRevenue(b) -
          getRevenue(a);

        if (revenueDifference !== 0) {
          return revenueDifference;
        }

        return (
          getWaterSold(b) -
          getWaterSold(a)
        );
      });

      setTopEmployees(finalEmployees);

      console.log(
        "ALL EMPLOYEES:",
        finalEmployees
      );

      console.log(
        "PERFORMANCE DATA:",
        performance
      );
    } catch (err) {
      console.error(
        "TOP EMPLOYEES ERROR:",
        err
      );

      setError(
        "Unable to load employee leaderboard."
      );

      setTopEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    fetchTopEmployees();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredEmployees = useMemo(() => {
    const term = search
      .toLowerCase()
      .trim();

    if (!term) {
      return topEmployees;
    }

    return topEmployees.filter(
      (employee) => {
        const name =
          getEmployeeName(employee)
            .toLowerCase();

        const email =
          getEmployeeEmail(employee)
            .toLowerCase();

        return (
          name.includes(term) ||
          email.includes(term)
        );
      }
    );
  }, [topEmployees, search]);

  /* =====================================================
     TOTAL REVENUE
  ===================================================== */

  const totalRevenue = useMemo(() => {
    return topEmployees.reduce(
      (sum, employee) =>
        sum + getRevenue(employee),
      0
    );
  }, [topEmployees]);

  /* =====================================================
     TOTAL WATER
  ===================================================== */

  const totalWater = useMemo(() => {
    return topEmployees.reduce(
      (sum, employee) =>
        sum + getWaterSold(employee),
      0
    );
  }, [topEmployees]);

  /* =====================================================
     ACTIVE EMPLOYEES
  ===================================================== */

  const activeEmployees = useMemo(() => {
    return topEmployees.filter(
      (employee) =>
        getRevenue(employee) > 0 ||
        getWaterSold(employee) > 0
    ).length;
  }, [topEmployees]);

  /* =====================================================
     TOP PERFORMER
  ===================================================== */

  const topPerformer =
    topEmployees.length > 0
      ? topEmployees[0]
      : null;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={page}>
        <style>{responsiveStyles}</style>

        <div style={loadingContainer}>
          <div style={loadingCircle}>
            <Trophy
              size={42}
              strokeWidth={2}
            />
          </div>

          <h2 style={loadingTitle}>
            Loading Employee Leaderboard
          </h2>

          <p style={loadingText}>
            Preparing employee performance...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      style={page}
      className="topEmployeesPage"
    >
      <style>{responsiveStyles}</style>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={header}
        className="topEmployeesHeader"
      >
        <div
          style={headerLeft}
          className="topEmployeesHeaderLeft"
        >
          <div style={headerIcon}>
            <Trophy
              size={30}
              strokeWidth={2.4}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={eyebrow}>
              <BarChart3 size={14} />
              PERFORMANCE
            </div>

            <h1 style={title}>
              Top Employees
            </h1>

            <p style={subtitle}>
              Employee performance leaderboard
              and sales overview
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            fetchTopEmployees(true)
          }
          disabled={refreshing}
          style={{
            ...refreshButton,
            opacity: refreshing ? 0.7 : 1,
          }}
          className="topEmployeesRefresh"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "spinIcon"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div style={errorBox}>
          <div style={errorIcon}>
            <AlertTriangle
              size={28}
            />
          </div>

          <div style={errorContent}>
            <strong>
              Unable to load leaderboard
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            onClick={() =>
              fetchTopEmployees(true)
            }
            style={errorButton}
          >
            <RotateCcw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      {!error && (
        <div
          style={summaryGrid}
          className="topEmployeesSummary"
        >
          {/* TOTAL EMPLOYEES */}

          <div style={summaryCard}>
            <div
              style={{
                ...summaryIcon,
                background:
                  "linear-gradient(135deg,#1e3a8a,#2563eb)",
              }}
            >
              <Users size={22} />
            </div>

            <div style={summaryInfo}>
              <span style={summaryLabel}>
                Total Employees
              </span>

              <strong style={summaryValue}>
                {formatNumber(
                  topEmployees.length
                )}
              </strong>

              <small style={summarySub}>
                <UserCheck size={12} />
                {formatNumber(
                  activeEmployees
                )}{" "}
                with sales
              </small>
            </div>
          </div>

          {/* TOTAL REVENUE */}

          <div style={summaryCard}>
            <div
              style={{
                ...summaryIcon,
                background:
                  "linear-gradient(135deg,#047857,#10b981)",
              }}
            >
              <CircleDollarSign
                size={22}
              />
            </div>

            <div style={summaryInfo}>
              <span style={summaryLabel}>
                Total Revenue
              </span>

              <strong style={summaryValue}>
                {formatMoney(
                  totalRevenue
                )}
              </strong>

              <small style={summarySub}>
                <TrendingUp size={12} />
                Combined employee sales
              </small>
            </div>
          </div>

          {/* WATER */}

          <div style={summaryCard}>
            <div
              style={{
                ...summaryIcon,
                background:
                  "linear-gradient(135deg,#0369a1,#0ea5e9)",
              }}
            >
              <Droplets size={22} />
            </div>

            <div style={summaryInfo}>
              <span style={summaryLabel}>
                Total Water Sold
              </span>

              <strong style={summaryValue}>
                {formatNumber(
                  totalWater
                )}{" "}
                L
              </strong>

              <small style={summarySub}>
                <Droplets size={12} />
                Combined volume
              </small>
            </div>
          </div>

          {/* TOP PERFORMER */}

          <div style={summaryCard}>
            <div
              style={{
                ...summaryIcon,
                background:
                  "linear-gradient(135deg,#92400e,#f59e0b)",
              }}
            >
              <Crown size={22} />
            </div>

            <div
              style={{
                ...summaryInfo,
                minWidth: 0,
              }}
            >
              <span style={summaryLabel}>
                Top Performer
              </span>

              <strong
                style={{
                  ...summaryValue,
                  fontSize: 18,
                }}
              >
                {topPerformer
                  ? getEmployeeName(
                      topPerformer
                    )
                  : "None"}
              </strong>

              <small style={summarySub}>
                <Trophy size={12} />
                Rank #1
              </small>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          TOOLBAR
      ================================================= */}

      {!error &&
        topEmployees.length > 0 && (
          <div
            style={toolbar}
            className="topEmployeesToolbar"
          >
            <div
              style={searchBox}
              className="topEmployeesSearch"
            >
              <Search
                size={18}
                color="#64748b"
                strokeWidth={2.2}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search employees by name or email..."
                style={searchInput}
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  style={clearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div
              style={resultCount}
              className="topEmployeesResultCount"
            >
              <ListOrdered size={16} />

              <span>
                Showing{" "}
                <strong>
                  {filteredEmployees.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {topEmployees.length}
                </strong>{" "}
                employees
              </span>
            </div>
          </div>
        )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!error &&
        topEmployees.length === 0 && (
          <div style={emptyBox}>
            <div style={emptyIcon}>
              <Users
                size={48}
                strokeWidth={1.8}
              />
            </div>

            <h2 style={emptyTitle}>
              No Employees Found
            </h2>

            <p style={emptyText}>
              There are currently no employees
              available to display.
            </p>

            <button
              onClick={() =>
                fetchTopEmployees(true)
              }
              style={button}
            >
              <RefreshCw size={17} />
              Refresh Employees
            </button>
          </div>
        )}

      {/* =================================================
          NO SEARCH RESULTS
      ================================================= */}

      {!error &&
        topEmployees.length > 0 &&
        filteredEmployees.length === 0 && (
          <div style={emptyBox}>
            <div style={emptyIcon}>
              <Search
                size={46}
                strokeWidth={1.8}
              />
            </div>

            <h2 style={emptyTitle}>
              No Matching Employees
            </h2>

            <p style={emptyText}>
              No employees match "
              {search}".
            </p>

            <button
              onClick={() =>
                setSearch("")
              }
              style={button}
            >
              <X size={17} />
              Clear Search
            </button>
          </div>
        )}

      {/* =================================================
          LEADERBOARD
      ================================================= */}

      {!error &&
        filteredEmployees.length > 0 && (
          <div
            style={grid}
            className="topEmployeesGrid"
          >
            {filteredEmployees.map(
              (employee, index) => {
                const revenue =
                  getRevenue(employee);

                const waterSold =
                  getWaterSold(employee);

                const name =
                  getEmployeeName(
                    employee
                  );

                const email =
                  getEmployeeEmail(
                    employee
                  );

                const initials =
                  getInitials(name);

                const isFirst =
                  index === 0;

                const isSecond =
                  index === 1;

                const isThird =
                  index === 2;

                const percentage =
                  totalRevenue > 0
                    ? Math.round(
                        (revenue /
                          totalRevenue) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={
                      getEmployeeId(
                        employee
                      ) ||
                      `${name}-${index}`
                    }
                    style={{
                      ...employeeCard,
                      ...(isFirst
                        ? firstCard
                        : {}),
                    }}
                  >
                    {/* =================================================
                        RANK
                    ================================================= */}

                    <div
                      style={{
                        ...rankBadge,
                        ...(isFirst
                          ? firstRank
                          : isSecond
                          ? secondRank
                          : isThird
                          ? thirdRank
                          : {}),
                      }}
                    >
                      {isFirst ? (
                        <Crown size={15} />
                      ) : isSecond ? (
                        <Medal size={15} />
                      ) : isThird ? (
                        <Medal size={15} />
                      ) : (
                        <Award size={15} />
                      )}

                      #{index + 1}
                    </div>

                    {/* =================================================
                        TOP PERFORMER LABEL
                    ================================================= */}

                    {isFirst && (
                      <div style={topLabel}>
                        <Trophy size={14} />
                        TOP PERFORMER
                      </div>
                    )}

                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <div style={profile}>
                      <div
                        style={{
                          ...avatar,
                          ...(isFirst
                            ? firstAvatar
                            : {}),
                        }}
                      >
                        {initials}
                      </div>

                      <div
                        style={
                          profileInfo
                        }
                      >
                        <h3
                          style={{
                            ...employeeName,
                            color: isFirst
                              ? "#ffffff"
                              : "#0f172a",
                          }}
                        >
                          {name}
                        </h3>

                        <div
                          style={{
                            ...employeeEmail,
                            color: isFirst
                              ? "rgba(255,255,255,.72)"
                              : "#64748b",
                          }}
                        >
                          <Mail size={13} />

                          <span>
                            {email ||
                              "No email available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <div
                      style={{
                        ...statusBadge,
                        ...(revenue > 0 ||
                        waterSold > 0
                          ? activeStatus
                          : inactiveStatus),
                      }}
                    >
                      {revenue > 0 ||
                      waterSold > 0 ? (
                        <>
                          <UserCheck
                            size={13}
                          />
                          Active Sales
                        </>
                      ) : (
                        <>
                          <Activity
                            size={13}
                          />
                          No Sales Yet
                        </>
                      )}
                    </div>

                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div
                      style={{
                        ...divider,
                        ...(isFirst
                          ? {
                              background:
                                "rgba(255,255,255,.18)",
                            }
                          : {}),
                      }}
                    />

                    {/* =================================================
                        REVENUE
                    ================================================= */}

                    <div style={revenueSection}>
                      <div
                        style={{
                          ...metricHeader,
                          color: isFirst
                            ? "rgba(255,255,255,.72)"
                            : "#64748b",
                        }}
                      >
                        <span
                          style={
                            metricHeaderSpan
                          }
                        >
                          <Banknote
                            size={15}
                          />
                          Total Revenue
                        </span>
                      </div>

                      <div
                        style={{
                          ...revenueValue,
                          color: isFirst
                            ? "#ffffff"
                            : "#0f172a",
                        }}
                      >
                        {formatMoney(
                          revenue
                        )}
                      </div>
                    </div>

                    {/* =================================================
                        WATER SOLD
                    ================================================= */}

                    <div
                      style={{
                        ...waterSection,
                        borderColor: isFirst
                          ? "rgba(255,255,255,.15)"
                          : "#e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          ...metricSmall,
                          color: isFirst
                            ? "rgba(255,255,255,.72)"
                            : "#64748b",
                        }}
                      >
                        <Droplets
                          size={15}
                        />
                        Water Sold
                      </div>

                      <strong
                        style={{
                          color: isFirst
                            ? "#ffffff"
                            : "#0f172a",
                          fontSize: 15,
                        }}
                      >
                        {formatNumber(
                          waterSold
                        )}{" "}
                        L
                      </strong>
                    </div>

                    {/* =================================================
                        PERFORMANCE
                    ================================================= */}

                    <div
                      style={
                        performanceWrapper
                      }
                    >
                      <div
                        style={{
                          ...performanceLabel,
                          color: isFirst
                            ? "rgba(255,255,255,.65)"
                            : "#64748b",
                        }}
                      >
                        <span
                          style={
                            performanceTitle
                          }
                        >
                          <Target
                            size={13}
                          />
                          Performance
                        </span>

                        <span>
                          {percentage}%
                        </span>
                      </div>

                      <div
                        style={{
                          ...progressTrack,
                          background:
                            isFirst
                              ? "rgba(255,255,255,.15)"
                              : "#e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            ...progressBar,
                            width:
                              totalRevenue >
                              0
                                ? `${Math.max(
                                    revenue > 0
                                      ? 3
                                      : 0,
                                    Math.min(
                                      100,
                                      percentage
                                    )
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                      style={{
                        ...cardFooter,
                        color: isFirst
                          ? "rgba(255,255,255,.65)"
                          : "#64748b",
                      }}
                    >
                      {isFirst ? (
                        <Crown size={15} />
                      ) : (
                        <BarChart3
                          size={15}
                        />
                      )}

                      <span>
                        Rank #{index + 1} of{" "}
                        {
                          filteredEmployees.length
                        }
                      </span>

                      {isFirst && (
                        <ChevronUp
                          size={14}
                          style={{
                            marginLeft:
                              "auto",
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {/* =================================================
          FOOTER INFORMATION
      ================================================= */}

      {!error &&
        topEmployees.length > 0 && (
          <div style={bottomInfo}>
            <ShieldCheck size={16} />

            <span>
              Employee leaderboard updated
              from the current system data
            </span>

            <span style={bottomDivider}>
              •
            </span>

            <Users size={15} />

            <span>
              {formatNumber(
                topEmployees.length
              )}{" "}
              employees displayed
            </span>
          </div>
        )}
    </div>
  );
}

/* =====================================================
   RESPONSIVE CSS
===================================================== */

const responsiveStyles = `
  * {
    box-sizing: border-box;
  }

  .topEmployeesPage {
    width: 100%;
  }

  .spinIcon {
    animation:
      topEmployeesSpin
      0.8s
      linear
      infinite;
  }

  @keyframes topEmployeesSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  button {
    font-family: inherit;
  }

  button:hover {
    filter: brightness(1.04);
  }

  button:active {
    transform: translateY(1px);
  }

  input::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 950px) {
    .topEmployeesSummary {
      grid-template-columns:
        repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 700px) {
    .topEmployeesPage {
      padding: 16px !important;
    }

    .topEmployeesHeader {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 16px !important;
      margin-bottom: 22px !important;
    }

    .topEmployeesHeaderLeft {
      width: 100% !important;
    }

    .topEmployeesRefresh {
      width: 100% !important;
      min-height: 45px !important;
    }

    .topEmployeesSummary {
      grid-template-columns:
        1fr !important;
      gap: 12px !important;
    }

    .topEmployeesToolbar {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 11px !important;
    }

    .topEmployeesSearch {
      width: 100% !important;
    }

    .topEmployeesResultCount {
      justify-content: center !important;
      width: 100% !important;
      padding: 4px 0 !important;
    }

    .topEmployeesGrid {
      grid-template-columns:
        1fr !important;
      gap: 14px !important;
    }
  }

  @media (max-width: 480px) {
    .topEmployeesPage {
      padding: 12px !important;
    }

    .topEmployeesHeaderLeft {
      gap: 11px !important;
    }

    .topEmployeesSummary {
      margin-bottom: 16px !important;
    }

    .topEmployeesSearch {
      padding-left: 10px !important;
      padding-right: 8px !important;
    }

    .topEmployeesGrid {
      gap: 12px !important;
    }
  }
`;

/* =====================================================
   PAGE
===================================================== */

const page = {
  minHeight: "100vh",
  width: "100%",
  padding: "clamp(18px, 3vw, 36px)",
  background:
    "linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)",
  color: "#0f172a",
  fontFamily:
    "Segoe UI, Arial, sans-serif",
  overflowX: "hidden",
};

/* =====================================================
   HEADER
===================================================== */

const header = {
  maxWidth: 1450,
  margin: "0 auto 28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
};

const headerLeft = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  minWidth: 0,
};

const headerIcon = {
  width: 60,
  height: 60,
  minWidth: 60,
  borderRadius: 17,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg,#1e3a8a,#020617)",
  color: "#ffffff",
  boxShadow:
    "0 12px 28px rgba(30,58,138,.25)",
};

const eyebrow = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 4,
  color: "#2563eb",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "1px",
};

const title = {
  margin: 0,
  fontSize:
    "clamp(27px,5vw,40px)",
  fontWeight: 900,
  lineHeight: 1.15,
  letterSpacing: "-.7px",
};

const subtitle = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize:
    "clamp(13px,2vw,16px)",
  fontWeight: 500,
  lineHeight: 1.45,
};

const refreshButton = {
  border: "none",
  borderRadius: 11,
  padding: "11px 17px",
  minHeight: 43,
  background:
    "linear-gradient(135deg,#1e3a8a,#020617)",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow:
    "0 8px 18px rgba(15,23,42,.16)",
  whiteSpace: "nowrap",
};

/* =====================================================
   SUMMARY
===================================================== */

const summaryGrid = {
  maxWidth: 1450,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns:
    "repeat(4,minmax(0,1fr))",
  gap: 16,
};

const summaryCard = {
  minWidth: 0,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
  boxShadow:
    "0 7px 22px rgba(15,23,42,.06)",
};

const summaryIcon = {
  width: 46,
  height: 46,
  minWidth: 46,
  borderRadius: 13,
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryInfo = {
  minWidth: 0,
  flex: 1,
};

const summaryLabel = {
  display: "block",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 4,
};

const summaryValue = {
  display: "block",
  color: "#0f172a",
  fontSize: 21,
  fontWeight: 900,
  overflowWrap: "anywhere",
  lineHeight: 1.25,
};

const summarySub = {
  marginTop: 5,
  display: "flex",
  alignItems: "center",
  gap: 4,
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 700,
};

/* =====================================================
   TOOLBAR
===================================================== */

const toolbar = {
  maxWidth: 1450,
  margin: "0 auto 22px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 15,
  padding: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  boxShadow:
    "0 6px 18px rgba(15,23,42,.05)",
};

const searchBox = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 11,
  padding: "0 12px",
  background: "#f8fafc",
};

const searchInput = {
  width: "100%",
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  padding: "11px 0",
  color: "#0f172a",
  fontSize: 14,
};

const clearSearch = {
  width: 27,
  height: 27,
  minWidth: 27,
  border: "none",
  borderRadius: "50%",
  background: "#e2e8f0",
  color: "#475569",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const resultCount = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "#475569",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

/* =====================================================
   GRID
===================================================== */

const grid = {
  maxWidth: 1450,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(min(100%,310px),1fr))",
  gap: 20,
  alignItems: "stretch",
};

/* =====================================================
   EMPLOYEE CARD
===================================================== */

const employeeCard = {
  position: "relative",
  minWidth: 0,
  overflow: "hidden",
  borderRadius: 20,
  padding: 18,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 9px 25px rgba(15,23,42,.07)",
  transition:
    "transform .25s ease, box-shadow .25s ease",
};

const firstCard = {
  background:
    "linear-gradient(145deg,#1e3a8a,#020617)",
  color: "#ffffff",
  border:
    "1px solid rgba(37,99,235,.4)",
  boxShadow:
    "0 18px 40px rgba(2,6,23,.28)",
};

const rankBadge = {
  position: "absolute",
  top: 13,
  right: 13,
  padding: "6px 9px",
  borderRadius: 9,
  display: "flex",
  alignItems: "center",
  gap: 5,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 900,
};

const firstRank = {
  background: "#2563eb",
  color: "#ffffff",
};

const secondRank = {
  background: "#f1f5f9",
  color: "#475569",
};

const thirdRank = {
  background: "#fff7ed",
  color: "#c2410c",
};

const topLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 13,
  padding: "5px 9px",
  borderRadius: 8,
  background:
    "rgba(255,255,255,.12)",
  color: "#ffffff",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: ".4px",
};

const profile = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
};

const avatar = {
  width: 56,
  height: 56,
  minWidth: 56,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg,#1e40af,#020617)",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 900,
  border: "3px solid #e2e8f0",
};

const firstAvatar = {
  background:
    "linear-gradient(135deg,#2563eb,#0f172a)",
  border:
    "3px solid rgba(255,255,255,.35)",
};

const profileInfo = {
  minWidth: 0,
  flex: 1,
  paddingRight: 58,
};

const employeeName = {
  margin: 0,
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.2,
  overflowWrap: "anywhere",
};

const employeeEmail = {
  marginTop: 5,
  display: "flex",
  alignItems: "center",
  gap: 5,
  minWidth: 0,
  fontSize: 12,
  overflowWrap: "anywhere",
};

const statusBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  marginTop: 13,
  padding: "5px 9px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 800,
};

const activeStatus = {
  background: "#dcfce7",
  color: "#166534",
};

const inactiveStatus = {
  background: "#f1f5f9",
  color: "#64748b",
};

const divider = {
  height: 1,
  background: "#e2e8f0",
  margin: "15px 0",
};

/* =====================================================
   REVENUE
===================================================== */

const revenueSection = {
  textAlign: "center",
};

const metricHeader = {
  display: "flex",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
};

const metricHeaderSpan = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const revenueValue = {
  marginTop: 6,
  fontSize:
    "clamp(23px,5vw,29px)",
  fontWeight: 950,
  lineHeight: 1.1,
  overflowWrap: "anywhere",
};

/* =====================================================
   WATER
===================================================== */

const waterSection = {
  marginTop: 16,
  paddingTop: 13,
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const metricSmall = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
};

/* =====================================================
   PERFORMANCE
===================================================== */

const performanceWrapper = {
  marginTop: 15,
};

const performanceLabel = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 6,
  fontSize: 11,
  fontWeight: 700,
};

const performanceTitle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const progressTrack = {
  width: "100%",
  height: 7,
  borderRadius: 20,
  overflow: "hidden",
};

const progressBar = {
  height: "100%",
  minWidth: 0,
  borderRadius: 20,
  background:
    "linear-gradient(90deg,#2563eb,#38bdf8)",
  transition: "width .4s ease",
};

/* =====================================================
   CARD FOOTER
===================================================== */

const cardFooter = {
  marginTop: 15,
  paddingTop: 12,
  borderTop:
    "1px solid rgba(148,163,184,.18)",
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  fontWeight: 700,
};

/* =====================================================
   LOADING
===================================================== */

const loadingContainer = {
  minHeight: "75vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const loadingCircle = {
  width: 76,
  height: 76,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#1e40af",
  background: "#dbeafe",
  marginBottom: 18,
};

const loadingTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 21,
  fontWeight: 900,
};

const loadingText = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: 14,
};

/* =====================================================
   ERROR
===================================================== */

const errorBox = {
  maxWidth: 1450,
  margin: "0 auto 22px",
  padding: 16,
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #fecaca",
  display: "flex",
  alignItems: "center",
  gap: 13,
  boxShadow:
    "0 6px 18px rgba(15,23,42,.05)",
};

const errorIcon = {
  width: 43,
  height: 43,
  minWidth: 43,
  borderRadius: 11,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fee2e2",
  color: "#dc2626",
};

const errorContent = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const errorButton = {
  border: "none",
  borderRadius: 9,
  padding: "9px 13px",
  background: "#1e3a8a",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

/* =====================================================
   EMPTY
===================================================== */

const emptyBox = {
  maxWidth: 550,
  margin: "55px auto",
  padding: 35,
  borderRadius: 20,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 10px 30px rgba(15,23,42,.07)",
  textAlign: "center",
};

const emptyIcon = {
  width: 76,
  height: 76,
  margin: "0 auto",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eff6ff",
  color: "#1e40af",
};

const emptyTitle = {
  margin: "16px 0 7px",
  color: "#0f172a",
  fontSize: 22,
  fontWeight: 900,
};

const emptyText = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.6,
};

const button = {
  marginTop: 18,
  border: "none",
  borderRadius: 10,
  padding: "11px 17px",
  background:
    "linear-gradient(135deg,#1e3a8a,#020617)",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  cursor: "pointer",
  fontWeight: 800,
};

/* =====================================================
   BOTTOM INFORMATION
===================================================== */

const bottomInfo = {
  maxWidth: 1450,
  margin: "22px auto 0",
  padding: "12px 15px",
  borderRadius: 12,
  background: "rgba(255,255,255,.72)",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 7,
  color: "#64748b",
  fontSize: 11,
  fontWeight: 700,
};

const bottomDivider = {
  color: "#cbd5e1",
};