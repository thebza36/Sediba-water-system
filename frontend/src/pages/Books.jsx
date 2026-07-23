import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL;

export default function Books() {

  /* ==================================
     STATES
  ================================== */

  const [products, setProducts] = useState([]);
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [documentType, setDocumentType] =
    useState("quotation");

  const [customer, setCustomer] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [deliveryAddress,
    setDeliveryAddress] =
    useState("");

  const [vat, setVat] =
    useState(0);

  const [discount,
    setDiscount] =
    useState(0);

  const [notes, setNotes] =
    useState("");

  const [lineItems,
    setLineItems] =
    useState([]);

  const [selectedProduct,
    setSelectedProduct] =
    useState("");

  const [quantity,
    setQuantity] =
    useState(1);

  const [deleteModal,
    setDeleteModal] =
    useState(null);

    /* ==================================
   MODAL SYSTEM
================================== */

const [systemModal, setSystemModal] = useState({
  open: false,
  title: "",
  message: "",
  type: "info",
  onConfirm: null
});

const openModal = ({
  title,
  message,
  type = "info",
  onConfirm = null
}) => {
  setSystemModal({
    open: true,
    title,
    message,
    type,
    onConfirm
  });
};

const closeModal = () => {
  setSystemModal({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null
  });
};

  /* ==================================
     FETCH PRODUCTS
  ================================== */

  const loadProducts =
    async () => {

      try {

        const res =
          await fetch(
            `${API}/products`
          );

        const data =
          await res.json();

        setProducts(
          Array.isArray(data)
            ? data
            : []
        );

      } catch {

        alert(
          "Failed to load products"
        );

      }

    };

  /* ==================================
     FETCH BOOKS
  ================================== */

  const loadBooks =
    async () => {

      try {

        setLoading(true);

        const res =
          await fetch(
            `${API}/books`
          );

        const data =
          await res.json();

        setBooks(
          Array.isArray(data)
            ? data
            : []
        );

        setFiltered(
          Array.isArray(data)
            ? data
            : []
        );

      } catch {

        alert(
          "Failed to load books"
        );

      } finally {

        setLoading(false);

      }

    };

  useEffect(() => {

    loadProducts();
    loadBooks();

  }, []);

  /* ==================================
     FILTER
  ================================== */

  useEffect(() => {

    let data = [...books];

    if (search) {

      data =
        data.filter((b) =>
          (b.customer || "")
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
        );

    }

    setFiltered(data);

  }, [search, books]);

  /* ==================================
     ADD LINE ITEM
  ================================== */
const addLineItem = () => {

  if (!selectedProduct || !quantity) {

    openModal({
      type: "warning",
      title: "Missing Information",
      message:
        "Please select a product and quantity."
    });

    return;
  }

  const product = products.find(
    (p) => p._id === selectedProduct
  );

  if (!product) return;

  const total =
    Number(product.price) *
    Number(quantity);

  const item = {
    product: product._id,
    name: product.name,
    size: product.size,
    category: product.category,
    price: product.price,
    quantity: Number(quantity),
    total
  };

  setLineItems([
    ...lineItems,
    item
  ]);

  setSelectedProduct("");
  setQuantity(1);

  openModal({
    type: "success",
    title: "Item Added",
    message:
      `${product.name} was added successfully.`
  });

};


  /* ==================================
     REMOVE ITEM
  ================================== */

  const removeItem =
    (index) => {

      setLineItems(
        lineItems.filter(
          (_, i) =>
            i !== index
        )
      );

    };

  /* ==================================
     TOTALS
  ================================== */

  const subtotal =
    useMemo(() => {

      return lineItems.reduce(
        (sum, x) =>
          sum +
          Number(
            x.total || 0
          ),
        0
      );

    }, [lineItems]);

  const vatAmount =
    subtotal *
    (Number(vat) / 100);

  const discountAmount =
    subtotal *
    (Number(discount)
      / 100);

  const grandTotal =
    subtotal +
    vatAmount -
    discountAmount;

  /* ==================================
     CREATE DOCUMENT
  ================================== */

  const createDocument = async () => {

  if (
    !customer ||
    lineItems.length === 0
  ) {

    openModal({
      type: "warning",
      title: "Missing Information",
      message:
        "Please complete customer details and add products."
    });

    return;
  }

  openModal({
    type: "confirm",
    title:
      documentType === "quotation"
        ? "Create Quotation?"
        : "Create Invoice?",
    message:
      `Are you sure you want to create this ${documentType}?`,
    onConfirm: async () => {

      closeModal();

      try {

        await fetch(
          `${API}/books`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              type: documentType,
              customer,
              phone,
              address,
              deliveryAddress,
              items:
                lineItems.map(
                  (i) => ({
                    product:
                      i.product,
                    quantity:
                      i.quantity
                  })
                ),
              vat,
              discount,
              notes
            })
          }
        );

        clearForm();
        loadBooks();

        openModal({
          type: "success",
          title:
            "Document Created",
          message:
            `${documentType} created successfully.`
        });

      } catch {

        openModal({
          type: "error",
          title: "Error",
          message:
            "Failed to create document."
        });

      }

    }
  });

};

  /* ==================================
     CLEAR FORM
  ================================== */

  const clearForm =
    () => {

      setCustomer("");
      setPhone("");
      setAddress("");
      setDeliveryAddress("");
      setVat(0);
      setDiscount(0);
      setNotes("");
      setLineItems([]);

    };

  /* ==================================
     MARK PAID
  ================================== */

  const markPaid =
    async (id) => {

      try {

        await fetch(
          `${API}/books/${id}/pay`,
          {
            method: "PUT"
          }
        );

        loadBooks();

      } catch {

        alert(
          "Failed to update"
        );

      }

    };

  /* ==================================
     DELETE
  ================================== */

  const deleteBook =
    async () => {

      try {

        await fetch(
          `${API}/books/${deleteModal._id}`,
          {
            method: "DELETE"
          }
        );

        setDeleteModal(
          null
        );

        loadBooks();

      } catch {

        alert(
          "Failed to delete"
        );

      }

    };
      /* ==================================
     DOWNLOAD PDF
  ================================== */

  const downloadPDF = (book) => {

    const doc = new jsPDF();

    /* HEADER */

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 220, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);

    doc.text(
      book.type === "quotation"
        ? "QUOTATION"
        : "INVOICE",
      14,
      18
    );

    doc.setFontSize(11);

    doc.text(
      book.documentNumber,
      14,
      27
    );

    doc.setTextColor(0, 0, 0);

    /* CUSTOMER INFO */

    doc.setFontSize(13);

    doc.text(
      "Customer Details",
      14,
      50
    );

    doc.setFontSize(11);

    doc.text(
      `Customer: ${book.customer || "-"}`,
      14,
      60
    );

    doc.text(
      `Phone: ${book.phone || "-"}`,
      14,
      68
    );

    doc.text(
      `Address: ${book.address || "-"}`,
      14,
      76
    );

    doc.text(
      `Delivery Address: ${book.deliveryAddress || "-"}`,
      14,
      84
    );

    /* TABLE */

    autoTable(doc, {
      startY: 95,

      head: [[
        "Product",
        "Qty",
        "Price",
        "Total"
      ]],

      body:
        book.items?.map((item) => ([
          item.name,
          item.quantity,
          `R ${Number(item.price)
            .toFixed(2)}`,
          `R ${Number(item.total)
            .toFixed(2)}`
        ])) || [],

      headStyles: {
        fillColor: [15, 23, 42]
      }
    });

    let finalY =
      doc.lastAutoTable.finalY + 15;

    doc.setFontSize(12);

    doc.text(
      `Subtotal: R ${Number(book.subtotal || 0)
        .toFixed(2)}`,
      14,
      finalY
    );

    finalY += 10;

    doc.text(
      `VAT (${book.vat || 0}%):`,
      14,
      finalY
    );

    doc.text(
      `Discount (${book.discount || 0}%):`,
      110,
      finalY
    );

    finalY += 12;

    doc.setFontSize(15);

    doc.text(
      `TOTAL: R ${Number(book.total || 0)
        .toFixed(2)}`,
      14,
      finalY
    );

    if (book.notes) {

      finalY += 15;

      doc.setFontSize(12);

      doc.text(
        "Notes:",
        14,
        finalY
      );

      doc.setFontSize(10);

      doc.text(
        book.notes,
        14,
        finalY + 8
      );

    }

    doc.save(
      `${book.documentNumber}.pdf`
    );

  };

  /* ==================================
     SUMMARY
  ================================== */

  const totalQuotations =
    books.filter(
      (b) =>
        b.type ===
        "quotation"
    ).length;

  const totalInvoices =
    books.filter(
      (b) =>
        b.type ===
        "invoice"
    ).length;

  const totalRevenue =
    books.reduce(
      (sum, b) =>
        sum +
        Number(
          b.total || 0
        ),
      0
    );

  const outstanding =
    books.reduce(
      (sum, b) =>
        sum +
        Number(
          b.outstandingBalance || 0
        ),
      0
    );

  const currency =
    (n) =>
      new Intl.NumberFormat(
        "en-ZA",
        {
          style: "currency",
          currency: "ZAR"
        }
      ).format(n || 0);

  if (loading) {
    return (
      <div style={center}>
        Loading Books...
      </div>
    );
  }

  return (

    <div style={page}>

      <h1 style={title}>
        📘 Books &
        Billing
      </h1>

      {/* SUMMARY */}

      <div style={summaryGrid}>

        <div style={summaryCard}>
          <h3>
            Quotations
          </h3>

          <div style={summaryNumber}>
            {totalQuotations}
          </div>
        </div>

        <div style={summaryCard}>
          <h3>
            Invoices
          </h3>

          <div style={summaryNumber}>
            {totalInvoices}
          </div>
        </div>

        <div style={summaryCard}>
          <h3>
            Revenue
          </h3>

          <div style={summaryNumber}>
            {currency(totalRevenue)}
          </div>
        </div>

        <div style={summaryCard}>
          <h3>
            Outstanding
          </h3>

          <div style={summaryNumber}>
            {currency(outstanding)}
          </div>
        </div>

      </div>

      {/* SEARCH */}

      <input
        style={searchInput}
        placeholder="Search customer..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      {/* FORM CARD */}

      <div style={card}>

                  <h2 style={sectionTitle}>
          Create Quotation / Invoice
        </h2>

        <div style={formGrid}>

          <select
            style={input}
            value={documentType}
            onChange={(e) =>
              setDocumentType(
                e.target.value
              )
            }
          >
            <option value="quotation">
              Quotation
            </option>

            <option value="invoice">
              Invoice
            </option>
          </select>

          <input
            style={input}
            placeholder="Customer Name"
            value={customer}
            onChange={(e) =>
              setCustomer(
                e.target.value
              )
            }
          />

          <input
            style={input}
            placeholder="Phone"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />

          <input
            style={input}
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
          />

          <input
            style={input}
            placeholder="Delivery Address"
            value={deliveryAddress}
            onChange={(e) =>
              setDeliveryAddress(
                e.target.value
              )
            }
          />

        </div>

        {/* ADD ITEMS */}

        <h3 style={miniTitle}>
          Add Products
        </h3>

        <div style={formGrid}>

          <select
            style={input}
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value
              )
            }
          >
            <option value="">
              Select Product
            </option>

            {products.map((p) => (
              <option
                key={p._id}
                value={p._id}
              >
                {p.name}
                {" - "}
                {currency(
                  p.price
                )}
              </option>
            ))}
          </select>

          <input
            style={input}
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value
              )
            }
          />

          <button
            style={addBtn}
            onClick={addLineItem}
          >
            Add Item
          </button>

        </div>

        {/* ITEMS TABLE */}

        {lineItems.length > 0 && (

          <div
            style={{
              overflowX:
                "auto",
              marginTop: 20
            }}
          >

            <table style={table}>

              <thead style={thead}>
                <tr>
                  <th style={th}>
                    Product
                  </th>

                  <th style={th}>
                    Qty
                  </th>

                  <th style={th}>
                    Price
                  </th>

                  <th style={th}>
                    Total
                  </th>

                  <th style={th}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {lineItems.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                    >

                      <td style={td}>
                        {
                          item.name
                        }
                      </td>

                      <td style={td}>
                        {
                          item.quantity
                        }
                      </td>

                      <td style={td}>
                        {currency(
                          item.price
                        )}
                      </td>

                      <td style={td}>
                        {currency(
                          item.total
                        )}
                      </td>

                      <td style={td}>
                        <button
                          style={
                            deleteBtn
                          }
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

        {/* TOTALS */}

        <div style={totalsCard}>

          <input
            style={input}
            type="number"
            placeholder="VAT %"
            value={vat}
            onChange={(e) =>
              setVat(
                e.target.value
              )
            }
          />

          <input
            style={input}
            type="number"
            placeholder="Discount %"
            value={discount}
            onChange={(e) =>
              setDiscount(
                e.target.value
              )
            }
          />

          <textarea
            style={textarea}
            placeholder="Notes"
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
          />

          <div style={totalsBox}>
            <p>
              Subtotal:
              <strong>
                {" "}
                {currency(
                  subtotal
                )}
              </strong>
            </p>

            <p>
              VAT:
              <strong>
                {" "}
                {currency(
                  vatAmount
                )}
              </strong>
            </p>

            <p>
              Discount:
              <strong>
                {" "}
                {currency(
                  discountAmount
                )}
              </strong>
            </p>

            <h2>
              Total:
              {" "}
              {currency(
                grandTotal
              )}
            </h2>

          </div>

          <button
            style={createBtn}
            onClick={
              createDocument
            }
          >
            Create Document
          </button>

        </div>

      </div>

      {/* BOOKS TABLE */}

      <div style={card}>

        <h2 style={sectionTitle}>
          Documents
        </h2>

        <div
          style={{
            overflowX:
              "auto"
          }}
        >

          <table style={table}>

            <thead style={thead}>
              <tr>

                <th style={th}>
                  Number
                </th>

                <th style={th}>
                  Customer
                </th>

                <th style={th}>
                  Type
                </th>

                <th style={th}>
                  Status
                </th>

                <th style={th}>
                  Total
                </th>

                <th style={th}>
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filtered.map(
                (book) => (

                  <tr
                    key={
                      book._id
                    }
                  >

                    <td style={td}>
                      {
                        book.documentNumber
                      }
                    </td>

                    <td style={td}>
                      {
                        book.customer
                      }
                    </td>

                    <td style={td}>
                      {
                        book.type
                      }
                    </td>

                    <td style={td}>
                      {
                        book.status
                      }
                    </td>

                    <td style={td}>
                      {currency(
                        book.total
                      )}
                    </td>

                    <td style={td}>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: 8,
                          flexWrap:
                            "wrap"
                        }}
                      >

                        <button
                          style={
                            pdfBtn
                          }
                          onClick={() =>
                            downloadPDF(
                              book
                            )
                          }
                        >
                          PDF
                        </button>

                        {book.status !==
                          "paid" && (
                          <button
                            style={
                              paidBtn
                            }
                            onClick={() =>
                              markPaid(
                                book._id
                              )
                            }
                          >
                            Paid
                          </button>
                        )}

                        <button
                          style={
                            deleteBtn
                          }
                          onClick={() =>
                            setDeleteModal(
                              book
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* DELETE MODAL */}

      {systemModal.open && (
  <div style={modal}>

    <div style={modalBox}>

      <h2 style={modalTitle}>
        {systemModal.title}
      </h2>

      <p style={modalMessage}>
        {systemModal.message}
      </p>

      <div style={modalActions}>

        {systemModal.type ===
          "confirm" && (
          <button
            style={cancelBtn}
            onClick={closeModal}
          >
            Cancel
          </button>
        )}

        <button
          style={
            systemModal.type ===
            "error"
              ? deleteBtn
              : createBtn
          }
          onClick={() => {

            if (
              systemModal.onConfirm
            ) {
              systemModal.onConfirm();
            } else {
              closeModal();
            }

          }}
        >
          {systemModal.type ===
          "confirm"
            ? "Confirm"
            : "OK"}
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );

}
/* ==================================
   STYLES
================================== */

const page = {
  width: "100%",
  padding: 20,
  background: "#f8fafc",
  minHeight: "100vh"
};

const title = {
  fontSize: 30,
  fontWeight: 700,
  marginBottom: 25,
  color: "#0f172a"
};

const sectionTitle = {
  marginBottom: 20,
  fontSize: 24,
  fontWeight: 700,
  color: "#0f172a"
};

const miniTitle = {
  marginTop: 25,
  marginBottom: 15,
  fontSize: 18,
  fontWeight: 600,
  color: "#1e3a8a"
};

/* SUMMARY */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 25
};

const summaryCard = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "white",
  padding: 25,
  borderRadius: 18,
  boxShadow:
    "0 10px 30px rgba(15,23,42,0.2)"
};

const summaryNumber = {
  fontSize: 30,
  fontWeight: 700,
  marginTop: 10
};

/* CARD */

const card = {
  background: "white",
  padding: 25,
  borderRadius: 20,
  marginBottom: 30,
  boxShadow:
    "0 10px 30px rgba(0,0,0,0.08)"
};

/* SEARCH */

const searchInput = {
  width: "100%",
  maxWidth: 350,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  marginBottom: 25,
  outline: "none",
  fontSize: 15
};

/* FORM */

const formGrid = {
  display: "grid",
  gap: 15,
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))"
};

const input = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  outline: "none",
  background: "white"
};

const textarea = {
  width: "100%",
  minHeight: 120,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  padding: 15,
  resize: "vertical",
  marginTop: 15,
  fontSize: 14
};

/* BUTTONS */

const addBtn = {
  background:
    "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 600
};

const createBtn = {
  marginTop: 20,
  width: "100%",
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "16px",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700
};

const paidBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600
};

const pdfBtn = {
  background:
    "linear-gradient(135deg,#1e40af,#1d4ed8)",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600
};

const cancelBtn = {
  background: "#e2e8f0",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600
};

/* TOTALS */

const totalsCard = {
  marginTop: 25,
  background: "#eff6ff",
  borderRadius: 20,
  padding: 25
};

const totalsBox = {
  background: "white",
  padding: 20,
  borderRadius: 16,
  marginTop: 20,
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.06)"
};

/* TABLE */

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 700
};

const thead = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)"
};

const th = {
  padding: 14,
  textAlign: "left",
  color: "white",
  fontWeight: 600
};

const td = {
  padding: 14,
  borderTop: "1px solid #e2e8f0"
};

/* MODAL */

const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modalBox = {
  background: "white",
  width: 400,
  padding: 30,
  borderRadius: 20,
  boxShadow:
    "0 15px 40px rgba(0,0,0,0.25)"
};

/* CENTER */

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "70vh",
  fontSize: 20,
  fontWeight: 600,
  color: "#1e293b"
};

const modalTitle = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 10
};

const modalMessage = {
  color: "#475569",
  lineHeight: 1.6,
  marginBottom: 25
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10
};