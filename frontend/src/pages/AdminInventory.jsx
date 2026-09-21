import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  Package,
  RefreshCw,
  Search,
  Filter,
  Boxes,
  AlertTriangle,
  Droplets,
  Snowflake,
  Waves,
  Activity,
  TrendingUp,
  CircleAlert,
  PackageCheck,
  BarChart3,
  Layers3,
  Tag,
  Gauge,
  CheckCircle2,
  ClipboardList
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminInventory() {

  const { darkMode } = useContext(ThemeContext);

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);


  /* =========================
     LOAD INVENTORY
  ========================= */

  const loadInventory = async () => {

    try {

      setLoading(true);

      const res = await fetch(`${API}/inventory`);
      const data = await res.json();

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );

      setFiltered(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(error);

      alert("Failed to load inventory");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadInventory();

  }, []);


  /* =========================
     FILTER
  ========================= */

  useEffect(() => {

    let result = [...products];

    if (search) {

      result = result.filter(p =>
        p.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    }

    if (category) {

      result = result.filter(
        p =>
          p.category === category
      );

    }

    setFiltered(result);

  }, [
    search,
    category,
    products
  ]);


  /* =========================
     SUMMARY
  ========================= */

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (sum, p) =>
        sum +
        Number(
          p.stock || 0
        ),
      0
    );

  const lowStock =
    products.filter(
      p =>
        Number(
          p.stock || 0
        ) < 5
    ).length;


  const healthyStock =
    products.filter(
      p =>
        Number(
          p.stock || 0
        ) >= 10
    ).length;


  /* =========================
     STOCK HELPERS
  ========================= */

  const getStockPercentage = (
    stock
  ) => {

    const value =
      Number(stock || 0);

    const percentage =
      Math.min(
        (value / 20) * 100,
        100
      );

    return percentage;

  };


  const getStockColor = (
    stock
  ) => {

    const value =
      Number(stock || 0);

    if (value < 5) {

      return "#dc2626";

    }

    if (value < 10) {

      return "#f59e0b";

    }

    return "#16a34a";

  };


  const getStockLabel = (
    stock
  ) => {

    const value =
      Number(stock || 0);

    if (value <= 0) {

      return "Out of Stock";

    }

    if (value < 5) {

      return "Low Stock";

    }

    if (value < 10) {

      return "Moderate";

    }

    return "Healthy";

  };


  /* =========================
     CATEGORY ICON
  ========================= */

  const CategoryIcon = ({
    category: productCategory,
    size = 18
  }) => {

    if (
      productCategory ===
      "water"
    ) {

      return (
        <Droplets
          size={size}
        />
      );

    }

    if (
      productCategory ===
      "ice"
    ) {

      return (
        <Snowflake
          size={size}
        />
      );

    }

    if (
      productCategory ===
      "refill"
    ) {

      return (
        <Waves
          size={size}
        />
      );

    }

    return (
      <Package
        size={size}
      />
    );

  };


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div
        style={{
          ...center,
          background:
            darkMode
              ? "#1e293b"
              : "#f8fafc",
          color:
            darkMode
              ? "#f8fafc"
              : "#111827"
        }}
      >

        <div
          style={loadingBox}
        >

          <div
            style={spinner}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              gap: 8,
              marginBottom: 6
            }}
          >

            <Package
              size={22}
            />

            <h3
              style={{
                margin: 0
              }}
            >
              Loading inventory...
            </h3>

          </div>

          <p
            style={{
              margin: 0,
              color:
                darkMode
                  ? "#94a3b8"
                  : "#64748b"
            }}
          >
            Please wait while we
            load your stock.
          </p>

        </div>

      </div>

    );

  }


  return (

    <div
      style={{
        ...page,
        background:
          darkMode
            ? "#1e293b"
            : "#f8fafc",
        color:
          darkMode
            ? "#f8fafc"
            : "#111827"
      }}
    >

      {/* =========================
          TITLE
      ========================= */}

      <div
        style={header}
      >

        <div>

          <h1
            style={{
              ...title,
              color:
                darkMode
                  ? "#f8fafc"
                  : "#1e3a8a",
              display: "flex",
              alignItems:
                "center",
              gap: 10
            }}
          >

            <Package
              size={32}
              strokeWidth={2.2}
            />

            Inventory

          </h1>

          <p
            style={{
              margin:
                "6px 0 0",
              color:
                darkMode
                  ? "#cbd5e1"
                  : "#64748b",
              display: "flex",
              alignItems:
                "center",
              gap: 7,
              lineHeight: 1.5
            }}
          >

            <ClipboardList
              size={17}
            />

            Monitor product stock
            and low-stock levels.

          </p>

        </div>

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <div
        style={{
          ...card,
          background:
            darkMode
              ? "#334155"
              : "#ffffff"
        }}
      >

        <div
          style={summaryRow}
        >

          {/* TOTAL PRODUCTS */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#2563eb,#1e3a8a)"
            }}
          >

            <div
              style={
                summaryIconRow
              }
            >

              <div
                style={
                  summaryIcon
                }
              >

                <Boxes
                  size={22}
                />

              </div>

              <span>
                Total Products
              </span>

            </div>

            <p
              style={
                summaryNumber
              }
            >
              {totalProducts}
            </p>

            <div
              style={
                summaryDescription
              }
            >

              <Package
                size={14}
              />

              Products in inventory

            </div>

          </div>


          {/* TOTAL STOCK */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#3b82f6,#2563eb)"
            }}
          >

            <div
              style={
                summaryIconRow
              }
            >

              <div
                style={
                  summaryIcon
                }
              >

                <Layers3
                  size={22}
                />

              </div>

              <span>
                Total Stock
              </span>

            </div>

            <p
              style={
                summaryNumber
              }
            >
              {totalStock}
            </p>

            <div
              style={
                summaryDescription
              }
            >

              <Activity
                size={14}
              />

              Units currently available

            </div>

          </div>


          {/* LOW STOCK */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#64748b,#334155)"
            }}
          >

            <div
              style={
                summaryIconRow
              }
            >

              <div
                style={
                  summaryIcon
                }
              >

                <AlertTriangle
                  size={22}
                />

              </div>

              <span>
                Low Stock
              </span>

            </div>

            <p
              style={
                summaryNumber
              }
            >
              {lowStock}
            </p>

            <div
              style={
                summaryDescription
              }
            >

              <CircleAlert
                size={14}
              />

              Products needing attention

            </div>

          </div>


          {/* HEALTHY STOCK */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#16a34a,#15803d)"
            }}
          >

            <div
              style={
                summaryIconRow
              }
            >

              <div
                style={
                  summaryIcon
                }
              >

                <CheckCircle2
                  size={22}
                />

              </div>

              <span>
                Healthy Stock
              </span>

            </div>

            <p
              style={
                summaryNumber
              }
            >
              {healthyStock}
            </p>

            <div
              style={
                summaryDescription
              }
            >

              <TrendingUp
                size={14}
              />

              Products with good stock

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          FILTERS
      ========================= */}

      <div
        style={{
          ...card,
          background:
            darkMode
              ? "#334155"
              : "#ffffff"
        }}
      >

        <div
          style={
            filterTitle
          }
        >

          <div
            style={
              filterHeading
            }
          >

            <Filter
              size={19}
            />

            <strong>
              Inventory Filters
            </strong>

          </div>

          <span
            style={{
              color:
                darkMode
                  ? "#94a3b8"
                  : "#64748b",
              fontSize: 13
            }}
          >
            {filtered.length}
            {" "}
            product
            {filtered.length !== 1
              ? "s"
              : ""}{" "}
            shown
          </span>

        </div>


        <div
          style={filterRow}
        >

          {/* SEARCH */}

          <div
            style={
              fieldWrapper
            }
          >

            <label
              style={{
                ...fieldLabel,
                color:
                  darkMode
                    ? "#e2e8f0"
                    : "#374151"
              }}
            >

              <Search
                size={16}
              />

              Search Product

            </label>

            <div
              style={
                inputWithIcon
              }
            >

              <Search
                size={18}
                style={
                  inputIcon
                }
              />

              <input
                style={{
                  ...input,
                  paddingLeft: 42,
                  background:
                    darkMode
                      ? "#1e293b"
                      : "#ffffff",
                  color:
                    darkMode
                      ? "#f8fafc"
                      : "#111827",
                  borderColor:
                    darkMode
                      ? "#64748b"
                      : "#d1d5db"
                }}
                placeholder="Search product..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* CATEGORY */}

          <div
            style={
              fieldWrapper
            }
          >

            <label
              style={{
                ...fieldLabel,
                color:
                  darkMode
                    ? "#e2e8f0"
                    : "#374151"
              }}
            >

              <Tag
                size={16}
              />

              Category

            </label>

            <div
              style={
                inputWithIcon
              }
            >

              <Tag
                size={18}
                style={
                  inputIcon
                }
              />

              <select
                style={{
                  ...input,
                  paddingLeft: 42,
                  background:
                    darkMode
                      ? "#1e293b"
                      : "#ffffff",
                  color:
                    darkMode
                      ? "#f8fafc"
                      : "#111827",
                  borderColor:
                    darkMode
                      ? "#64748b"
                      : "#d1d5db"
                }}
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Categories
                </option>

                <option value="water">
                  Water
                </option>

                <option value="ice">
                  Ice
                </option>

                <option value="refill">
                  Refill
                </option>

              </select>

            </div>

          </div>


          {/* REFRESH */}

          <div
            style={
              refreshWrapper
            }
          >

            <label
              style={{
                ...fieldLabel,
                color:
                  darkMode
                    ? "#e2e8f0"
                    : "#374151"
              }}
            >

              <RefreshCw
                size={16}
              />

              Inventory

            </label>

            <button
              style={{
                ...refreshBtn,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: 8
              }}
              onClick={
                loadInventory
              }
            >

              <RefreshCw
                size={18}
                strokeWidth={2.2}
              />

              Refresh Inventory

            </button>

          </div>

        </div>

      </div>


      {/* =========================
          INVENTORY TABLE/CARDS
      ========================= */}

      <div
        style={{
          ...tableCard,
          background:
            darkMode
              ? "#334155"
              : "#ffffff"
        }}
      >

        {/* TABLE HEADER */}

        <div
          style={tableHeader}
        >

          <div>

            <h2
              style={{
                margin: 0,
                color:
                  darkMode
                    ? "#f8fafc"
                    : "#111827",
                display: "flex",
                alignItems:
                  "center",
                gap: 9,
                fontSize:
                  "clamp(19px,4vw,24px)"
              }}
            >

              <BarChart3
                size={23}
              />

              Stock Overview

            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  darkMode
                    ? "#cbd5e1"
                    : "#64748b",
                display: "flex",
                alignItems:
                  "center",
                gap: 6
              }}
            >

              <PackageCheck
                size={15}
              />

              {filtered.length}
              {" "}
              product
              {filtered.length !== 1
                ? "s"
                : ""}{" "}
              found

            </p>

          </div>

        </div>


        {/* DESKTOP TABLE */}

        <div
          style={tableWrapper}
          className="inventory-desktop-table"
        >

          <table
            style={table}
          >

            <thead>

              <tr
                style={{
                  background:
                    "#1e3a8a",
                  color: "white"
                }}
              >

                <th style={th}>

                  <span
                    style={
                      tableHeaderCell
                    }
                  >

                    <Package
                      size={16}
                    />

                    Product

                  </span>

                </th>


                <th style={th}>

                  <span
                    style={
                      tableHeaderCell
                    }
                  >

                    <Tag
                      size={16}
                    />

                    Category

                  </span>

                </th>


                <th style={th}>

                  <span
                    style={
                      tableHeaderCell
                    }
                  >

                    <Boxes
                      size={16}
                    />

                    Stock

                  </span>

                </th>


                <th style={th}>

                  <span
                    style={
                      tableHeaderCell
                    }
                  >

                    <Gauge
                      size={16}
                    />

                    Stock Level

                  </span>

                </th>

              </tr>

            </thead>


            <tbody>

              {filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    style={{
                      ...emptyCell,
                      color:
                        darkMode
                          ? "#cbd5e1"
                          : "#64748b"
                    }}
                  >

                    <div
                      style={
                        emptyState
                      }
                    >

                      <Package
                        size={42}
                        strokeWidth={1.5}
                      />

                      <strong>
                        No products found
                      </strong>

                      <span>
                        Try changing your
                        search or category
                        filter.
                      </span>

                    </div>

                  </td>

                </tr>

              ) : (

                filtered.map(
                  (p, index) => {

                    const stock =
                      Number(
                        p.stock || 0
                      );

                    const percentage =
                      getStockPercentage(
                        stock
                      );

                    const stockColor =
                      getStockColor(
                        stock
                      );

                    const stockLabel =
                      getStockLabel(
                        stock
                      );

                    return (

                      <tr
                        key={p._id}
                        style={{
                          background:
                            index % 2 === 0
                              ? (
                                darkMode
                                  ? "#334155"
                                  : "#ffffff"
                              )
                              : (
                                darkMode
                                  ? "#293548"
                                  : "#f8fafc"
                              )
                        }}
                      >

                        {/* PRODUCT */}

                        <td
                          style={{
                            ...td,
                            color:
                              darkMode
                                ? "#f8fafc"
                                : "#111827"
                          }}
                        >

                          <div
                            style={
                              productCell
                            }
                          >

                            <div
                              style={
                                productIcon
                              }
                            >

                              <CategoryIcon
                                category={
                                  p.category
                                }
                                size={19}
                              />

                            </div>

                            <div>

                              <strong>
                                {p.name}
                              </strong>

                              <span
                                style={{
                                  color:
                                    darkMode
                                      ? "#94a3b8"
                                      : "#64748b",
                                  fontSize: 13,
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: 5,
                                  marginTop: 4
                                }}
                              >

                                <Package
                                  size={13}
                                />

                                {p.size}

                              </span>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td
                          style={td}
                        >

                          <span
                            style={{
                              ...categoryBadge,
                              background:
                                darkMode
                                  ? "#1e40af"
                                  : "#dbeafe",
                              color:
                                darkMode
                                  ? "#dbeafe"
                                  : "#1e3a8a",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 6
                            }}
                          >

                            <CategoryIcon
                              category={
                                p.category
                              }
                              size={14}
                            />

                            {p.category}

                          </span>

                        </td>


                        {/* STOCK */}

                        <td
                          style={td}
                        >

                          <div
                            style={
                              stockCell
                            }
                          >

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: 7
                              }}
                            >

                              <Boxes
                                size={16}
                                style={{
                                  color:
                                    stockColor
                                }}
                              />

                              <span
                                style={{
                                  color:
                                    stockColor,
                                  fontWeight: 700,
                                  fontSize: 17
                                }}
                              >
                                {stock}
                              </span>

                            </div>

                            <span
                              style={{
                                ...stockStatusBadge,
                                background:
                                  `${stockColor}20`,
                                color:
                                  stockColor
                              }}
                            >

                              {stock < 5 && (
                                <AlertTriangle
                                  size={12}
                                />
                              )}

                              {stock >= 10 && (
                                <CheckCircle2
                                  size={12}
                                />
                              )}

                              {stockLabel}

                            </span>

                          </div>

                        </td>


                        {/* PROGRESS BAR */}

                        <td
                          style={td}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 10,
                              minWidth: 180
                            }}
                          >

                            <div
                              style={{
                                flex: 1,
                                height: 10,
                                background:
                                  darkMode
                                    ? "#475569"
                                    : "#e5e7eb",
                                borderRadius: 20,
                                overflow:
                                  "hidden"
                              }}
                            >

                              <div
                                style={{
                                  width:
                                    `${percentage}%`,
                                  height:
                                    "100%",
                                  background:
                                    stockColor,
                                  borderRadius:
                                    20,
                                  transition:
                                    "width .4s ease"
                                }}
                              />

                            </div>

                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color:
                                  darkMode
                                    ? "#cbd5e1"
                                    : "#475569",
                                minWidth: 38,
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: 3
                              }}
                            >

                              <Gauge
                                size={12}
                              />

                              {Math.round(
                                percentage
                              )}%

                            </span>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =========================
            MOBILE CARDS
        ========================= */}

        <div
          className="inventory-mobile-list"
          style={
            mobileList
          }
        >

          {filtered.length === 0 ? (

            <div
              style={{
                ...emptyMobile,
                color:
                  darkMode
                    ? "#cbd5e1"
                    : "#64748b"
              }}
            >

              <Package
                size={42}
                strokeWidth={1.5}
              />

              <strong>
                No products found
              </strong>

              <span>
                Try changing your search
                or category filter.
              </span>

            </div>

          ) : (

            filtered.map(
              (p) => {

                const stock =
                  Number(
                    p.stock || 0
                  );

                const percentage =
                  getStockPercentage(
                    stock
                  );

                const stockColor =
                  getStockColor(
                    stock
                  );

                const stockLabel =
                  getStockLabel(
                    stock
                  );

                return (

                  <div
                    key={p._id}
                    style={{
                      ...mobileProductCard,
                      background:
                        darkMode
                          ? "#293548"
                          : "#ffffff",
                      borderColor:
                        darkMode
                          ? "#475569"
                          : "#e2e8f0"
                    }}
                  >

                    {/* MOBILE PRODUCT HEADER */}

                    <div
                      style={
                        mobileCardHeader
                      }
                    >

                      <div
                        style={
                          mobileProductInfo
                        }
                      >

                        <div
                          style={
                            mobileProductIcon
                          }
                        >

                          <CategoryIcon
                            category={
                              p.category
                            }
                            size={22}
                          />

                        </div>

                        <div
                          style={{
                            minWidth: 0
                          }}
                        >

                          <h3
                            style={{
                              margin: 0,
                              fontSize: 16,
                              color:
                                darkMode
                                  ? "#f8fafc"
                                  : "#111827",
                              overflowWrap:
                                "anywhere"
                            }}
                          >
                            {p.name}
                          </h3>

                          <span
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 5,
                              marginTop: 4,
                              fontSize: 13,
                              color:
                                darkMode
                                  ? "#94a3b8"
                                  : "#64748b"
                            }}
                          >

                            <Package
                              size={13}
                            />

                            {p.size}

                          </span>

                        </div>

                      </div>


                      <span
                        style={{
                          ...categoryBadge,
                          background:
                            darkMode
                              ? "#1e40af"
                              : "#dbeafe",
                          color:
                            darkMode
                              ? "#dbeafe"
                              : "#1e3a8a",
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: 5,
                          flexShrink: 0
                        }}
                      >

                        <CategoryIcon
                          category={
                            p.category
                          }
                          size={13}
                        />

                        {p.category}

                      </span>

                    </div>


                    {/* MOBILE STOCK */}

                    <div
                      style={
                        mobileStockSection
                      }
                    >

                      <div
                        style={
                          mobileStockTop
                        }
                      >

                        <div
                          style={
                            mobileStockValue
                          }
                        >

                          <Boxes
                            size={18}
                            style={{
                              color:
                                stockColor
                            }}
                          />

                          <span
                            style={{
                              color:
                                stockColor,
                              fontSize: 23,
                              fontWeight: 800
                            }}
                          >
                            {stock}
                          </span>

                          <span
                            style={{
                              color:
                                darkMode
                                  ? "#cbd5e1"
                                  : "#64748b",
                              fontSize: 13
                            }}
                          >
                            units
                          </span>

                        </div>


                        <span
                          style={{
                            ...stockStatusBadge,
                            background:
                              `${stockColor}20`,
                            color:
                              stockColor
                          }}
                        >

                          {stock < 5 && (
                            <AlertTriangle
                              size={13}
                            />
                          )}

                          {stock >= 10 && (
                            <CheckCircle2
                              size={13}
                            />
                          )}

                          {stockLabel}

                        </span>

                      </div>


                      {/* MOBILE PROGRESS */}

                      <div
                        style={
                          mobileProgressWrapper
                        }
                      >

                        <div
                          style={{
                            ...mobileProgressTrack,
                            background:
                              darkMode
                                ? "#475569"
                                : "#e5e7eb"
                          }}
                        >

                          <div
                            style={{
                              width:
                                `${percentage}%`,
                              height:
                                "100%",
                              background:
                                stockColor,
                              borderRadius:
                                20,
                              transition:
                                "width .4s ease"
                            }}
                          />

                        </div>

                        <div
                          style={
                            mobileProgressText
                          }
                        >

                          <Gauge
                            size={13}
                          />

                          {Math.round(
                            percentage
                          )}% stock level

                        </div>

                      </div>

                    </div>

                  </div>

                );

              }

            )

          )}

        </div>

      </div>


      {/* =========================
          RESPONSIVE CSS
      ========================= */}

      <style>{`

        .inventory-mobile-list {
          display: none;
        }

        .inventory-desktop-table {
          display: block;
        }

        @media (max-width: 767px) {

          .inventory-desktop-table {
            display: none !important;
          }

          .inventory-mobile-list {
            display: flex !important;
          }

        }

        @media (max-width: 520px) {

          .inventory-page {
            padding-left: 12px;
            padding-right: 12px;
          }

        }

      `}</style>

    </div>

  );

}


/* =========================
   STYLES
========================= */

const page = {
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  padding: "clamp(15px,4vw,30px)",
  boxSizing: "border-box",
  minHeight: "100vh",
  overflowX: "hidden"
};


const header = {
  marginBottom: 20
};


const title = {
  fontSize:
    "clamp(24px,5vw,32px)",
  fontWeight: 700,
  margin: 0
};


/* =========================
   SUMMARY
========================= */

const summaryRow = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15
};


const summaryCard = {
  padding: 20,
  borderRadius: 16,
  boxShadow:
    "0 8px 25px rgba(0,0,0,.15)",
  width: "100%",
  boxSizing: "border-box",
  color: "white",
  minHeight: 145
};


const summaryIconRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontSize: 14,
  fontWeight: 600
};


const summaryIcon = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background:
    "rgba(255,255,255,.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};


const summaryNumber = {
  fontSize: 32,
  fontWeight: 700,
  margin: "10px 0 5px"
};


const summaryDescription = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  opacity: 0.88
};


/* =========================
   GENERAL CARD
========================= */

const card = {
  padding: 20,
  borderRadius: 16,
  boxShadow:
    "0 8px 25px rgba(0,0,0,.08)",
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box"
};


/* =========================
   FILTERS
========================= */

const filterTitle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 15
};


const filterHeading = {
  display: "flex",
  alignItems: "center",
  gap: 8
};


const filterRow = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  alignItems: "end"
};


const fieldWrapper = {
  width: "100%",
  minWidth: 0
};


const refreshWrapper = {
  width: "100%",
  minWidth: 0
};


const fieldLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 7
};


const inputWithIcon = {
  position: "relative",
  width: "100%"
};


const inputIcon = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform:
    "translateY(-50%)",
  opacity: 0.7,
  pointerEvents: "none",
  zIndex: 1
};


const input = {
  width: "100%",
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 9,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
  minHeight: 46
};


const refreshBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: 9,
  cursor: "pointer",
  width: "100%",
  fontWeight: 600,
  minHeight: 46
};


/* =========================
   TABLE
========================= */

const tableCard = {
  borderRadius: 16,
  boxShadow:
    "0 8px 25px rgba(0,0,0,.08)",
  width: "100%",
  overflow: "hidden"
};


const tableHeader = {
  padding: 20,
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10
};


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling:
    "touch"
};


const table = {
  width: "100%",
  minWidth: 760,
  borderCollapse:
    "collapse"
};


const th = {
  padding: 14,
  textAlign: "left",
  whiteSpace:
    "nowrap",
  fontSize: 14
};


const tableHeaderCell = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7
};


const td = {
  padding: 14,
  borderTop:
    "1px solid rgba(148,163,184,.2)",
  whiteSpace:
    "nowrap"
};


/* =========================
   PRODUCT
========================= */

const productCell = {
  display: "flex",
  alignItems: "center",
  gap: 11
};


const productIcon = {
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 10,
  background: "#dbeafe",
  color: "#1e3a8a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};


const categoryBadge = {
  padding:
    "6px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  textTransform:
    "capitalize"
};


const stockCell = {
  display: "flex",
  alignItems: "center",
  gap: 9
};


const stockStatusBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding:
    "5px 8px",
  borderRadius: 7,
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap"
};


/* =========================
   EMPTY STATE
========================= */

const emptyCell = {
  padding: 40,
  textAlign: "center"
};


const emptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8
};


/* =========================
   MOBILE
========================= */

const mobileList = {
  flexDirection: "column",
  gap: 12,
  padding: "0 15px 15px"
};


const mobileProductCard = {
  width: "100%",
  boxSizing: "border-box",
  border:
    "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 15,
  boxShadow:
    "0 4px 14px rgba(0,0,0,.06)"
};


const mobileCardHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 15
};


const mobileProductInfo = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
  flex: 1
};


const mobileProductIcon = {
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: 12,
  background: "#dbeafe",
  color: "#1e3a8a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};


const mobileStockSection = {
  borderTop:
    "1px solid rgba(148,163,184,.2)",
  paddingTop: 13
};


const mobileStockTop = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap"
};


const mobileStockValue = {
  display: "flex",
  alignItems: "center",
  gap: 7
};


const mobileProgressWrapper = {
  marginTop: 13
};


const mobileProgressTrack = {
  width: "100%",
  height: 9,
  borderRadius: 20,
  overflow: "hidden"
};


const mobileProgressText = {
  marginTop: 7,
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b"
};


const emptyMobile = {
  padding: "35px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  textAlign: "center"
};


/* =========================
   LOADING
========================= */

const center = {
  display: "flex",
  justifyContent:
    "center",
  alignItems:
    "center",
  minHeight: "60vh",
  width: "100%"
};


const loadingBox = {
  textAlign: "center"
};


const spinner = {
  width: 35,
  height: 35,
  border:
    "4px solid #dbeafe",
  borderTop:
    "4px solid #2563eb",
  borderRadius: "50%",
  margin:
    "0 auto 15px",
  animation:
    "spin 1s linear infinite"
};