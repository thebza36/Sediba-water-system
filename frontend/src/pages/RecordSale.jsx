import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ShoppingCart,
  CreditCard,
  Printer,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

export default function RecordSale() {
  const { theme } = useContext(ThemeContext);

  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [quantity, setQuantity] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState("");

  const [lastSale, setLastSale] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`, {
        headers,
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "Products response was not JSON:",
          text
        );

        return;
      }

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Product loading error:",
        err
      );
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* =========================================================
     ADD ITEM
  ========================================================= */

  const addItem = () => {
    const product = products.find(
      (p) => p._id === selectedProduct
    );

    if (!product || !quantity) {
      return;
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      setMessage(
        "Quantity must be greater than 0"
      );

      setMessageType("error");

      return;
    }

    if (qty > Number(product.stock || 0)) {
      setMessage(
        `Not enough stock. Available: ${product.stock}`
      );

      setMessageType("error");

      return;
    }

    const existing = items.find(
      (i) => i.product === product._id
    );

    if (existing) {
      const newQuantity =
        existing.quantity + qty;

      if (
        newQuantity >
        Number(product.stock || 0)
      ) {
        setMessage(
          `Not enough stock. Available: ${product.stock}`
        );

        setMessageType("error");

        return;
      }

      const updatedItems = items.map((i) =>
        i.product === product._id
          ? {
              ...i,
              quantity: newQuantity,
            }
          : i
      );

      setItems(updatedItems);
    } else {
      const newItem = {
        product: product._id,
        name: product.name,
        size: product.size,
        price: Number(product.price),
        quantity: qty,
      };

      setItems([
        ...items,
        newItem,
      ]);
    }

    setSelectedProduct("");
    setQuantity("");

    setMessage("");
    setMessageType("");
  };

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeItem = (index) => {
    const updated = [...items];

    updated.splice(index, 1);

    setItems(updated);
  };

  /* =========================================================
     TOTAL
  ========================================================= */

  const totalRevenue = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  /* =========================================================
     CURRENCY
  ========================================================= */

  const currency = (value) =>
    new Intl.NumberFormat(
      "en-ZA",
      {
        style: "currency",
        currency: "ZAR",
      }
    ).format(Number(value) || 0);

  /* =========================================================
     SUBMIT SALE
  ========================================================= */

  const handleSubmit = async () => {
    console.log(
      "CALLING:",
      `${API}/water-sales/pos`
    );

    try {
      if (items.length === 0) {
        setMessage("No items added");

        setMessageType("error");

        return;
      }

      setLoading(true);

      setMessage("");
      setMessageType("");

      const res = await fetch(
        `${API}/water-sales/pos`,
        {
          method: "POST",

          headers,

          body: JSON.stringify({
            items: items.map((i) => ({
              product: i.product,
              quantity: Number(i.quantity),
              price: Number(i.price),
            })),

            paymentMethod,
          }),
        }
      );

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "SERVER RETURNED HTML:",
          text
        );

        throw new Error(
          "Server error (wrong route or backend issue)"
        );
      }

      if (!res.ok) {
        throw new Error(
          data.message || "Sale failed"
        );
      }

      setLastSale(data.sale);

      setItems([]);

      setPaymentMethod("cash");

      setMessage(
        "Sale completed successfully"
      );

      setMessageType("success");

      loadProducts();
    } catch (err) {
      console.error(err);

      setMessage(
        "Sale failed: " + err.message
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PRINT RECEIPT
  ========================================================= */

  const printReceipt = () => {
    if (!lastSale) {
      return;
    }

    const receiptWindow = window.open(
      "",
      "PRINT",
      "height=600,width=400"
    );

    receiptWindow.document.write(`
      <html>
      <head>
        <title>Receipt</title>

        <style>

          body {
            font-family: monospace;
            padding: 20px;
          }

          h2 {
            text-align: center;
          }

        </style>
      </head>

      <body>

        <h2>SEDIBA WATER</h2>

        <hr/>

        ${lastSale.items
          .map(
            (i) => `
              <p>
                ${i.quantity} x
                ${i.product?.name || ""}
                =
                R${Number(i.price) * Number(i.quantity)}
              </p>
            `
          )
          .join("")}

        <hr/>

        <p>
          Total:
          R${lastSale.revenue}
        </p>

        <p>
          Payment:
          ${lastSale.paymentMethod}
        </p>

        <p>
          ${new Date().toLocaleString()}
        </p>

      </body>

      </html>
    `);

    receiptWindow.document.close();

    receiptWindow.focus();

    receiptWindow.print();

    receiptWindow.close();
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE RESPONSIVE STYLES
      ===================================================== */}

      <style>
        {`

          /* =================================================
             TABLET
          ================================================= */

          @media (max-width: 768px) {

            .record-sale-form-row {
              grid-template-columns: 1fr 1fr !important;
            }

            .record-sale-add-button {
              grid-column: 1 / -1 !important;
              width: 100% !important;
            }

          }


          /* =================================================
             MOBILE
          ================================================= */

          @media (max-width: 600px) {

            .record-sale-page {
              padding-left: 8px !important;
              padding-right: 8px !important;
            }


            .record-sale-header {
              gap: 10px !important;
              margin-bottom: 20px !important;
            }


            .record-sale-title-icon {
              width: 44px !important;
              height: 44px !important;
              min-width: 44px !important;
            }


            .record-sale-card {
              padding: 17px !important;
              border-radius: 15px !important;
              margin-bottom: 18px !important;
            }


            .record-sale-section-header {
              align-items: flex-start !important;
              gap: 10px !important;
            }


            .record-sale-section-icon {
              width: 36px !important;
              height: 36px !important;
              min-width: 36px !important;
            }


            .record-sale-form-row {
              display: grid !important;

              grid-template-columns:
                minmax(0, 1fr) !important;

              gap: 11px !important;

              width: 100% !important;

              min-width: 0 !important;
            }


            .record-sale-form-row select,
            .record-sale-form-row input {
              width: 100% !important;

              min-width: 0 !important;

              max-width: 100% !important;
            }


            .record-sale-add-button {
              width: 100% !important;

              min-width: 0 !important;

              max-width: 100% !important;

              padding: 12px 16px !important;

              grid-column: auto !important;
            }


            .record-sale-cart-empty {
              padding: 22px 14px !important;
            }


            .record-sale-item-row {
              gap: 9px !important;
              padding-left: 4px !important;
              padding-right: 4px !important;
            }


            .record-sale-item-info {
              min-width: 0 !important;
              width: 100% !important;
              flex: 1 1 100% !important;
            }


            .record-sale-item-total {
              margin-left: 4px !important;
            }


            .record-sale-message {
              font-size: 13px !important;
              line-height: 1.4 !important;
            }

          }


          /* =================================================
             VERY SMALL PHONES
          ================================================= */

          @media (max-width: 380px) {

            .record-sale-card {
              padding: 14px !important;
            }


            .record-sale-section-title {
              font-size: 17px !important;
            }


            .record-sale-section-description {
              font-size: 12px !important;
            }


            .record-sale-page-title {
              font-size: 25px !important;
            }


            .record-sale-page-subtitle {
              font-size: 13px !important;
            }


            .record-sale-form-row {
              gap: 9px !important;
            }

          }

        `}
      </style>

      <div
        style={page(theme)}
        className="record-sale-page"
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={pageHeader}
          className="record-sale-header"
        >

          <div
            style={titleIcon(theme)}
            className="record-sale-title-icon"
          >

            <Receipt
              size={24}
              strokeWidth={2.2}
            />

          </div>


          <div style={titleContent}>

            <h1
              style={pageTitle(theme)}
              className="record-sale-page-title"
            >
              Point of Sale
            </h1>


            <p
              style={pageSubtitle(theme)}
              className="record-sale-page-subtitle"
            >
              Record a new product sale and
              process customer payments.
            </p>

          </div>

        </div>


        {/* =====================================================
            ADD PRODUCT
        ===================================================== */}

        <div
          style={card(theme)}
          className="record-sale-card"
        >

          <div
            style={sectionHeader}
            className="record-sale-section-header"
          >

            <div
              style={sectionIcon(theme)}
              className="record-sale-section-icon"
            >

              <Plus
                size={19}
                strokeWidth={2.3}
              />

            </div>


            <div>

              <h3
                style={sectionTitle(theme)}
                className="record-sale-section-title"
              >
                Add Product
              </h3>


              <p
                style={sectionDescription(theme)}
                className="record-sale-section-description"
              >
                Select a product and enter
                the quantity.
              </p>

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <div
            style={formRow}
            className="record-sale-form-row"
          >

            {/* PRODUCT */}

            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(
                  e.target.value
                )
              }
              style={input(theme)}
            >

              <option value="">
                Select Product
              </option>


              {products.map((p) => (
                <option
                  key={p._id}
                  value={p._id}
                >

                  {p.name} {p.size}

                  {" "}

                  ({currency(p.price)})

                  {" "}

                  - Stock: {p.stock}

                </option>
              ))}

            </select>


            {/* QUANTITY */}

            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              style={input(theme)}
            />


            {/* ADD BUTTON */}

            <button
              onClick={addItem}
              style={btnAdd(theme)}
              className="record-sale-add-button"
            >

              <Plus
                size={17}
                strokeWidth={2.5}
              />

              <span>
                Add
              </span>

            </button>

          </div>

        </div>


        {/* =====================================================
            SHOPPING CART
        ===================================================== */}

        <div
          style={card(theme)}
          className="record-sale-card"
        >

          <div
            style={sectionHeader}
            className="record-sale-section-header"
          >

            <div
              style={sectionIcon(theme)}
              className="record-sale-section-icon"
            >

              <ShoppingCart
                size={19}
                strokeWidth={2.2}
              />

            </div>


            <div>

              <h3
                style={sectionTitle(theme)}
                className="record-sale-section-title"
              >
                Shopping Cart
              </h3>


              <p
                style={sectionDescription(theme)}
                className="record-sale-section-description"
              >
                Review the items before
                completing the sale.
              </p>

            </div>

          </div>


          {items.length === 0 ? (

            <div
              style={emptyCart(theme)}
              className="record-sale-cart-empty"
            >

              <ShoppingCart
                size={28}
                strokeWidth={1.8}
              />

              <div>
                No items added yet.
              </div>

            </div>

          ) : (

            <div>

              {items.map(
                (item, index) => (

                  <div
                    key={index}
                    style={itemRow(theme)}
                    className="record-sale-item-row"
                  >

                    <div
                      style={itemInfo}
                      className="record-sale-item-info"
                    >

                      <div
                        style={itemName(theme)}
                      >
                        {item.name}
                        {" "}
                        {item.size}
                      </div>


                      <div
                        style={itemDetails(theme)}
                      >

                        {item.quantity}

                        {" × "}

                        {currency(item.price)}

                      </div>

                    </div>


                    <div
                      style={itemTotal(theme)}
                      className="record-sale-item-total"
                    >

                      {currency(
                        item.price *
                          item.quantity
                      )}

                    </div>


                    <button
                      onClick={() =>
                        removeItem(index)
                      }
                      style={removeBtn}
                      title="Remove item"
                    >

                      <Trash2
                        size={17}
                        strokeWidth={2.2}
                      />

                    </button>

                  </div>

                )
              )}


              {/* =================================================
                  TOTAL
              ================================================= */}

              <div
                style={totalRow(theme)}
              >

                <span
                  style={totalLabel(theme)}
                >
                  Total
                </span>


                <span
                  style={totalAmount(theme)}
                >

                  {currency(
                    totalRevenue
                  )}

                </span>

              </div>

            </div>

          )}

        </div>


        {/* =====================================================
            PAYMENT
        ===================================================== */}

        <div
          style={card(theme)}
          className="record-sale-card"
        >

          <div
            style={sectionHeader}
            className="record-sale-section-header"
          >

            <div
              style={sectionIcon(theme)}
              className="record-sale-section-icon"
            >

              <CreditCard
                size={19}
                strokeWidth={2.2}
              />

            </div>


            <div>

              <h3
                style={sectionTitle(theme)}
                className="record-sale-section-title"
              >
                Payment
              </h3>


              <p
                style={sectionDescription(theme)}
                className="record-sale-section-description"
              >
                Select the customer's
                payment method.
              </p>

            </div>

          </div>


          {/* PAYMENT METHOD */}

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
            style={input(theme)}
          >

            <option value="cash">
              Cash
            </option>

            <option value="speedpoint">
              Speed Point
            </option>

          </select>


          {/* =================================================
              COMPLETE SALE
          ================================================= */}

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              items.length === 0
            }
            style={{
              ...btnComplete(theme),

              opacity:
                loading ||
                items.length === 0
                  ? 0.55
                  : 1,

              cursor:
                loading ||
                items.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {loading ? (

              <>

                <Clock
                  size={18}
                  strokeWidth={2.2}
                />

                <span>
                  Processing...
                </span>

              </>

            ) : (

              <>

                <CheckCircle
                  size={18}
                  strokeWidth={2.2}
                />

                <span>
                  Complete Sale
                </span>

              </>

            )}

          </button>


          {/* =================================================
              PRINT
          ================================================= */}

          {lastSale && (

            <button
              onClick={printReceipt}
              style={printBtn(theme)}
            >

              <Printer
                size={18}
                strokeWidth={2.2}
              />

              <span>
                Print Receipt
              </span>

            </button>

          )}


          {/* =================================================
              MESSAGE
          ================================================= */}

          {message && (

            <div
              style={messageBox(
                theme,
                messageType
              )}
              className="record-sale-message"
            >

              {messageType === "error" ? (

                <AlertCircle
                  size={18}
                  strokeWidth={2.2}
                />

              ) : (

                <CheckCircle
                  size={18}
                  strokeWidth={2.2}
                />

              )}


              <span>
                {message}
              </span>

            </div>

          )}

        </div>

      </div>
    </>
  );
}


/* =========================================================
   PAGE
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",

  padding:
    "10px 10px 40px",

  boxSizing: "border-box",

  color: theme.text,

  overflowX: "hidden",
});


/* =========================================================
   PAGE HEADER
========================================================= */

const pageHeader = {
  display: "flex",

  alignItems: "center",

  gap: 14,

  marginBottom: 25,

  padding: "5px 0",

  width: "100%",

  minWidth: 0,
};


const titleIcon = (theme) => ({
  width: 48,

  height: 48,

  minWidth: 48,

  borderRadius: 14,

  background:
    theme.cardSecondary ||
    theme.card,

  border:
    `1px solid ${theme.border}`,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  color: theme.primary,

  boxShadow:
    "0 4px 12px rgba(15,23,42,.06)",
});


const titleContent = {
  minWidth: 0,

  flex: 1,
};


const pageTitle = (theme) => ({
  margin: 0,

  fontSize:
    "clamp(24px, 5vw, 32px)",

  fontWeight: 800,

  color: theme.primary,

  letterSpacing: "-0.5px",

  lineHeight: 1.2,
});


const pageSubtitle = (theme) => ({
  margin: "5px 0 0",

  color: theme.textSecondary,

  fontSize: 14,

  lineHeight: 1.5,

  maxWidth: "100%",
});


/* =========================================================
   CARD
========================================================= */

const card = (theme) => ({
  background: theme.card,

  border:
    `1px solid ${theme.border}`,

  borderRadius: 16,

  padding: 22,

  marginBottom: 22,

  boxSizing: "border-box",

  boxShadow:
    "0 4px 15px rgba(15,23,42,.06)",

  width: "100%",

  maxWidth: "100%",

  overflow: "hidden",
});


/* =========================================================
   SECTION HEADER
========================================================= */

const sectionHeader = {
  display: "flex",

  alignItems: "center",

  gap: 12,

  marginBottom: 18,

  minWidth: 0,
};


const sectionIcon = (theme) => ({
  width: 38,

  height: 38,

  minWidth: 38,

  borderRadius: 10,

  background:
    theme.cardSecondary ||
    theme.card,

  border:
    `1px solid ${theme.border}`,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  color: theme.primary,
});


const sectionTitle = (theme) => ({
  margin: 0,

  fontSize: 18,

  fontWeight: 700,

  color: theme.text,

  lineHeight: 1.25,
});


const sectionDescription = (theme) => ({
  margin: "4px 0 0",

  fontSize: 13,

  color: theme.textSecondary,

  lineHeight: 1.4,
});


/* =========================================================
   FORM
========================================================= */

const formRow = {
  display: "grid",

  gridTemplateColumns:
    "minmax(200px, 2fr) minmax(120px, 1fr) auto",

  gap: 12,

  alignItems: "center",

  width: "100%",

  minWidth: 0,

  boxSizing: "border-box",
};


const input = (theme) => ({
  width: "100%",

  minWidth: 0,

  minHeight: 46,

  padding: "12px 13px",

  borderRadius: 10,

  border:
    `1px solid ${theme.border}`,

  background:
    theme.input ||
    theme.cardSecondary ||
    theme.card,

  color: theme.text,

  fontSize: 14,

  boxSizing: "border-box",

  outline: "none",

  maxWidth: "100%",
});


/* =========================================================
   BUTTONS
========================================================= */

const btnAdd = (theme) => ({
  minHeight: 46,

  padding: "12px 20px",

  background: theme.primary,

  color: "#ffffff",

  border: "none",

  borderRadius: 10,

  cursor: "pointer",

  fontWeight: 700,

  minWidth: 100,

  fontSize: 14,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: 7,

  boxSizing: "border-box",

  whiteSpace: "nowrap",
});


const btnComplete = (theme) => ({
  width: "100%",

  marginTop: 18,

  padding: "14px",

  background: theme.success,

  color: "#ffffff",

  border: "none",

  borderRadius: 11,

  fontWeight: 700,

  fontSize: 16,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: 8,

  boxSizing: "border-box",
});


const printBtn = (theme) => ({
  width: "100%",

  marginTop: 10,

  padding: "13px",

  background: theme.sidebar,

  color: "#ffffff",

  border: "none",

  borderRadius: 11,

  cursor: "pointer",

  fontWeight: 700,

  fontSize: 14,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: 8,

  boxSizing: "border-box",
});


/* =========================================================
   EMPTY CART
========================================================= */

const emptyCart = (theme) => ({
  padding: 25,

  textAlign: "center",

  background:
    theme.cardSecondary ||
    theme.card,

  border:
    `1px solid ${theme.border}`,

  borderRadius: 10,

  color: theme.textSecondary,

  display: "flex",

  flexDirection: "column",

  alignItems: "center",

  justifyContent: "center",

  gap: 9,

  width: "100%",

  boxSizing: "border-box",
});


/* =========================================================
   CART ITEMS
========================================================= */

const itemRow = (theme) => ({
  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: 12,

  padding: "14px 10px",

  borderBottom:
    `1px solid ${theme.border}`,

  flexWrap: "wrap",

  width: "100%",

  boxSizing: "border-box",
});


const itemInfo = {
  flex: 1,

  minWidth: 180,

  maxWidth: "100%",
};


const itemName = (theme) => ({
  fontWeight: 700,

  color: theme.text,

  lineHeight: 1.4,

  overflowWrap: "anywhere",
});


const itemDetails = (theme) => ({
  marginTop: 4,

  fontSize: 13,

  color: theme.textSecondary,
});


const itemTotal = (theme) => ({
  fontWeight: 700,

  color: theme.primary,

  fontSize: 16,

  whiteSpace: "nowrap",
});


const removeBtn = {
  background: "#ef4444",

  color: "#ffffff",

  border: "none",

  borderRadius: 8,

  width: 38,

  height: 38,

  minWidth: 38,

  padding: 0,

  cursor: "pointer",

  fontWeight: 600,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",
};


/* =========================================================
   TOTAL
========================================================= */

const totalRow = (theme) => ({
  marginTop: 18,

  paddingTop: 18,

  borderTop:
    `1px solid ${theme.border}`,

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: 15,

  flexWrap: "wrap",

  width: "100%",

  boxSizing: "border-box",
});


const totalLabel = (theme) => ({
  fontSize: 18,

  fontWeight: 700,

  color: theme.text,
});


const totalAmount = (theme) => ({
  fontSize:
    "clamp(24px, 6vw, 30px)",

  fontWeight: 800,

  color: theme.primary,

  whiteSpace: "nowrap",
});


/* =========================================================
   MESSAGE
========================================================= */

const messageBox = (
  theme,
  type
) => ({
  marginTop: 15,

  padding: 12,

  borderRadius: 9,

  textAlign: "center",

  fontWeight: 600,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: 8,

  background:
    type === "error"
      ? "#fee2e2"
      : "#dcfce7",

  color:
    type === "error"
      ? "#b91c1c"
      : "#166534",

  border:
    type === "error"
      ? "1px solid #fecaca"
      : "1px solid #bbf7d0",

  boxSizing: "border-box",

  width: "100%",

  overflowWrap: "anywhere",
});