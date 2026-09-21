import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Tag,
  DollarSign,
  Boxes,
  Pencil,
  Trash2,
  PlusCircle,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Snowflake,
  Waves,
  ShoppingBag,
  RefreshCw,
  PackagePlus,
  CircleDollarSign,
  ClipboardList,
  Layers3,
  Edit3,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function AdminProducts() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    size: "",
    category: "water",
    price: "",
    stock: "",
  });

  /* MODALS */

  const [priceModal, setPriceModal] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  /* VALIDATION ERROR */

  const [error, setError] = useState("");

  /* =====================================================
     AUTH FETCH
  ===================================================== */

  const authFetch = async (url) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      navigate("/");
      throw new Error("Session expired");
    }

    return res.json();
  };

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await authFetch(`${API}/products`);

      setProducts(data);
    } catch {
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return navigate("/");

    loadProducts();
  }, []);

  /* =====================================================
     CREATE PRODUCT
  ===================================================== */

  const createProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.size ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      setError("Please fill in all fields");
      return;
    }

    setError("");

    try {
      await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      setNewProduct({
        name: "",
        size: "",
        category: "water",
        price: "",
        stock: "",
      });

      loadProducts();
    } catch {
      alert("Failed to create product");
    }
  };

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  const confirmDelete = async () => {
    await fetch(`${API}/products/${deleteModal._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDeleteModal(null);
    loadProducts();
  };

  /* =====================================================
     UPDATE PRICE
  ===================================================== */

  const updatePrice = async () => {
    await fetch(`${API}/products/${priceModal._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price: priceModal.price,
      }),
    });

    setPriceModal(null);
    loadProducts();
  };

  /* =====================================================
     ADD STOCK
  ===================================================== */

  const addStock = async () => {
    await fetch(`${API}/products/${stockModal._id}/stock`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: stockModal.quantity,
      }),
    });

    setStockModal(null);
    loadProducts();
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =====================================================
     CURRENCY
  ===================================================== */

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n || 0);

  /* =====================================================
     CATEGORY ICON
  ===================================================== */

  const getCategoryIcon = (category) => {
    const value = String(category || "").toLowerCase();

    if (value === "water") return Droplets;
    if (value === "ice") return Snowflake;
    if (value === "refill") return Waves;

    return Tag;
  };

  /* =====================================================
     CATEGORY LABEL
  ===================================================== */

  const getCategoryLabel = (category) => {
    if (!category) return "Other";

    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  /* =====================================================
     STOCK STATUS
  ===================================================== */

  const getStockStatus = (stock) => {
    if (stock < 5) {
      return {
        label: "Low Stock",
        color: "#dc2626",
        background: "rgba(220,38,38,.10)",
        icon: AlertTriangle,
      };
    }

    return {
      label: "In Stock",
      color: "#16a34a",
      background: "rgba(22,163,74,.10)",
      icon: CheckCircle2,
    };
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={loadingPage(theme)}>
        <Package size={34} strokeWidth={1.8} />
        <RefreshCw
          size={22}
          className="products-spinner"
          strokeWidth={2}
        />
        <span>Loading products...</span>

        <style>{`
          .products-spinner {
            animation: productsSpin 1s linear infinite;
          }

          @keyframes productsSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={page(theme)} className="products-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="products-page-header">
        <div>
          <h1 style={title(theme)}>
            <Package size={30} strokeWidth={2.2} />
            Product Management
          </h1>

          <p style={subtitle(theme)}>
            <ClipboardList size={16} />
            Manage your products, prices and stock levels.
          </p>
        </div>

        <div style={productCount(theme)}>
          <ShoppingBag size={17} />
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Product" : "Products"}
          </span>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div style={searchWrapper(theme)} className="products-search">
        <Search size={19} strokeWidth={2} />

        <input
          style={searchInput(theme)}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =====================================================
          ADD PRODUCT
      ===================================================== */}

      <div style={card(theme)}>
        <h3 style={sectionTitle(theme)}>
          <PackagePlus size={21} strokeWidth={2.2} />
          Add Product
        </h3>

        <div style={formGrid} className="products-form-grid">
          {/* NAME */}

          <div className="product-form-field">
            <label style={fieldLabel(theme)}>
              <Package size={15} />
              Product Name
            </label>

            <input
              style={input(theme)}
              placeholder="e.g. Sediba Still Water"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  name: e.target.value,
                })
              }
            />
          </div>

          {/* SIZE */}

          <div className="product-form-field">
            <label style={fieldLabel(theme)}>
              <Layers3 size={15} />
              Size
            </label>

            <input
              style={input(theme)}
              placeholder="e.g. 500ml"
              value={newProduct.size}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  size: e.target.value,
                })
              }
            />
          </div>

          {/* CATEGORY */}

          <div className="product-form-field">
            <label style={fieldLabel(theme)}>
              <Tag size={15} />
              Category
            </label>

            <select
              style={input(theme)}
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  category: e.target.value,
                })
              }
            >
              <option value="water">Water</option>
              <option value="ice">Ice</option>
              <option value="refill">Refill</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* PRICE */}

          <div className="product-form-field">
            <label style={fieldLabel(theme)}>
              <DollarSign size={15} />
              Price
            </label>

            <input
              style={input(theme)}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: e.target.value,
                })
              }
            />
          </div>

          {/* STOCK */}

          <div className="product-form-field">
            <label style={fieldLabel(theme)}>
              <Boxes size={15} />
              Initial Stock
            </label>

            <input
              style={input(theme)}
              type="number"
              placeholder="0"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock: e.target.value,
                })
              }
            />
          </div>

          {/* BUTTON */}

          <div className="product-add-button-wrapper">
            <button onClick={createProduct} style={addBtn}>
              <Plus size={18} strokeWidth={2.4} />
              Add Product
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div style={errorBox(theme)}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* =====================================================
          PRODUCTS TABLE
      ===================================================== */}

      <div style={card(theme)} className="products-list-card">
        <div style={listHeader(theme)}>
          <div style={listHeaderTitle}>
            <Package size={20} />
            <span>Products</span>
          </div>

          <div style={listHeaderCount(theme)}>
            <Layers3 size={15} />
            {filteredProducts.length} listed
          </div>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div
          className="products-desktop-table"
          style={{ overflowX: "auto" }}
        >
          <table style={table}>
            <thead>
              <tr style={thead(theme)}>
                <th style={th(theme)}>
                  <span className="table-heading">
                    <Package size={16} />
                    Product
                  </span>
                </th>

                <th style={th(theme)}>
                  <span className="table-heading">
                    <Tag size={16} />
                    Category
                  </span>
                </th>

                <th style={th(theme)}>
                  <span className="table-heading">
                    <CircleDollarSign size={16} />
                    Price
                  </span>
                </th>

                <th style={th(theme)}>
                  <span className="table-heading">
                    <Boxes size={16} />
                    Stock
                  </span>
                </th>

                <th style={th(theme)}>
                  <span className="table-heading">
                    <Edit3 size={16} />
                    Actions
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p, i) => {
                const CategoryIcon = getCategoryIcon(p.category);
                const stockStatus = getStockStatus(p.stock);
                const StockStatusIcon = stockStatus.icon;

                return (
                  <tr
                    key={p._id}
                    style={i % 2 ? rowAlt : row}
                  >
                    {/* PRODUCT */}

                    <td style={td(theme)}>
                      <div className="product-name-cell">
                        <div style={productIcon(theme)}>
                          <CategoryIcon size={19} />
                        </div>

                        <div>
                          <strong>{p.name}</strong>

                          <div style={sizeText}>
                            <Layers3 size={13} />
                            {p.size}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td style={td(theme)}>
                      <div style={categoryBadge(theme)}>
                        <CategoryIcon size={15} />
                        {getCategoryLabel(p.category)}
                      </div>
                    </td>

                    {/* PRICE */}

                    <td style={td(theme)}>
                      <div style={priceCell}>
                        <CircleDollarSign size={16} />
                        <strong>{currency(p.price)}</strong>
                      </div>
                    </td>

                    {/* STOCK */}

                    <td style={td(theme)}>
                      <div style={stockContainer}>
                        <div style={stockBar}>
                          <div
                            style={{
                              ...stockFill,
                              width: `${Math.min(
                                p.stock * 10,
                                100
                              )}%`,
                              background:
                                p.stock < 5
                                  ? "#dc2626"
                                  : "#16a34a",
                            }}
                          />
                        </div>

                        <div style={stockNumber}>
                          <Boxes size={15} />

                          <span
                            style={{
                              color:
                                p.stock < 5
                                  ? "#dc2626"
                                  : "#16a34a",
                              fontWeight: 700,
                            }}
                          >
                            {p.stock}
                          </span>

                          <span
                            style={{
                              ...stockStatusBadge,
                              color: stockStatus.color,
                              background:
                                stockStatus.background,
                            }}
                          >
                            <StockStatusIcon size={13} />
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td style={tdActions(theme)}>
                      <button
                        style={editBtn}
                        onClick={() => setPriceModal(p)}
                        title="Edit price"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        style={stockBtn}
                        onClick={() => setStockModal(p)}
                        title="Add stock"
                      >
                        <PlusCircle size={16} />
                        Stock
                      </button>

                      <button
                        style={deleteBtn}
                        onClick={() => setDeleteModal(p)}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* DESKTOP EMPTY */}

          {filteredProducts.length === 0 && (
            <div style={emptyState(theme)}>
              <Package size={40} strokeWidth={1.5} />
              <strong>No products found</strong>
              <span>
                Try changing your search or add a new product.
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            MOBILE PRODUCT CARDS
        ================================================= */}

        <div className="products-mobile-list">
          {filteredProducts.map((p) => {
            const CategoryIcon = getCategoryIcon(p.category);
            const stockStatus = getStockStatus(p.stock);
            const StockStatusIcon = stockStatus.icon;

            return (
              <div
                key={p._id}
                style={mobileProductCard(theme)}
              >
                {/* MOBILE CARD HEADER */}

                <div className="mobile-product-header">
                  <div style={mobileProductIdentity}>
                    <div style={mobileProductIcon(theme)}>
                      <CategoryIcon size={21} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <strong style={mobileProductName(theme)}>
                        {p.name}
                      </strong>

                      <div style={mobileProductSize(theme)}>
                        <Layers3 size={13} />
                        {p.size}
                      </div>
                    </div>
                  </div>

                  <div style={categoryBadge(theme)}>
                    <CategoryIcon size={14} />
                    {getCategoryLabel(p.category)}
                  </div>
                </div>

                {/* MOBILE DETAILS */}

                <div className="mobile-product-details">
                  <div style={mobileDetail(theme)}>
                    <span style={mobileDetailLabel}>
                      <CircleDollarSign size={15} />
                      Price
                    </span>

                    <strong style={mobilePrice}>
                      {currency(p.price)}
                    </strong>
                  </div>

                  <div style={mobileDetail(theme)}>
                    <span style={mobileDetailLabel}>
                      <Boxes size={15} />
                      Stock
                    </span>

                    <strong
                      style={{
                        color:
                          p.stock < 5
                            ? "#dc2626"
                            : "#16a34a",
                        fontSize: 18,
                      }}
                    >
                      {p.stock}
                    </strong>
                  </div>
                </div>

                {/* MOBILE STOCK BAR */}

                <div style={{ marginTop: 14 }}>
                  <div style={mobileStockHeader}>
                    <span style={mobileDetailLabel}>
                      <ActivityIcon />
                      Stock level
                    </span>

                    <span
                      style={{
                        ...stockStatusBadge,
                        color: stockStatus.color,
                        background: stockStatus.background,
                      }}
                    >
                      <StockStatusIcon size={13} />
                      {stockStatus.label}
                    </span>
                  </div>

                  <div style={mobileStockBar}>
                    <div
                      style={{
                        ...stockFill,
                        width: `${Math.min(
                          p.stock * 10,
                          100
                        )}%`,
                        background:
                          p.stock < 5
                            ? "#dc2626"
                            : "#16a34a",
                      }}
                    />
                  </div>
                </div>

                {/* MOBILE ACTIONS */}

                <div className="mobile-product-actions">
                  <button
                    style={mobileEditBtn}
                    onClick={() => setPriceModal(p)}
                  >
                    <Pencil size={16} />
                    Edit Price
                  </button>

                  <button
                    style={mobileStockBtn}
                    onClick={() => setStockModal(p)}
                  >
                    <PlusCircle size={16} />
                    Add Stock
                  </button>

                  <button
                    style={mobileDeleteBtn}
                    onClick={() => setDeleteModal(p)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {/* MOBILE EMPTY */}

          {filteredProducts.length === 0 && (
            <div style={emptyState(theme)}>
              <Package size={40} strokeWidth={1.5} />
              <strong>No products found</strong>
              <span>
                Try changing your search or add a new product.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PRICE MODAL
      ===================================================== */}

      {priceModal && (
        <div style={modal}>
          <div
            style={modalBox(theme)}
            className="products-modal-box"
          >
            <div style={modalHeader}>
              <div style={modalIcon("#7c3aed")}>
                <DollarSign size={22} />
              </div>

              <div>
                <h2 style={modalTitle(theme)}>
                  Edit Price
                </h2>

                <p style={modalSubtitle(theme)}>
                  {priceModal.name}
                </p>
              </div>

              <button
                style={modalCloseBtn(theme)}
                onClick={() => setPriceModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <label style={fieldLabel(theme)}>
              <CircleDollarSign size={15} />
              Product Price
            </label>

            <input
              style={{
                ...input(theme),
                width: "100%",
                margin: "8px 0 18px",
                boxSizing: "border-box",
              }}
              type="number"
              step="0.01"
              value={priceModal.price}
              onChange={(e) =>
                setPriceModal({
                  ...priceModal,
                  price: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button
                style={cancelBtn}
                onClick={() => setPriceModal(null)}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                style={saveBtn}
                onClick={updatePrice}
              >
                <Save size={16} />
                Save Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          STOCK MODAL
      ===================================================== */}

      {stockModal && (
        <div style={modal}>
          <div
            style={modalBox(theme)}
            className="products-modal-box"
          >
            <div style={modalHeader}>
              <div style={modalIcon("#2563eb")}>
                <Boxes size={22} />
              </div>

              <div>
                <h2 style={modalTitle(theme)}>
                  Add Stock
                </h2>

                <p style={modalSubtitle(theme)}>
                  {stockModal.name}
                </p>
              </div>

              <button
                style={modalCloseBtn(theme)}
                onClick={() => setStockModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <label style={fieldLabel(theme)}>
              <PlusCircle size={15} />
              Quantity to Add
            </label>

            <input
              style={{
                ...input(theme),
                width: "100%",
                margin: "8px 0 18px",
                boxSizing: "border-box",
              }}
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={stockModal.quantity || ""}
              onChange={(e) =>
                setStockModal({
                  ...stockModal,
                  quantity: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button
                style={cancelBtn}
                onClick={() => setStockModal(null)}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                style={saveBtn}
                onClick={addStock}
              >
                <PlusCircle size={16} />
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <div style={modal}>
          <div
            style={modalBox(theme)}
            className="products-modal-box"
          >
            <div style={modalHeader}>
              <div style={modalIcon("#dc2626")}>
                <Trash2 size={22} />
              </div>

              <div>
                <h2 style={modalTitle(theme)}>
                  Confirm Delete
                </h2>

                <p style={modalSubtitle(theme)}>
                  Remove this product
                </p>
              </div>

              <button
                style={modalCloseBtn(theme)}
                onClick={() => setDeleteModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={deleteWarning(theme)}>
              <AlertTriangle size={22} />

              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteModal.name}</strong>?
              </p>
            </div>

            <p style={deleteInfo(theme)}>
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                style={cancelBtn}
                onClick={() => setDeleteModal(null)}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                style={deleteBtn}
                onClick={confirmDelete}
              >
                <Trash2 size={16} />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>{`
        .products-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .products-search {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .products-search input {
          outline: none;
        }

        .products-form-grid {
          align-items: end;
        }

        .product-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .product-add-button-wrapper {
          display: flex;
          align-items: end;
          min-width: 0;
        }

        .product-add-button-wrapper button {
          width: 100%;
          min-height: 42px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
        }

        .products-desktop-table {
          display: block;
        }

        .products-mobile-list {
          display: none;
          flex-direction: column;
          gap: 14px;
        }

        .product-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
        }

        .table-heading {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .mobile-product-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .mobile-product-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .mobile-product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }

        .mobile-product-actions button {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .mobile-product-actions button:last-child {
          grid-column: 1 / -1;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .modal-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        @media (max-width: 900px) {
          .products-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .product-add-button-wrapper {
            grid-column: span 2;
          }
        }

        @media (max-width: 767px) {
          .products-page {
            padding: 0 8px 25px !important;
          }

          .products-page-header {
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;
          }

          .products-page-header h1 {
            margin-bottom: 6px !important;
          }

          .products-search {
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 16px !important;
          }

          .products-search input {
            min-width: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }

          .products-form-grid {
            grid-template-columns: 1fr !important;
            gap: 11px !important;
          }

          .product-add-button-wrapper {
            grid-column: auto !important;
          }

          .product-add-button-wrapper button {
            width: 100%;
          }

          .products-desktop-table {
            display: none !important;
          }

          .products-mobile-list {
            display: flex !important;
          }

          .products-list-card {
            padding: 14px !important;
          }

          .mobile-product-header {
            flex-direction: column;
          }

          .mobile-product-header > div:last-child {
            align-self: flex-start;
          }

          .mobile-product-details {
            grid-template-columns: 1fr 1fr;
          }

          .products-modal-box {
            width: calc(100% - 10px) !important;
            max-width: none !important;
            padding: 20px !important;
            box-sizing: border-box;
          }

          .modal-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .modal-actions button {
            width: 100%;
          }
        }

        @media (max-width: 430px) {
          .products-page {
            padding-left: 5px !important;
            padding-right: 5px !important;
          }

          .mobile-product-details {
            grid-template-columns: 1fr;
          }

          .mobile-product-actions {
            grid-template-columns: 1fr;
          }

          .mobile-product-actions button:last-child {
            grid-column: auto;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   SMALL ICON HELPER
============================================================ */

function ActivityIcon() {
  return <ClipboardList size={15} />;
}

/* ============================================================
   STYLES
============================================================ */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "0 10px 30px",
  boxSizing: "border-box",
  color: theme.text,
});

const title = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontSize: "clamp(22px, 5vw, 30px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
});

const subtitle = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  margin: "7px 0 0",
  color: theme.text,
  opacity: 0.7,
  fontSize: 14,
});

const productCount = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 12px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: theme.card,
  color: theme.text,
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap",
});

const searchWrapper = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 2,
  padding: "0 12px",
  borderRadius: 9,
  border: `1px solid ${theme.border}`,
  background: theme.card,
  color: theme.text,
  marginBottom: 20,
  width: "100%",
  maxWidth: 360,
  boxSizing: "border-box",
});

const searchInput = (theme) => ({
  padding: "12px 5px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: theme.text,
  width: "100%",
  boxSizing: "border-box",
});

const sectionTitle = (theme) => ({
  margin: "0 0 17px",
  color: theme.primary,
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 18,
});

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 14,
  border: `1px solid ${theme.border}`,
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  marginBottom: 30,
  boxSizing: "border-box",
});

const formGrid = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
};

const fieldLabel = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 5,
  color: theme.text,
  fontSize: 13,
  fontWeight: 600,
});

const input = (theme) => ({
  padding: "11px 10px",
  minHeight: 42,
  borderRadius: 8,
  border: `1px solid ${theme.border}`,
  background: theme.page,
  color: theme.text,
  boxSizing: "border-box",
  outline: "none",
  width: "100%",
});

const addBtn = {
  background: "#7c3aed",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};

const editBtn = {
  background: "#8b5cf6",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: 7,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const stockBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: 7,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: 7,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const mobileEditBtn = {
  ...editBtn,
  width: "100%",
};

const mobileStockBtn = {
  ...stockBtn,
  width: "100%",
};

const mobileDeleteBtn = {
  ...deleteBtn,
  width: "100%",
};

const cancelBtn = {
  padding: "10px 16px",
  background: "#94a3b8",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontWeight: 600,
};

const saveBtn = {
  padding: "10px 16px",
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontWeight: 600,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 700,
};

const thead = (theme) => ({
  background: theme.tableHeader,
});

const th = (theme) => ({
  padding: 12,
  textAlign: "left",
  color: theme.text,
  fontSize: 13,
  fontWeight: 700,
});

const td = (theme) => ({
  padding: 12,
  borderTop: `1px solid ${theme.border}`,
  color: theme.text,
  verticalAlign: "middle",
});

const tdActions = (theme) => ({
  padding: 12,
  borderTop: `1px solid ${theme.border}`,
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
  color: theme.text,
  verticalAlign: "middle",
});

const row = {
  background: "transparent",
};

const rowAlt = {
  background: "rgba(148,163,184,.08)",
};

const sizeText = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  opacity: 0.7,
  fontSize: 13,
  marginTop: 4,
};

const productIcon = (theme) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.page,
  color: theme.primary,
  border: `1px solid ${theme.border}`,
});

const categoryBadge = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 9px",
  borderRadius: 8,
  background: theme.page,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
});

const priceCell = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const stockContainer = {
  minWidth: 150,
};

const stockBar = {
  width: "100%",
  maxWidth: 120,
  height: 8,
  background: "#cbd5e1",
  borderRadius: 4,
  marginBottom: 7,
  overflow: "hidden",
};

const stockFill = {
  height: "100%",
  borderRadius: 4,
  transition: "width .25s ease",
};

const stockNumber = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
};

const stockStatusBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 7px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
};

const listHeader = (theme) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 15,
  flexWrap: "wrap",
});

const listHeaderTitle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 17,
  fontWeight: 700,
};

const listHeaderCount = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  color: theme.text,
  opacity: 0.7,
});

const mobileProductCard = (theme) => ({
  background: theme.page,
  border: `1px solid ${theme.border}`,
  borderRadius: 12,
  padding: 14,
  boxSizing: "border-box",
});

const mobileProductIdentity = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const mobileProductIcon = (theme) => ({
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.card,
  color: theme.primary,
  border: `1px solid ${theme.border}`,
});

const mobileProductName = (theme) => ({
  display: "block",
  color: theme.text,
  fontSize: 15,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "190px",
});

const mobileProductSize = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 4,
  color: theme.text,
  opacity: 0.65,
  fontSize: 12,
});

const mobileDetail = (theme) => ({
  padding: 10,
  borderRadius: 9,
  border: `1px solid ${theme.border}`,
  background: theme.card,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
});

const mobileDetailLabel = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 600,
};

const mobilePrice = {
  fontSize: 16,
};

const mobileStockHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 7,
};

const mobileStockBar = {
  width: "100%",
  height: 9,
  background: "#cbd5e1",
  borderRadius: 5,
  overflow: "hidden",
};

const emptyState = (theme) => ({
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: theme.text,
  opacity: 0.65,
  textAlign: "center",
});

const errorBox = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  padding: "10px 12px",
  borderRadius: 8,
  background: "rgba(220,38,38,.10)",
  color: "#dc2626",
  fontSize: 13,
  fontWeight: 600,
});

const loadingPage = (theme) => ({
  minHeight: "60vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  color: theme.text,
  fontSize: 17,
});

const modal = {
  position: "fixed",
  inset: 0,
  padding: 15,
  background: "rgba(0,0,0,.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  boxSizing: "border-box",
};

const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 25,
  borderRadius: 14,
  width: "90%",
  maxWidth: 400,
  border: `1px solid ${theme.border}`,
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
  boxSizing: "border-box",
});

const modalHeader = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 22,
};

const modalIcon = (background) => ({
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background,
  color: "white",
});

const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
});

const modalSubtitle = (theme) => ({
  margin: "3px 0 0",
  color: theme.text,
  opacity: 0.65,
  fontSize: 12,
});

const modalCloseBtn = (theme) => ({
  marginLeft: "auto",
  width: 34,
  height: 34,
  borderRadius: 8,
  border: `1px solid ${theme.border}`,
  background: "transparent",
  color: theme.text,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const deleteWarning = (theme) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: 12,
  borderRadius: 9,
  background: "rgba(220,38,38,.10)",
  color: "#dc2626",
  fontSize: 14,
  lineHeight: 1.5,
});

const deleteInfo = (theme) => ({
  margin: "10px 0 20px",
  color: theme.text,
  opacity: 0.65,
  fontSize: 13,
});