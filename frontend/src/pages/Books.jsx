import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  Receipt,
  DollarSign,
  AlertTriangle,
  Search,
  FilePlus,
  User,
  ShoppingCart,
  Package,
  CreditCard,
  Library,
  Trash2,
  Check,
  Download,
  X,
  HelpCircle,
  Info,
  CircleCheck,
  CircleAlert,
  Plus,
  ClipboardList,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL;

export default function Books() {
  /* =====================================================
     STATES
  ===================================================== */

  const [products, setProducts] = useState([]);
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [documentType, setDocumentType] = useState("quotation");

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [vat, setVat] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [lineItems, setLineItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  /* =====================================================
     MODAL
  ===================================================== */

  const [systemModal, setSystemModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const openModal = ({
    title,
    message,
    type = "info",
    onConfirm = null,
  }) => {
    setSystemModal({
      open: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeModal = () => {
    setSystemModal({
      open: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
    });
  };

  /* =====================================================
     CURRENCY
  ===================================================== */

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(Number(n) || 0);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);

      if (!res.ok) {
        throw new Error("Products request failed");
      }

      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Products error:", error);

      openModal({
        type: "error",
        title: "Unable to Load Products",
        message: "Failed to load products. Please try again.",
      });
    }
  };

  /* =====================================================
     LOAD BOOKS
  ===================================================== */

  const loadBooks = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/books`);

      if (!res.ok) {
        throw new Error("Books request failed");
      }

      const data = await res.json();

      const bookData = Array.isArray(data) ? data : [];

      setBooks(bookData);
      setFiltered(bookData);
    } catch (error) {
      console.error("Books error:", error);

      openModal({
        type: "error",
        title: "Unable to Load Documents",
        message: "Failed to load books and billing documents.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadProducts();
    loadBooks();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  useEffect(() => {
    let data = [...books];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      data = data.filter((book) =>
        (book.customer || "").toLowerCase().includes(searchValue)
      );
    }

    setFiltered(data);
  }, [search, books]);

  /* =====================================================
     ADD LINE ITEM
  ===================================================== */

  const addLineItem = () => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0) {
      openModal({
        type: "warning",
        title: "Missing Information",
        message: "Please select a product and enter a valid quantity.",
      });

      return;
    }

    const product = products.find(
      (p) => p._id === selectedProduct
    );

    if (!product) {
      openModal({
        type: "error",
        title: "Product Not Found",
        message: "The selected product could not be found.",
      });

      return;
    }

    const total =
      Number(product.price || 0) * Number(quantity || 0);

    const item = {
      product: product._id,
      name: product.name,
      size: product.size,
      category: product.category,
      price: Number(product.price || 0),
      quantity: Number(quantity),
      total,
    };

    setLineItems((previous) => [...previous, item]);

    setSelectedProduct("");
    setQuantity(1);

    openModal({
      type: "success",
      title: "Item Added",
      message: `${product.name} was added successfully.`,
    });
  };

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  const removeItem = (index) => {
    setLineItems((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  /* =====================================================
     TOTALS
  ===================================================== */

  const subtotal = useMemo(() => {
    return lineItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  }, [lineItems]);

  const vatAmount =
    subtotal * (Number(vat || 0) / 100);

  const discountAmount =
    subtotal * (Number(discount || 0) / 100);

  const grandTotal =
    subtotal + vatAmount - discountAmount;

  /* =====================================================
     CLEAR FORM
  ===================================================== */

  const clearForm = () => {
    setCustomer("");
    setPhone("");
    setAddress("");
    setDeliveryAddress("");
    setVat(0);
    setDiscount(0);
    setNotes("");
    setLineItems([]);
    setSelectedProduct("");
    setQuantity(1);
  };

  /* =====================================================
     CREATE DOCUMENT
  ===================================================== */

  const createDocument = async () => {
    if (!customer.trim() || lineItems.length === 0) {
      openModal({
        type: "warning",
        title: "Missing Information",
        message:
          "Please enter the customer name and add at least one product.",
      });

      return;
    }

    openModal({
      type: "confirm",
      title:
        documentType === "quotation"
          ? "Create Quotation?"
          : "Create Invoice?",
      message: `Are you sure you want to create this ${documentType}?`,
      onConfirm: async () => {
        closeModal();

        try {
          const res = await fetch(`${API}/books`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: documentType,
              customer,
              phone,
              address,
              deliveryAddress,
              items: lineItems.map((item) => ({
                product: item.product,
                quantity: item.quantity,
              })),
              vat: Number(vat || 0),
              discount: Number(discount || 0),
              notes,
            }),
          });

          if (!res.ok) {
            throw new Error("Document creation failed");
          }

          clearForm();

          await loadBooks();

          openModal({
            type: "success",
            title: "Document Created",
            message: `${
              documentType === "quotation"
                ? "Quotation"
                : "Invoice"
            } created successfully.`,
          });
        } catch (error) {
          console.error("Create document error:", error);

          openModal({
            type: "error",
            title: "Error",
            message: "Failed to create document. Please try again.",
          });
        }
      },
    });
  };

  /* =====================================================
     MARK PAID
  ===================================================== */

  const markPaid = async (id) => {
    openModal({
      type: "confirm",
      title: "Mark as Paid?",
      message: "Are you sure you want to mark this document as paid?",
      onConfirm: async () => {
        closeModal();

        try {
          const res = await fetch(`${API}/books/${id}/pay`, {
            method: "PUT",
          });

          if (!res.ok) {
            throw new Error("Payment update failed");
          }

          await loadBooks();

          openModal({
            type: "success",
            title: "Payment Updated",
            message: "The document has been marked as paid.",
          });
        } catch (error) {
          console.error("Payment error:", error);

          openModal({
            type: "error",
            title: "Update Failed",
            message: "Failed to update payment status.",
          });
        }
      },
    });
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteBook = async (book) => {
    openModal({
      type: "confirm",
      title: "Delete Document?",
      message: `Are you sure you want to delete ${book.documentNumber}? This action cannot be undone.`,
      onConfirm: async () => {
        closeModal();

        try {
          const res = await fetch(
            `${API}/books/${book._id}`,
            {
              method: "DELETE",
            }
          );

          if (!res.ok) {
            throw new Error("Delete failed");
          }

          await loadBooks();

          openModal({
            type: "success",
            title: "Document Deleted",
            message: "The document was deleted successfully.",
          });
        } catch (error) {
          console.error("Delete error:", error);

          openModal({
            type: "error",
            title: "Delete Failed",
            message: "Failed to delete the document.",
          });
        }
      },
    });
  };

  /* =====================================================
     DOWNLOAD PDF
  ===================================================== */

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
      book.documentNumber || "",
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

      head: [
        [
          "Product",
          "Qty",
          "Price",
          "Total",
        ],
      ],

      body:
        book.items?.map((item) => [
          `${item.name || ""}${
            item.size ? ` (${item.size})` : ""
          }`,
          item.quantity,
          `R ${Number(item.price || 0).toFixed(2)}`,
          `R ${Number(item.total || 0).toFixed(2)}`,
        ]) || [],

      headStyles: {
        fillColor: [15, 23, 42],
      },

      styles: {
        fontSize: 10,
      },
    });

    let finalY =
      doc.lastAutoTable.finalY + 15;

    doc.setFontSize(12);

    doc.text(
      `Subtotal: R ${Number(
        book.subtotal || 0
      ).toFixed(2)}`,
      14,
      finalY
    );

    finalY += 10;

    doc.text(
      `VAT (${book.vat || 0}%): R ${(
        Number(book.subtotal || 0) *
        (Number(book.vat || 0) / 100)
      ).toFixed(2)}`,
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
      `TOTAL: R ${Number(
        book.total || 0
      ).toFixed(2)}`,
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

      const noteLines = doc.splitTextToSize(
        book.notes,
        180
      );

      doc.text(
        noteLines,
        14,
        finalY + 8
      );
    }

    doc.save(
      `${book.documentNumber || "document"}.pdf`
    );
  };

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalQuotations =
    books.filter(
      (book) => book.type === "quotation"
    ).length;

  const totalInvoices =
    books.filter(
      (book) => book.type === "invoice"
    ).length;

  const totalRevenue =
    books.reduce(
      (sum, book) =>
        sum + Number(book.total || 0),
      0
    );

  const outstanding =
    books.reduce(
      (sum, book) =>
        sum +
        Number(book.outstandingBalance || 0),
      0
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div style={center}>
        <div style={loadingBox}>
          <div style={loadingSpinner}></div>
          <span>Loading Books...</span>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div style={page}>

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div style={pageHeader}>
        <div style={pageHeaderIcon}>
          <BookOpen size={28} strokeWidth={2.2} />
        </div>

        <div>
          <h1 style={title}>
            Books & Billing
          </h1>

          <p style={subtitle}>
            Create quotations, invoices and manage customer documents.
          </p>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div style={summaryGrid}>

        <div style={summaryCard}>
         <div style={summaryIcon}>
  <FileText size={20} strokeWidth={2.2} />
</div>

          <div style={summaryLabel}>
            Quotations
          </div>

          <div style={summaryNumber}>
            {totalQuotations}
          </div>

          <div style={summaryDescription}>
            Total quotations
          </div>
        </div>

        <div style={summaryCard}>
         <div style={summaryIcon}>
          <Receipt size={20} strokeWidth={2.2} />
          </div>

          <div style={summaryLabel}>
            Invoices
          </div>

          <div style={summaryNumber}>
            {totalInvoices}
          </div>

          <div style={summaryDescription}>
            Total invoices
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryIcon}>
            <DollarSign size={20} strokeWidth={2.2} />
          </div>

          <div style={summaryLabel}>
            Revenue
          </div>

          <div style={summaryNumber}>
            {currency(totalRevenue)}
          </div>

          <div style={summaryDescription}>
            Total document value
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryIcon}>
            <AlertTriangle size={20} strokeWidth={2.2} />
          </div>

          <div style={summaryLabel}>
            Outstanding
          </div>

          <div style={summaryNumber}>
            {currency(outstanding)}
          </div>

          <div style={summaryDescription}>
            Outstanding balance
          </div>
        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div style={searchCard}>

        <div style={searchHeader}>
          <Search size={25} strokeWidth={2.2} />
          <div>
            <h2 style={searchTitle}>
              Search Documents
            </h2>

            <p style={searchDescription}>
              Search your documents by customer name.
            </p>
          </div>
        </div>

        <input
          style={searchInput}
          placeholder="Search customer..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* =================================================
          CREATE DOCUMENT
      ================================================= */}

      <div style={card}>

       <h2 style={sectionTitle}>
          <span style={titleIcon}>
            <FilePlus size={21} />
          </span>
          Create Quotation / Invoice
        </h2>

        <p style={sectionDescription}>
          Enter customer details and add the products you want to include.
        </p>

        {/* CUSTOMER DETAILS */}

        <div style={subSection}>
         <h3 style={miniTitle}>
            <span style={miniTitleIcon}>
              <User size={18} />
            </span>
            Customer Details
          </h3>

          <div style={formGrid}>

            <div style={field}>
              <label style={label}>
                Document Type
              </label>

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
            </div>

            <div style={field}>
              <label style={label}>
                Customer Name
              </label>

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
            </div>

            <div style={field}>
              <label style={label}>
                Phone
              </label>

              <input
                style={input}
                placeholder="Phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
              />
            </div>

            <div style={field}>
              <label style={label}>
                Address
              </label>

              <input
                style={input}
                placeholder="Customer address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />
            </div>

            <div style={field}>
              <label style={label}>
                Delivery Address
              </label>

              <input
                style={input}
                placeholder="Delivery address"
                value={deliveryAddress}
                onChange={(e) =>
                  setDeliveryAddress(
                    e.target.value
                  )
                }
              />
            </div>

          </div>
        </div>

        {/* ADD PRODUCTS */}

        <div style={subSection}>
          <h3 style={miniTitle}>
            <span style={miniTitleIcon}>
              <ShoppingCart size={18} />
            </span>
            Add Products
          </h3>

          <div style={productGrid}>

            <div style={field}>
              <label style={label}>
                Product
              </label>

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

                {products.map((product) => (
                  <option
                    key={product._id}
                    value={product._id}
                  >
                    {product.name}
                    {product.size
                      ? ` - ${product.size}`
                      : ""}
                    {" - "}
                    {currency(product.price)}
                  </option>
                ))}
              </select>
            </div>

            <div style={field}>
              <label style={label}>
                Quantity
              </label>

              <input
                style={input}
                type="number"
                min="1"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />
            </div>

            <div style={buttonField}>
              <button
                style={addBtn}
                onClick={addLineItem}
              >
                <Plus size={17} />
                Add Item
              </button>
            </div>

          </div>
        </div>

        {/* =================================================
            CURRENT ITEMS
        ================================================= */}

        {lineItems.length > 0 && (
          <div style={itemsSection}>

            <h3 style={miniTitle}>
              <span style={miniTitleIcon}>
                <Package size={18} />
              </span>
              Selected Products
            </h3>

            <div style={tableWrapper}>
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
                    (item, index) => (
                      <tr
                        key={index}
                        style={tableRow}
                      >
                        <td style={td}>
                          <strong>
                            {item.name}
                          </strong>

                          {item.size && (
                            <div style={itemSize}>
                              {item.size}
                            </div>
                          )}
                        </td>

                        <td style={td}>
                          {item.quantity}
                        </td>

                        <td style={td}>
                          {currency(
                            item.price
                          )}
                        </td>

                        <td style={td}>
                          <strong>
                            {currency(
                              item.total
                            )}
                          </strong>
                        </td>

                        <td style={td}>
                          <button
                            style={deleteBtn}
                            onClick={() =>
                              removeItem(index)
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

          </div>
        )}

        {/* =================================================
            BILLING DETAILS
        ================================================= */}

        <div style={totalsCard}>

       <h3 style={billingTitle}>
            <span style={billingIcon}>
              <CreditCard size={19} />
            </span>
            Billing Details
          </h3>

          <div style={billingGrid}>

            <div style={field}>
              <label style={billingLabel}>
                VAT %
              </label>

              <input
                style={billingInput}
                type="number"
                min="0"
                value={vat}
                onChange={(e) =>
                  setVat(e.target.value)
                }
              />
            </div>

            <div style={field}>
              <label style={billingLabel}>
                Discount %
              </label>

              <input
                style={billingInput}
                type="number"
                min="0"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          <div style={field}>
            <label style={billingLabel}>
              Notes
            </label>

            <textarea
              style={billingTextarea}
              placeholder="Notes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
            />
          </div>

          {/* TOTALS */}

          <div style={totalsBox}>

            <div style={totalLine}>
              <span>
                Subtotal
              </span>

              <strong>
                {currency(subtotal)}
              </strong>
            </div>

            <div style={totalLine}>
              <span>
                VAT
              </span>

              <strong>
                {currency(vatAmount)}
              </strong>
            </div>

            <div style={totalLine}>
              <span>
                Discount
              </span>

              <strong>
                {currency(discountAmount)}
              </strong>
            </div>

            <div style={totalDivider}></div>

            <div style={grandTotalLine}>
              <span>
                Total
              </span>

              <strong>
                {currency(grandTotal)}
              </strong>
            </div>

          </div>

         <button
              style={createBtn}
              onClick={createDocument}
            >
              {documentType === "quotation" ? (
                <>
                  <FileText size={18} />
                  Create Quotation
                </>
              ) : (
                <>
                  <Receipt size={18} />
                  Create Invoice
                </>
              )}
            </button>

        </div>

      </div>

      {/* =================================================
          DOCUMENTS
      ================================================= */}

      <div style={card}>

        <h2 style={sectionTitle}>
          <span style={titleIcon}>
            <Library size={21} />
          </span>
          Documents
        </h2>

        <p style={sectionDescription}>
          View, download, mark as paid or delete your documents.
        </p>

        <div style={tableWrapper}>

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

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={emptyCell}
                  >
                    No documents found.
                  </td>
                </tr>
              ) : (
                filtered.map((book) => (
                  <tr
                    key={book._id}
                    style={tableRow}
                  >

                    <td style={td}>
                      <strong>
                        {book.documentNumber}
                      </strong>
                    </td>

                    <td style={td}>
                      {book.customer}
                    </td>

                    <td style={td}>
                      <span
                        style={
                          book.type === "invoice"
                            ? invoiceBadge
                            : quotationBadge
                        }
                      >
                        {book.type}
                      </span>
                    </td>

                    <td style={td}>
                      <span
                        style={
                          book.status === "paid"
                            ? paidBadge
                            : unpaidBadge
                        }
                      >
                        {book.status}
                      </span>
                    </td>

                    <td style={td}>
                      <strong>
                        {currency(book.total)}
                      </strong>
                    </td>

                    <td style={td}>

                      <div style={actions}>

                        <button
                          style={pdfBtn}
                          onClick={() =>
                            downloadPDF(book)
                          }
                        >
                          <Download size={15} />
                          PDF
                        </button>

                        {book.status !== "paid" && (
                        <button
                          style={paidBtn}
                          onClick={() =>
                            markPaid(book._id)
                          }
                        >
                          <Check size={15} />
                          Paid
                        </button>
                        )}

                        <button
                          style={deleteBtn}
                          onClick={() =>
                            deleteBook(book)
                          }
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          SYSTEM MODAL
      ================================================= */}

      {systemModal.open && (
        <div style={modal}>

          <div style={modalBox}>

            <div
              style={{
                ...modalIcon,
                background:
                  systemModal.type === "error"
                    ? "#fee2e2"
                    : systemModal.type === "warning"
                    ? "#fef3c7"
                    : systemModal.type === "success"
                    ? "#dcfce7"
                    : "#dbeafe",
              }}
            >
              {systemModal.type === "error" ? (
                    <CircleAlert size={23} />
                  ) : systemModal.type === "warning" ? (
                    <AlertTriangle size={23} />
                  ) : systemModal.type === "success" ? (
                    <CircleCheck size={23} />
                  ) : systemModal.type === "confirm" ? (
                    <HelpCircle size={23} />
                  ) : (
                    <Info size={23} />
                  )}
            </div>

            <h2 style={modalTitle}>
              {systemModal.title}
            </h2>

            <p style={modalMessage}>
              {systemModal.message}
            </p>

            <div style={modalActions}>

              {systemModal.type === "confirm" && (
               <button
                  style={cancelBtn}
                  onClick={closeModal}
                >
                  <X size={16} />
                  Cancel
                </button>
              )}

              <button
                style={
                  systemModal.type === "error"
                    ? deleteBtn
                    : createBtnModal
                }
                onClick={() => {
                  if (systemModal.onConfirm) {
                    systemModal.onConfirm();
                  } else {
                    closeModal();
                  }
                }}
              >
                {systemModal.type === "confirm"
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

/* =========================================================
   PAGE
========================================================= */

const page = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "28px 20px 50px",
  boxSizing: "border-box",
  minHeight: "100vh",
  overflowX: "hidden",

  /*
    IMPORTANT:
    These colors are deliberately explicit so that
    Light mode does not make the page title white.
  */
  background: "#f8fafc",
  color: "#0f172a",
};

/* =========================================================
   PAGE HEADER
========================================================= */

const pageHeader = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 25,
};

const pageHeaderIcon = {
  width: 52,
  height: 52,
  minWidth: 52,
  borderRadius: 14,
  background: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 29,
  boxShadow: "0 4px 12px rgba(37,99,235,.12)",
};

const title = {
  margin: 0,
  color: "#0f172a",
  fontSize: 30,
  lineHeight: 1.15,
  fontWeight: 800,
  letterSpacing: "-0.5px",
};

const subtitle = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.5,
};

/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 25,
};

const summaryCard = {
  background:
    "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "#ffffff",
  padding: 20,
  borderRadius: 18,
  minHeight: 140,
  boxSizing: "border-box",
  boxShadow:
    "0 10px 25px rgba(30,64,175,.18)",
};

const summaryIcon = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "rgba(255,255,255,.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  marginBottom: 13,
};

const summaryLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: "#ffffff",
};

const summaryNumber = {
  fontSize: 29,
  fontWeight: 800,
  marginTop: 5,
  color: "#ffffff",
  wordBreak: "break-word",
};

const summaryDescription = {
  marginTop: 5,
  fontSize: 12,
  color: "#dbeafe",
};

/* =========================================================
   SEARCH
========================================================= */

const searchCard = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 18,
  marginBottom: 25,
  boxSizing: "border-box",
  boxShadow:
    "0 8px 20px rgba(15,23,42,.12)",
};

const searchHeader = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  color: "#ffffff",
  fontSize: 25,
  marginBottom: 15,
};

const searchTitle = {
  margin: 0,
  fontSize: 22,
  color: "#ffffff",
  fontWeight: 800,
};

const searchDescription = {
  margin: "5px 0 0",
  color: "#cbd5e1",
  fontSize: 13,
};

const searchInput = {
  width: "100%",
  maxWidth: 500,
  boxSizing: "border-box",
  padding: 13,
  borderRadius: 11,
  border: "1px solid #475569",
  background: "#334155",
  color: "#ffffff",
  outline: "none",
  fontSize: 14,
};

/* =========================================================
   CARDS
========================================================= */

const card = {
  background: "#ffffff",
  padding: 22,
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 20,
  marginBottom: 25,
  boxShadow:
    "0 8px 25px rgba(15,23,42,.08)",
  border: "1px solid #e2e8f0",
};

const sectionTitle = {
  margin: 0,
  marginBottom: 7,
  fontSize: 23,
  fontWeight: 800,
  color: "#0f172a",
};

const sectionDescription = {
  margin: "0 0 20px",
  color: "#64748b",
  fontSize: 13,
};

const subSection = {
  marginTop: 22,
};

const miniTitle = {
  margin: "0 0 13px",
  fontSize: 17,
  fontWeight: 700,
  color: "#1e3a8a",
};

/* =========================================================
   FORM
========================================================= */

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: 15,
};

const productGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(200px,2fr) minmax(120px,1fr) minmax(160px,1fr)",
  gap: 15,
  alignItems: "end",
};

const field = {
  width: "100%",
  minWidth: 0,
};

const buttonField = {
  width: "100%",
  minWidth: 0,
  display: "flex",
  alignItems: "flex-end",
};

const label = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 6,
};

const input = {
  width: "100%",
  minHeight: 45,
  padding: "11px 13px",
  borderRadius: 11,
  border: "1px solid #cbd5e1",
  fontSize: 14,
  outline: "none",
  background: "#ffffff",
  color: "#0f172a",
  boxSizing: "border-box",
};

/* =========================================================
   BUTTONS
========================================================= */

const addBtn = {
  width: "100%",
  minHeight: 45,
  background:
    "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "#ffffff",
  border: "none",
  borderRadius: 11,
  padding: "11px 18px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const createBtn = {
  marginTop: 18,
  width: "100%",
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "#ffffff",
  border: "none",
  borderRadius: 13,
  padding: "15px",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const createBtnModal = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  padding: "10px 17px",
  cursor: "pointer",
  fontWeight: 700,
};

const paidBtn = {
  background: "#16a34a",
  color: "#ffffff",
  border: "none",
  padding: "9px 12px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const deleteBtn = {
  background: "#dc2626",
  color: "#ffffff",
  border: "none",
  padding: "9px 12px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const pdfBtn = {
  background:
    "linear-gradient(135deg,#1e40af,#1d4ed8)",
  color: "#ffffff",
  border: "none",
  padding: "9px 12px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const cancelBtn = {
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  borderRadius: 10,
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const billingIcon = {
  display: "inline-flex",
  alignItems: "center",
  verticalAlign: "middle",
  marginRight: 7,
  color: "#2563eb",
};
/* =========================================================
   ITEMS
========================================================= */

const itemsSection = {
  marginTop: 25,
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

const table = {
  width: "100%",
  minWidth: 720,
  borderCollapse: "collapse",
  background: "#ffffff",
};

const thead = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
};

const th = {
  padding: 13,
  textAlign: "left",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: "nowrap",
};

const td = {
  padding: 13,
  borderTop: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
  verticalAlign: "middle",
};

const tableRow = {
  background: "#ffffff",
};

const itemSize = {
  marginTop: 3,
  fontSize: 11,
  color: "#64748b",
};

const emptyCell = {
  padding: 30,
  textAlign: "center",
  color: "#64748b",
};

/* =========================================================
   BILLING
========================================================= */

const totalsCard = {
  marginTop: 25,
  background: "#eff6ff",
  borderRadius: 18,
  padding: 20,
  border: "1px solid #dbeafe",
  boxSizing: "border-box",
};

const billingTitle = {
  margin: "0 0 17px",
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
};

const billingGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 15,
};

const billingLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 6,
};

const billingInput = {
  width: "100%",
  minHeight: 45,
  padding: "11px 13px",
  borderRadius: 11,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  boxSizing: "border-box",
  fontSize: 14,
  outline: "none",
};

const billingTextarea = {
  width: "100%",
  minHeight: 110,
  padding: 13,
  borderRadius: 11,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  resize: "vertical",
  marginTop: 0,
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};

const totalsBox = {
  background: "#1e293b",
  color: "#ffffff",
  padding: 19,
  borderRadius: 16,
  marginTop: 18,
  boxShadow:
    "0 6px 16px rgba(15,23,42,.12)",
};

const totalLine = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  padding: "7px 0",
  color: "#cbd5e1",
};

const totalDivider = {
  height: 1,
  background: "#475569",
  margin: "10px 0",
};

const grandTotalLine = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  paddingTop: 3,
  fontSize: 19,
  fontWeight: 800,
  color: "#ffffff",
};

/* =========================================================
   BADGES
========================================================= */

const quotationBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 8,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "capitalize",
};

const invoiceBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 8,
  background: "#ede9fe",
  color: "#6d28d9",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "capitalize",
};

const paidBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 8,
  background: "#dcfce7",
  color: "#15803d",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "capitalize",
};

const unpaidBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 8,
  background: "#fee2e2",
  color: "#b91c1c",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "capitalize",
};

const titleIcon = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
  color: "#2563eb",
  verticalAlign: "middle",
};

const miniTitleIcon = {
  display: "inline-flex",
  alignItems: "center",
  verticalAlign: "middle",
  marginRight: 7,
  color: "#2563eb",
};

/* =========================================================
   ACTIONS
========================================================= */

const actions = {
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
  alignItems: "center",
};

/* =========================================================
   MODAL
========================================================= */

const modal = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  background: "rgba(15,23,42,.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
  boxSizing: "border-box",
  zIndex: 9999,
};

const modalBox = {
  background: "#ffffff",
  width: "100%",
  maxWidth: 430,
  padding: 25,
  borderRadius: 20,
  boxSizing: "border-box",
  boxShadow:
    "0 20px 50px rgba(0,0,0,.25)",
};

const modalIcon = {
  width: 48,
  height: 48,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  marginBottom: 15,
};

const modalTitle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: "#0f172a",
};

const modalMessage = {
  color: "#475569",
  lineHeight: 1.6,
  margin: "10px 0 22px",
  fontSize: 14,
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

/* =========================================================
   LOADING
========================================================= */

const center = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0f172a",
  background: "#f8fafc",
};

const loadingBox = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 17,
  fontWeight: 700,
};

const loadingSpinner = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  border: "3px solid #dbeafe",
  borderTopColor: "#2563eb",
};