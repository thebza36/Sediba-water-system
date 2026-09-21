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
  Phone,
  MapPin,
  Truck,
  RefreshCw,
  CalendarDays,
  Percent,
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
  const [refreshing, setRefreshing] = useState(false);
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

  const loadBooks = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
      setRefreshing(false);
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
      const searchValue = search.toLowerCase().trim();

      data = data.filter((book) => {
        return (
          String(book.customer || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(book.documentNumber || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(book.phone || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(book.type || "")
            .toLowerCase()
            .includes(searchValue) ||
          String(book.status || "")
            .toLowerCase()
            .includes(searchValue)
        );
      });
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

  const vatPercent = Math.max(0, Number(vat || 0));
  const discountPercent = Math.max(0, Number(discount || 0));

  const vatAmount =
    subtotal * (vatPercent / 100);

  const discountAmount =
    subtotal * (discountPercent / 100);

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
              vat: vatPercent,
              discount: discountPercent,
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
      `Discount (${book.discount || 0}%): R ${(
        Number(book.subtotal || 0) *
        (Number(book.discount || 0) / 100)
      ).toFixed(2)}`,
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

  const paidDocuments =
    books.filter(
      (book) => book.status === "paid"
    ).length;

  const unpaidDocuments =
    books.filter(
      (book) => book.status !== "paid"
    ).length;

  /* =====================================================
     HELPERS
  ===================================================== */

  const getTypeIcon = (type) => {
    if (type === "invoice") {
      return <Receipt size={15} />;
    }

    return <FileText size={15} />;
  };

  const getStatusIcon = (status) => {
    if (status === "paid") {
      return <CircleCheck size={15} />;
    }

    return <CircleAlert size={15} />;
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <>
        <style>{responsiveStyles}</style>

        <div style={center}>
          <div style={loadingBox}>
            <div style={loadingSpinner}></div>
            <span>Loading Books...</span>
          </div>
        </div>
      </>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <>
      <style>{responsiveStyles}</style>

      <div
        style={page}
        className="books-page"
      >

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div
          style={pageHeader}
          className="books-header"
        >

          <div
            style={pageHeaderIcon}
            className="books-header-icon"
          >
            <BookOpen size={28} strokeWidth={2.2} />
          </div>

          <div style={pageHeaderText}>

            <div
              style={headerTopRow}
              className="books-header-top"
            >

              <div>
                <h1
                  style={title}
                  className="books-title"
                >
                  Books & Billing
                </h1>

                <p
                  style={subtitle}
                  className="books-subtitle"
                >
                  Create quotations, invoices and manage customer documents.
                </p>
              </div>

              <button
                type="button"
                style={refreshBtn}
                className="books-refresh"
                onClick={() => loadBooks(true)}
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  style={
                    refreshing
                      ? {
                          animation:
                            "spin 1s linear infinite",
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

            </div>

          </div>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div
          style={summaryGrid}
          className="books-summary-grid"
        >

          <SummaryCard
            icon={
              <FileText
                size={20}
                strokeWidth={2.2}
              />
            }
            label="Quotations"
            number={totalQuotations}
            description="Total quotations"
          />

          <SummaryCard
            icon={
              <Receipt
                size={20}
                strokeWidth={2.2}
              />
            }
            label="Invoices"
            number={totalInvoices}
            description="Total invoices"
          />

          <SummaryCard
            icon={
              <DollarSign
                size={20}
                strokeWidth={2.2}
              />
            }
            label="Revenue"
            number={currency(totalRevenue)}
            description="Total document value"
          />

          <SummaryCard
            icon={
              <AlertTriangle
                size={20}
                strokeWidth={2.2}
              />
            }
            label="Outstanding"
            number={currency(outstanding)}
            description="Outstanding balance"
          />

        </div>

        {/* =================================================
            STATUS OVERVIEW
        ================================================= */}

        <div
          style={statusOverview}
          className="books-status-overview"
        >

          <div style={statusOverviewItem}>

            <div style={statusOverviewIcon}>
              <CircleCheck size={18} />
            </div>

            <div>
              <div style={statusOverviewNumber}>
                {paidDocuments}
              </div>

              <div style={statusOverviewLabel}>
                Paid Documents
              </div>
            </div>

          </div>

          <div
            style={statusOverviewDivider}
            className="books-status-divider"
          />

          <div style={statusOverviewItem}>

            <div style={statusOverviewIconUnpaid}>
              <CircleAlert size={18} />
            </div>

            <div>
              <div style={statusOverviewNumber}>
                {unpaidDocuments}
              </div>

              <div style={statusOverviewLabel}>
                Unpaid Documents
              </div>
            </div>

          </div>

          <div
            style={statusOverviewDivider}
            className="books-status-divider"
          />

          <div style={statusOverviewItem}>

            <div style={statusOverviewIcon}>
              <ClipboardList size={18} />
            </div>

            <div>
              <div style={statusOverviewNumber}>
                {books.length}
              </div>

              <div style={statusOverviewLabel}>
                All Documents
              </div>
            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          style={searchCard}
          className="books-search-card"
        >

          <div style={searchHeader}>

            <div style={searchHeaderIcon}>
              <Search
                size={21}
                strokeWidth={2.2}
              />
            </div>

            <div style={searchHeaderText}>

              <h2 style={searchTitle}>
                Search Documents
              </h2>

              <p style={searchDescription}>
                Search by customer, document number,
                phone, type or status.
              </p>

            </div>

          </div>

          <div style={searchInputWrapper}>

            <Search
              size={18}
              style={searchInputIcon}
            />

            <input
              style={searchInput}
              placeholder="Search customer, document number..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                style={clearSearchBtn}
                onClick={() => setSearch("")}
              >
                <X size={17} />
              </button>
            )}

          </div>

          <div style={searchResultText}>
            {filtered.length} document
            {filtered.length === 1
              ? ""
              : "s"}{" "}
            found
          </div>

        </div>

        {/* =================================================
            CREATE DOCUMENT
        ================================================= */}

        <div
          style={card}
          className="books-card"
        >

          <div style={sectionHeader}>

            <div style={sectionHeaderIcon}>
              <FilePlus size={21} />
            </div>

            <div>

              <h2
                style={sectionTitle}
                className="books-section-title"
              >
                Create Quotation / Invoice
              </h2>

              <p
                style={sectionDescription}
                className="books-section-description"
              >
                Enter customer details and add the
                products you want to include.
              </p>

            </div>

          </div>

          {/* CUSTOMER DETAILS */}

          <div style={subSection}>

            <h3 style={miniTitle}>
              <span style={miniTitleIcon}>
                <User size={18} />
              </span>

              Customer Details
            </h3>

            <div
              style={formGrid}
              className="books-form-grid"
            >

              <div style={field}>

                <label style={label}>
                  <FileText size={14} />
                  Document Type
                </label>

                <select
                  style={input}
                  value={documentType}
                  onChange={(e) =>
                    setDocumentType(e.target.value)
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
                  <User size={14} />
                  Customer Name
                </label>

                <input
                  style={input}
                  placeholder="Customer Name"
                  value={customer}
                  onChange={(e) =>
                    setCustomer(e.target.value)
                  }
                />

              </div>

              <div style={field}>

                <label style={label}>
                  <Phone size={14} />
                  Phone
                </label>

                <input
                  style={input}
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

              </div>

              <div style={field}>

                <label style={label}>
                  <MapPin size={14} />
                  Address
                </label>

                <input
                  style={input}
                  placeholder="Customer address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                />

              </div>

              <div style={field}>

                <label style={label}>
                  <Truck size={14} />
                  Delivery Address
                </label>

                <input
                  style={input}
                  placeholder="Delivery address"
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(e.target.value)
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

            <div
              style={productGrid}
              className="books-product-grid"
            >

              <div style={field}>

                <label style={label}>
                  <Package size={14} />
                  Product
                </label>

                <select
                  style={input}
                  value={selectedProduct}
                  onChange={(e) =>
                    setSelectedProduct(e.target.value)
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
                  <ShoppingCart size={14} />
                  Quantity
                </label>

                <input
                  style={input}
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                />

              </div>

              <div style={buttonField}>

                <button
                  type="button"
                  style={addBtn}
                  className="books-add-button"
                  onClick={addLineItem}
                >
                  <Plus size={17} />
                  <span>Add Item</span>
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              CURRENT ITEMS
          ================================================= */}

          {lineItems.length > 0 && (
            <div style={itemsSection}>

              <div style={itemsHeader}>

                <h3 style={miniTitle}>
                  <span style={miniTitleIcon}>
                    <Package size={18} />
                  </span>

                  Selected Products
                </h3>

                <span style={itemCountBadge}>
                  {lineItems.length} item
                  {lineItems.length === 1
                    ? ""
                    : "s"}
                </span>

              </div>

              {/* DESKTOP TABLE */}

              <div className="desktopOnly">

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

                              <div
                                style={productNameRow}
                              >

                                <div
                                  style={productTableIcon}
                                >
                                  <Package size={15} />
                                </div>

                                <div>

                                  <strong>
                                    {item.name}
                                  </strong>

                                  {item.size && (
                                    <div
                                      style={itemSize}
                                    >
                                      {item.size}
                                    </div>
                                  )}

                                </div>

                              </div>

                            </td>

                            <td style={td}>

                              <span
                                style={quantityBadge}
                              >
                                {item.quantity}
                              </span>

                            </td>

                            <td style={td}>
                              {currency(item.price)}
                            </td>

                            <td style={td}>
                              <strong>
                                {currency(item.total)}
                              </strong>
                            </td>

                            <td style={td}>

                              <button
                                type="button"
                                style={removeItemBtn}
                                onClick={() =>
                                  removeItem(index)
                                }
                              >
                                <Trash2 size={15} />
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

              {/* MOBILE CARDS */}

              <div className="mobileOnly">

                {lineItems.map(
                  (item, index) => (
                    <div
                      key={index}
                      style={mobileItemCard}
                    >

                      <div
                        style={mobileItemTop}
                      >

                        <div
                          style={mobileItemProduct}
                        >

                          <div
                            style={mobileProductIcon}
                          >
                            <Package size={17} />
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >

                            <strong
                              style={mobileProductName}
                            >
                              {item.name}
                            </strong>

                            {item.size && (
                              <div
                                style={itemSize}
                              >
                                {item.size}
                              </div>
                            )}

                          </div>

                        </div>

                        <button
                          type="button"
                          style={mobileRemoveBtn}
                          onClick={() =>
                            removeItem(index)
                          }
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                      <div
                        style={mobileItemDetails}
                        className="books-mobile-item-details"
                      >

                        <div style={mobileDetail}>

                          <span
                            style={mobileDetailLabel}
                          >
                            Quantity
                          </span>

                          <strong>
                            {item.quantity}
                          </strong>

                        </div>

                        <div style={mobileDetail}>

                          <span
                            style={mobileDetailLabel}
                          >
                            Price
                          </span>

                          <strong>
                            {currency(item.price)}
                          </strong>

                        </div>

                        <div style={mobileDetail}>

                          <span
                            style={mobileDetailLabel}
                          >
                            Total
                          </span>

                          <strong>
                            {currency(item.total)}
                          </strong>

                        </div>

                      </div>

                    </div>
                  )
                )}

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

            <div
              style={billingGrid}
              className="books-billing-grid"
            >

              <div style={field}>

                <label style={billingLabel}>
                  <Percent size={14} />
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
                  <Percent size={14} />
                  Discount %
                </label>

                <input
                  style={billingInput}
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(e.target.value)
                  }
                />

              </div>

            </div>

            <div style={field}>

              <label style={billingLabel}>
                <FileText size={14} />
                Notes
              </label>

              <textarea
                style={billingTextarea}
                placeholder="Add any notes for this document..."
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
                  - {currency(discountAmount)}
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
              type="button"
              style={createBtn}
              onClick={createDocument}
            >

              {documentType === "quotation" ? (
                <>
                  <FileText size={18} />
                  <span>Create Quotation</span>
                </>
              ) : (
                <>
                  <Receipt size={18} />
                  <span>Create Invoice</span>
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <div
          style={card}
          className="books-card"
        >

          <div style={sectionHeader}>

            <div style={sectionHeaderIcon}>
              <Library size={21} />
            </div>

            <div>

              <h2
                style={sectionTitle}
                className="books-section-title"
              >
                Documents
              </h2>

              <p
                style={sectionDescription}
                className="books-section-description"
              >
                View, download, mark as paid or delete your documents.
              </p>

            </div>

          </div>

          {/* DESKTOP DOCUMENT TABLE */}

          <div className="desktopOnly">

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

                        <div style={emptyState}>

                          <div style={emptyIcon}>
                            <Library size={25} />
                          </div>

                          <strong>
                            No documents found
                          </strong>

                          <span>
                            Try changing your search.
                          </span>

                        </div>

                      </td>

                    </tr>
                  ) : (
                    filtered.map((book) => (
                      <tr
                        key={book._id}
                        style={tableRow}
                      >

                        <td style={td}>

                          <div
                            style={documentNumber}
                          >

                            <FileText size={15} />

                            <strong>
                              {book.documentNumber}
                            </strong>

                          </div>

                        </td>

                        <td style={td}>

                          <div
                            style={customerCell}
                          >

                            <div
                              style={customerIcon}
                            >
                              <User size={15} />
                            </div>

                            <div>

                              <strong>
                                {book.customer}
                              </strong>

                              {book.phone && (
                                <div
                                  style={customerPhone}
                                >
                                  <Phone size={11} />
                                  {book.phone}
                                </div>
                              )}

                            </div>

                          </div>

                        </td>

                        <td style={td}>

                          <span
                            style={
                              book.type ===
                              "invoice"
                                ? invoiceBadge
                                : quotationBadge
                            }
                          >
                            {getTypeIcon(book.type)}
                            {book.type}
                          </span>

                        </td>

                        <td style={td}>

                          <span
                            style={
                              book.status ===
                              "paid"
                                ? paidBadge
                                : unpaidBadge
                            }
                          >
                            {getStatusIcon(
                              book.status
                            )}
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
                              type="button"
                              style={pdfBtn}
                              onClick={() =>
                                downloadPDF(book)
                              }
                            >
                              <Download size={15} />
                              PDF
                            </button>

                            {book.status !==
                              "paid" && (
                              <button
                                type="button"
                                style={paidBtn}
                                onClick={() =>
                                  markPaid(
                                    book._id
                                  )
                                }
                              >
                                <Check size={15} />
                                Paid
                              </button>
                            )}

                            <button
                              type="button"
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

          {/* MOBILE DOCUMENT CARDS */}

          <div className="mobileOnly">

            {filtered.length === 0 ? (
              <div
                style={mobileEmptyState}
              >

                <div style={emptyIcon}>
                  <Library size={25} />
                </div>

                <strong>
                  No documents found
                </strong>

                <span>
                  Try changing your search.
                </span>

              </div>
            ) : (
              <div
                style={mobileDocumentsGrid}
              >

                {filtered.map((book) => (
                  <div
                    key={book._id}
                    style={mobileDocumentCard}
                  >

                    <div
                      style={mobileDocumentHeader}
                      className="books-mobile-document-header"
                    >

                      <div
                        style={mobileDocumentNumber}
                      >

                        <div
                          style={mobileDocumentIcon}
                        >
                          {book.type ===
                          "invoice" ? (
                            <Receipt size={17} />
                          ) : (
                            <FileText size={17} />
                          )}
                        </div>

                        <div>

                          <strong>
                            {book.documentNumber}
                          </strong>

                          <div
                            style={
                              mobileDocumentDate
                            }
                          >
                            <CalendarDays
                              size={11}
                            />

                            {book.createdAt
                              ? new Date(
                                  book.createdAt
                                ).toLocaleDateString(
                                  "en-ZA"
                                )
                              : "Document"}
                          </div>

                        </div>

                      </div>

                      <span
                        style={
                          book.type === "invoice"
                            ? invoiceBadge
                            : quotationBadge
                        }
                      >
                        {getTypeIcon(book.type)}
                        {book.type}
                      </span>

                    </div>

                    <div
                      style={mobileCustomerBox}
                    >

                      <div
                        style={
                          mobileCustomerIcon
                        }
                      >
                        <User size={17} />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >

                        <span
                          style={mobileSmallLabel}
                        >
                          Customer
                        </span>

                        <strong
                          style={mobileCustomerName}
                        >
                          {book.customer || "-"}
                        </strong>

                        {book.phone && (
                          <div
                            style={mobilePhone}
                          >
                            <Phone size={12} />
                            {book.phone}
                          </div>
                        )}

                      </div>

                    </div>

                    <div
                      style={mobileDocumentInfo}
                    >

                      <div
                        style={mobileInfoItem}
                      >

                        <span>
                          Status
                        </span>

                        <span
                          style={
                            book.status ===
                            "paid"
                              ? paidBadge
                              : unpaidBadge
                          }
                        >
                          {getStatusIcon(
                            book.status
                          )}
                          {book.status}
                        </span>

                      </div>

                      <div
                        style={mobileInfoItem}
                      >

                        <span>
                          Total
                        </span>

                        <strong
                          style={mobileTotal}
                        >
                          {currency(book.total)}
                        </strong>

                      </div>

                    </div>

                    <div
                      style={mobileActions}
                      className="books-mobile-actions"
                    >

                      <button
                        type="button"
                        style={mobilePdfBtn}
                        onClick={() =>
                          downloadPDF(book)
                        }
                      >
                        <Download size={15} />
                        PDF
                      </button>

                      {book.status !==
                        "paid" && (
                        <button
                          type="button"
                          style={mobilePaidBtn}
                          onClick={() =>
                            markPaid(
                              book._id
                            )
                          }
                        >
                          <Check size={15} />
                          Paid
                        </button>
                      )}

                      <button
                        type="button"
                        style={mobileDeleteBtn}
                        onClick={() =>
                          deleteBook(book)
                        }
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            SYSTEM MODAL
        ================================================= */}

        {systemModal.open && (
          <div
            style={modal}
            className="books-modal"
          >

            <div
              style={modalBox}
              className="books-modal-box"
            >

              <div
                style={{
                  ...modalIcon,
                  background:
                    systemModal.type === "error"
                      ? "#fee2e2"
                      : systemModal.type ===
                        "warning"
                      ? "#fef3c7"
                      : systemModal.type ===
                        "success"
                      ? "#dcfce7"
                      : "#dbeafe",

                  color:
                    systemModal.type === "error"
                      ? "#dc2626"
                      : systemModal.type ===
                        "warning"
                      ? "#d97706"
                      : systemModal.type ===
                        "success"
                      ? "#16a34a"
                      : "#2563eb",
                }}
              >

                {systemModal.type ===
                "error" ? (
                  <CircleAlert size={23} />
                ) : systemModal.type ===
                  "warning" ? (
                  <AlertTriangle size={23} />
                ) : systemModal.type ===
                  "success" ? (
                  <CircleCheck size={23} />
                ) : systemModal.type ===
                  "confirm" ? (
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

              <div
                style={modalActions}
                className="books-modal-actions"
              >

                {systemModal.type ===
                  "confirm" && (
                  <button
                    type="button"
                    style={cancelBtn}
                    onClick={closeModal}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  style={
                    systemModal.type ===
                    "error"
                      ? deleteBtn
                      : createBtnModal
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
    </>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  number,
  description,
}) {
  return (
    <div
      style={summaryCard}
      className="books-summary-card"
    >

      <div style={summaryIcon}>
        {icon}
      </div>

      <div
        style={summaryLabel}
        className="books-summary-label"
      >
        {label}
      </div>

      <div
        style={summaryNumber}
        className="books-summary-number"
      >
        {number}
      </div>

      <div
        style={summaryDescription}
        className="books-summary-description"
      >
        {description}
      </div>

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
  width: "100%",
  minWidth: 0,
};

const pageHeaderText = {
  minWidth: 0,
  flex: 1,
};

const headerTopRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
  width: "100%",
};

const pageHeaderIcon = {
  width: 52,
  height: 52,
  minWidth: 52,
  borderRadius: 14,
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow:
    "0 4px 12px rgba(37,99,235,.12)",
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
   REFRESH
========================================================= */

const refreshBtn = {
  minHeight: 42,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
};

/* =========================================================
   SUMMARY
========================================================= */

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 18,
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
  minWidth: 0,
};

const summaryIcon = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "rgba(255,255,255,.18)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
   STATUS OVERVIEW
========================================================= */

const statusOverview = {
  display: "flex",
  alignItems: "center",
  gap: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: "15px 20px",
  marginBottom: 25,
  boxShadow:
    "0 6px 18px rgba(15,23,42,.05)",
  boxSizing: "border-box",
  width: "100%",
};

const statusOverviewItem = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const statusOverviewIcon = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "#dcfce7",
  color: "#16a34a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const statusOverviewIconUnpaid = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "#fee2e2",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const statusOverviewNumber = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
};

const statusOverviewLabel = {
  fontSize: 11,
  color: "#64748b",
  marginTop: 1,
};

const statusOverviewDivider = {
  width: 1,
  height: 35,
  background: "#e2e8f0",
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
  width: "100%",
};

const searchHeader = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  color: "#ffffff",
  marginBottom: 15,
  minWidth: 0,
};

const searchHeaderIcon = {
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 10,
  background: "rgba(255,255,255,.1)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const searchHeaderText = {
  minWidth: 0,
};

const searchTitle = {
  margin: 0,
  fontSize: 21,
  color: "#ffffff",
  fontWeight: 800,
};

const searchDescription = {
  margin: "4px 0 0",
  color: "#cbd5e1",
  fontSize: 13,
  lineHeight: 1.5,
};

const searchInputWrapper = {
  position: "relative",
  width: "100%",
  maxWidth: 700,
};

const searchInputIcon = {
  position: "absolute",
  left: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
  pointerEvents: "none",
};

const searchInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 42px 13px 40px",
  borderRadius: 11,
  border: "1px solid #475569",
  background: "#334155",
  color: "#ffffff",
  outline: "none",
  fontSize: 14,
  minWidth: 0,
};

const clearSearchBtn = {
  position: "absolute",
  right: 8,
  top: "50%",
  transform: "translateY(-50%)",
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "none",
  background: "#475569",
  color: "#ffffff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const searchResultText = {
  marginTop: 10,
  color: "#94a3b8",
  fontSize: 12,
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
  minWidth: 0,
};

const sectionHeader = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 20,
};

const sectionHeaderIcon = {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 11,
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionTitle = {
  margin: 0,
  fontSize: 23,
  fontWeight: 800,
  color: "#0f172a",
};

const sectionDescription = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const subSection = {
  marginTop: 22,
  width: "100%",
  minWidth: 0,
};

/* =========================================================
   FORM
========================================================= */

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(min(100%,220px),1fr))",
  gap: 15,
  width: "100%",
  minWidth: 0,
};

const productGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,2fr) minmax(120px,0.8fr) minmax(130px,0.8fr)",
  gap: 15,
  alignItems: "end",
  width: "100%",
  minWidth: 0,
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
  boxSizing: "border-box",
};

const label = {
  display: "flex",
  alignItems: "center",
  gap: 6,
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
  minWidth: 0,
};

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
  boxSizing: "border-box",
  minWidth: 0,
  whiteSpace: "nowrap",
};

const createBtn = {
  marginTop: 18,
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
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
  minWidth: 0,
};

/* =========================================================
   MINI HEADINGS
========================================================= */

const miniTitle = {
  margin: "0 0 13px",
  fontSize: 17,
  fontWeight: 700,
  color: "#1e3a8a",
  display: "flex",
  alignItems: "center",
};

const miniTitleIcon = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 7,
  color: "#2563eb",
};

const itemsSection = {
  marginTop: 25,
  width: "100%",
  minWidth: 0,
};

const itemsHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 13,
};

const itemCountBadge = {
  padding: "5px 9px",
  borderRadius: 8,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

/* =========================================================
   TABLE
========================================================= */

const tableWrapper = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxSizing: "border-box",
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

const productNameRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0,
};

const productTableIcon = {
  width: 31,
  height: 31,
  minWidth: 31,
  borderRadius: 8,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const itemSize = {
  marginTop: 3,
  fontSize: 11,
  color: "#64748b",
};

const quantityBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 30,
  padding: "5px 8px",
  borderRadius: 7,
  background: "#f1f5f9",
  color: "#334155",
  fontSize: 12,
  fontWeight: 700,
};

const removeItemBtn = {
  background: "#fee2e2",
  color: "#b91c1c",
  border: "none",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

/* =========================================================
   MOBILE ITEM CARD
========================================================= */

const mobileItemCard = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 14,
  marginBottom: 10,
  boxSizing: "border-box",
  boxShadow:
    "0 4px 12px rgba(15,23,42,.04)",
};

const mobileItemTop = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

const mobileItemProduct = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0,
};

const mobileProductIcon = {
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: 9,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileProductName = {
  display: "block",
  color: "#0f172a",
  fontSize: 14,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const mobileRemoveBtn = {
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: 9,
  border: "none",
  background: "#fee2e2",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const mobileItemDetails = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 8,
  marginTop: 13,
  paddingTop: 12,
  borderTop: "1px solid #e2e8f0",
};

const mobileDetail = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  minWidth: 0,
};

const mobileDetailLabel = {
  fontSize: 10,
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
  width: "100%",
  minWidth: 0,
};

const billingTitle = {
  margin: "0 0 17px",
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
};

const billingIcon = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 7,
  color: "#2563eb",
};

const billingGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 15,
  width: "100%",
  minWidth: 0,
};

const billingLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
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
  minWidth: 0,
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
  minWidth: 0,
};

const totalsBox = {
  background: "#1e293b",
  color: "#ffffff",
  padding: 19,
  borderRadius: 16,
  marginTop: 18,
  boxShadow:
    "0 6px 16px rgba(15,23,42,.12)",
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
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

const baseBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  padding: "5px 9px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "capitalize",
  whiteSpace: "nowrap",
};

const quotationBadge = {
  ...baseBadge,
  background: "#dbeafe",
  color: "#1d4ed8",
};

const invoiceBadge = {
  ...baseBadge,
  background: "#ede9fe",
  color: "#6d28d9",
};

const paidBadge = {
  ...baseBadge,
  background: "#dcfce7",
  color: "#15803d",
};

const unpaidBadge = {
  ...baseBadge,
  background: "#fee2e2",
  color: "#b91c1c",
};

/* =========================================================
   DOCUMENT CELLS
========================================================= */

const documentNumber = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "#1e3a8a",
};

const customerCell = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0,
};

const customerIcon = {
  width: 31,
  height: 31,
  minWidth: 31,
  borderRadius: 8,
  background: "#f1f5f9",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const customerPhone = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 3,
  color: "#64748b",
  fontSize: 10,
};

const actions = {
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
  alignItems: "center",
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
  boxSizing: "border-box",
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
  boxSizing: "border-box",
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
  boxSizing: "border-box",
};

/* =========================================================
   MOBILE DOCUMENT CARDS
========================================================= */

const mobileDocumentsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
};

const mobileDocumentCard = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 15,
  boxSizing: "border-box",
  boxShadow:
    "0 4px 14px rgba(15,23,42,.05)",
};

const mobileDocumentHeader = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
};

const mobileDocumentNumber = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0,
};

const mobileDocumentIcon = {
  width: 36,
  height: 36,
  minWidth: 36,
  borderRadius: 9,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileDocumentDate = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  marginTop: 3,
  color: "#64748b",
  fontSize: 10,
};

const mobileCustomerBox = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 15,
  padding: 12,
  borderRadius: 11,
  background: "#f8fafc",
  minWidth: 0,
};

const mobileCustomerIcon = {
  width: 35,
  height: 35,
  minWidth: 35,
  borderRadius: 9,
  background: "#e2e8f0",
  color: "#475569",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileSmallLabel = {
  display: "block",
  color: "#64748b",
  fontSize: 10,
  marginBottom: 2,
};

const mobileCustomerName = {
  display: "block",
  color: "#0f172a",
  fontSize: 14,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const mobilePhone = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  color: "#64748b",
  fontSize: 10,
  marginTop: 3,
};

const mobileDocumentInfo = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const mobileInfoItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 5,
  padding: 10,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
};

const mobileTotal = {
  fontSize: 15,
  color: "#0f172a",
};

const mobileActions = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 7,
  marginTop: 12,
};

const mobilePdfBtn = {
  ...pdfBtn,
  width: "100%",
  padding: "10px 6px",
  fontSize: 12,
};

const mobilePaidBtn = {
  ...paidBtn,
  width: "100%",
  padding: "10px 6px",
  fontSize: 12,
};

const mobileDeleteBtn = {
  ...deleteBtn,
  width: "100%",
  padding: "10px 6px",
  fontSize: 12,
};

/* =========================================================
   EMPTY STATE
========================================================= */

const emptyCell = {
  padding: 30,
  textAlign: "center",
  color: "#64748b",
};

const emptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const emptyIcon = {
  width: 48,
  height: 48,
  borderRadius: 13,
  background: "#f1f5f9",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 5,
};

const mobileEmptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  padding: "35px 15px",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  color: "#64748b",
  textAlign: "center",
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

const createBtnModal = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  padding: "10px 17px",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxSizing: "border-box",
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
  boxSizing: "border-box",
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
  animation: "spin 1s linear infinite",
};

/* =========================================================
   RESPONSIVE STYLES
========================================================= */

const responsiveStyles = `
  * {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  input::placeholder,
  textarea::placeholder {
    color: #94a3b8;
  }

  .desktopOnly {
    display: block;
  }

  .mobileOnly {
    display: none;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 900px) {

    .books-page {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .books-status-overview {
      flex-wrap: wrap;
    }

  }

  @media (max-width: 700px) {

    .desktopOnly {
      display: none !important;
    }

    .mobileOnly {
      display: block !important;
    }

    .books-page {
      padding: 20px 12px 40px !important;
    }

    .books-header {
      align-items: flex-start !important;
    }

    .books-header-top {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .books-title {
      font-size: 25px !important;
    }

    .books-subtitle {
      font-size: 13px !important;
    }

    .books-refresh {
      width: 100% !important;
    }

    .books-summary-grid {
      grid-template-columns:
        repeat(2,minmax(0,1fr)) !important;
      gap: 10px !important;
    }

    .books-summary-card {
      min-height: 125px !important;
      padding: 15px !important;
    }

    .books-summary-number {
      font-size: 22px !important;
    }

    .books-status-overview {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 12px !important;
      padding: 14px !important;
    }

    .books-status-divider {
      display: none !important;
    }

    .books-card {
      padding: 15px !important;
      border-radius: 16px !important;
    }

    .books-section-title {
      font-size: 19px !important;
    }

    .books-product-grid {
      grid-template-columns: 1fr !important;
    }

    .books-add-button {
      width: 100% !important;
    }

    .books-form-grid {
      grid-template-columns: 1fr !important;
    }

    .books-billing-grid {
      grid-template-columns: 1fr 1fr !important;
    }

    .books-mobile-actions {
      grid-template-columns: 1fr !important;
    }

    .books-search-card {
      padding: 15px !important;
    }

    .books-modal {
      padding: 12px !important;
    }

    .books-modal-box {
      padding: 20px !important;
      border-radius: 17px !important;
    }

  }

  @media (max-width: 480px) {

    .books-page {
      padding: 16px 10px 35px !important;
    }

    .books-header-icon {
      width: 46px !important;
      height: 46px !important;
      min-width: 46px !important;
    }

    .books-title {
      font-size: 22px !important;
    }

    .books-summary-grid {
      grid-template-columns:
        1fr 1fr !important;
    }

    .books-summary-card {
      padding: 13px !important;
      min-height: 118px !important;
    }

    .books-summary-label {
      font-size: 11px !important;
    }

    .books-summary-number {
      font-size: 19px !important;
    }

    .books-summary-description {
      font-size: 10px !important;
    }

    .books-section-description {
      font-size: 12px !important;
    }

    .books-billing-grid {
      grid-template-columns: 1fr !important;
    }

    .books-mobile-item-details {
      grid-template-columns:
        1fr 1fr 1fr !important;
    }

    .books-mobile-document-header {
      align-items: flex-start !important;
    }

    .books-mobile-actions {
      grid-template-columns: 1fr !important;
    }

    .books-mobile-actions button {
      width: 100% !important;
    }

    .books-modal-actions {
      flex-direction: column-reverse !important;
    }

    .books-modal-actions button {
      width: 100% !important;
    }

  }
`;