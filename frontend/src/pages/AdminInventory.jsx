import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  Package,
  RefreshCw
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminInventory() {

  const { darkMode } = useContext(ThemeContext);

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);


  const loadInventory = async () => {

    try {

      setLoading(true);

      const res = await fetch(`${API}/inventory`);
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);

    } catch {

      alert("Failed to load inventory");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadInventory();

  }, []);


  /* FILTER */

  useEffect(() => {

    let result = [...products];

    if (search) {

      result = result.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );

    }

    if (category) {

      result = result.filter(
        p => p.category === category
      );

    }

    setFiltered(result);

  }, [search, category, products]);


  /* SUMMARY */

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  );

  const lowStock = products.filter(
    p => Number(p.stock || 0) < 5
  ).length;


  /*
    STOCK PROGRESS
  */

  const getStockPercentage = (stock) => {

    const value = Number(stock || 0);

    const percentage = Math.min(
      (value / 20) * 100,
      100
    );

    return percentage;

  };


  const getStockColor = (stock) => {

    const value = Number(stock || 0);

    if (value < 5) return "#dc2626";

    if (value < 10) return "#f59e0b";

    return "#16a34a";

  };


  if (loading) {

    return (
      <div
        style={{
          ...center,
          background: darkMode
            ? "#1e293b"
            : "#f8fafc",
          color: darkMode
            ? "#f8fafc"
            : "#111827"
        }}
      >

        <div style={loadingBox}>

          <div style={spinner}></div>

          <h3>
            Loading inventory...
          </h3>

        </div>

      </div>
    );

  }


  return (

    <div
      style={{
        ...page,
        background: darkMode
          ? "#1e293b"
          : "#f8fafc",
        color: darkMode
          ? "#f8fafc"
          : "#111827"
      }}
    >

      {/* TITLE */}

      <div style={header}>

        <div>

          <h1
            style={{
              ...title,
              color: darkMode
                ? "#f8fafc"
                : "#1e3a8a",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >

            <Package
              size={30}
              strokeWidth={2.2}
            />

            Inventory

          </h1>

          <p
            style={{
              margin: 0,
              color: darkMode
                ? "#cbd5e1"
                : "#64748b"
            }}
          >
            Monitor product stock and low-stock levels.
          </p>

        </div>

      </div>


      {/* SUMMARY */}

      <div
        style={{
          ...card,
          background: darkMode
            ? "#334155"
            : "#ffffff"
        }}
      >

        <div style={summaryRow}>

          {/* TOTAL PRODUCTS */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#2563eb,#1e3a8a)"
            }}
          >

            <h3>
              Total Products
            </h3>

            <p style={summaryNumber}>
              {totalProducts}
            </p>

          </div>


          {/* TOTAL STOCK */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#3b82f6,#2563eb)"
            }}
          >

            <h3>
              Total Stock
            </h3>

            <p style={summaryNumber}>
              {totalStock}
            </p>

          </div>


          {/* LOW STOCK */}

          <div
            style={{
              ...summaryCard,
              background:
                "linear-gradient(135deg,#64748b,#334155)"
            }}
          >

            <h3>
              Low Stock
            </h3>

            <p style={summaryNumber}>
              {lowStock}
            </p>

          </div>

        </div>

      </div>


      {/* FILTERS */}

      <div
        style={{
          ...card,
          background: darkMode
            ? "#334155"
            : "#ffffff"
        }}
      >

        <div style={filterRow}>

          <input
            style={{
              ...input,
              background: darkMode
                ? "#1e293b"
                : "#ffffff",
              color: darkMode
                ? "#f8fafc"
                : "#111827",
              borderColor: darkMode
                ? "#64748b"
                : "#d1d5db"
            }}
            placeholder="Search product..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />


          <select
            style={{
              ...input,
              background: darkMode
                ? "#1e293b"
                : "#ffffff",
              color: darkMode
                ? "#f8fafc"
                : "#111827",
              borderColor: darkMode
                ? "#64748b"
                : "#d1d5db"
            }}
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
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


          <button
            style={{
              ...refreshBtn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
            onClick={loadInventory}
          >

            <RefreshCw
              size={18}
              strokeWidth={2.2}
            />

            Refresh

          </button>

        </div>

      </div>


      {/* INVENTORY TABLE */}

      <div
        style={{
          ...tableCard,
          background: darkMode
            ? "#334155"
            : "#ffffff"
        }}
      >

        <div style={tableHeader}>

          <div>

            <h2
              style={{
                margin: 0,
                color: darkMode
                  ? "#f8fafc"
                  : "#111827"
              }}
            >
              Stock Overview
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: darkMode
                  ? "#cbd5e1"
                  : "#64748b"
              }}
            >
              {filtered.length} product
              {filtered.length !== 1 ? "s" : ""} found
            </p>

          </div>

        </div>


        <div style={tableWrapper}>

          <table style={table}>

            <thead>

              <tr
                style={{
                  background: "#1e3a8a",
                  color: "white"
                }}
              >

                <th style={th}>
                  Product
                </th>

                <th style={th}>
                  Category
                </th>

                <th style={th}>
                  Stock
                </th>

                <th style={th}>
                  Stock Level
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
                      color: darkMode
                        ? "#cbd5e1"
                        : "#64748b"
                    }}
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                filtered.map((p, index) => {

                  const stock =
                    Number(p.stock || 0);

                  const percentage =
                    getStockPercentage(stock);

                  const stockColor =
                    getStockColor(stock);

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

                      <td style={td}>

                        <strong>
                          {p.name}
                        </strong>

                        <br />

                        <span
                          style={{
                            color: darkMode
                              ? "#94a3b8"
                              : "#64748b",
                            fontSize: 13
                          }}
                        >
                          {p.size}
                        </span>

                      </td>


                      {/* CATEGORY */}

                      <td style={td}>

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
                                : "#1e3a8a"
                          }}
                        >
                          {p.category}
                        </span>

                      </td>


                      {/* STOCK */}

                      <td style={td}>

                        <span
                          style={{
                            color: stockColor,
                            fontWeight: 700,
                            fontSize: 17
                          }}
                        >
                          {stock}
                        </span>

                        {stock < 5 && (

                          <span
                            style={lowBadge}
                          >
                            LOW
                          </span>

                        )}

                      </td>


                      {/* PROGRESS BAR */}

                      <td style={td}>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
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
                              overflow: "hidden"
                            }}
                          >

                            <div
                              style={{
                                width:
                                  `${percentage}%`,
                                height: "100%",
                                background:
                                  stockColor,
                                borderRadius: 20,
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
                              minWidth: 38
                            }}
                          >
                            {Math.round(
                              percentage
                            )}%
                          </span>

                        </div>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

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
  fontSize: "clamp(24px,5vw,32px)",
  fontWeight: 700,
  margin: 0
};


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
  color: "white"
};


const summaryNumber = {
  fontSize: 32,
  fontWeight: 700,
  margin: "5px 0 0"
};


const card = {
  padding: 20,
  borderRadius: 16,
  boxShadow:
    "0 8px 25px rgba(0,0,0,.08)",
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box"
};


const filterRow = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  alignItems: "center"
};


const input = {
  width: "100%",
  padding: 12,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none"
};


const refreshBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
  maxWidth: 180,
  fontWeight: 600
};


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
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10
};


const table = {
  width: "100%",
  minWidth: 700,
  borderCollapse: "collapse"
};


const th = {
  padding: 14,
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: 14
};


const td = {
  padding: 14,
  borderTop: "1px solid rgba(148,163,184,.2)",
  whiteSpace: "nowrap"
};


const categoryBadge = {
  padding: "5px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "capitalize"
};


const lowBadge = {
  marginLeft: 10,
  background: "#dc2626",
  color: "white",
  padding: "3px 7px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700
};


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch"
};


const emptyCell = {
  padding: 40,
  textAlign: "center"
};


const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
  width: "100%"
};


const loadingBox = {
  textAlign: "center"
};


const spinner = {
  width: 35,
  height: 35,
  border: "4px solid #dbeafe",
  borderTop: "4px solid #2563eb",
  borderRadius: "50%",
  margin: "0 auto 15px",
  animation: "spin 1s linear infinite"
};