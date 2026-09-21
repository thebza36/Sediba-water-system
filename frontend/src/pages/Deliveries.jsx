import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Truck,
  Clock,
  MapPin,
  CheckCircle,
  Plus,
  FileText,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Save,
  Loader2,
  Phone,
  Map,
  Droplets,
  DollarSign,
  User,
  Navigation,
  CalendarDays,
  PackageCheck,
  RefreshCw,
  ClipboardList,
  CircleCheck,
  CircleX,
  Route,
  LocateFixed,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

function Deliveries() {
  const { darkMode } = useContext(ThemeContext);

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL;

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /* =====================================================
     NOTIFICATION
  ===================================================== */

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* =====================================================
     CREATE FORM
  ===================================================== */

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    location: "",
    address: "",
    waterQuantity: "",
    deliveryCost: "",
    notes: "",
  });

  /* =====================================================
     EDITING
  ===================================================== */

  const [editingDelivery, setEditingDelivery] =
    useState(null);

  const [editForm, setEditForm] = useState({
    customerName: "",
    phone: "",
    location: "",
    address: "",
    waterQuantity: "",
    deliveryCost: "",
    notes: "",
  });

  /* =====================================================
     CONFIRM MODAL
  ===================================================== */

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    action: null,
    danger: false,
  });

  /* =====================================================
     SHOW NOTIFICATION
  ===================================================== */

  const showNotification = (
    message,
    type = "success"
  ) => {
    setNotification({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  /* =====================================================
     LOAD PAGE
  ===================================================== */

  useEffect(() => {
    loadDeliveries();
  }, []);

  /* =====================================================
     LOAD MY DELIVERIES
  ===================================================== */

  const loadDeliveries = async () => {
    try {
      setPageLoading(true);

      const res = await axios.get(
        `${API}/deliveries/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeliveries(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      console.log(err);

      showNotification(
        err?.response?.data?.message ||
          "Failed to load deliveries.",
        "error"
      );
    } finally {
      setPageLoading(false);
    }
  };

  /* =====================================================
     CREATE DELIVERY
  ===================================================== */

  const createDelivery = async () => {
    if (
      !form.customerName.trim() ||
      !form.location.trim() ||
      !form.waterQuantity
    ) {
      showNotification(
        "Customer name, location and water quantity are required.",
        "error"
      );

      return;
    }

    if (
      Number(form.waterQuantity) <= 0
    ) {
      showNotification(
        "Water quantity must be greater than 0.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/deliveries`,
        {
          customerName:
            form.customerName.trim(),

          phone: form.phone.trim(),

          location:
            form.location.trim(),

          address:
            form.address.trim(),

          waterQuantity: Number(
            form.waterQuantity
          ),

          deliveryCost: Number(
            form.deliveryCost || 0
          ),

          notes: form.notes.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification(
        "Delivery created successfully.",
        "success"
      );

      setForm({
        customerName: "",
        phone: "",
        location: "",
        address: "",
        waterQuantity: "",
        deliveryCost: "",
        notes: "",
      });

      await loadDeliveries();
    } catch (err) {
      console.log(err);

      showNotification(
        err?.response?.data?.message ||
          "Failed to create delivery.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CHANGE STATUS
  ===================================================== */

  const changeStatus = async (
    id,
    status
  ) => {
    try {
      setLoading(true);

      await axios.put(
        `${API}/deliveries/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadDeliveries();

      showNotification(
        `Delivery marked as ${status}.`,
        "success"
      );

      closeConfirm();
    } catch (err) {
      console.log(err);

      showNotification(
        err?.response?.data?.message ||
          "Failed to update delivery status.",
        "error"
      );

      closeConfirm();
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEdit = (delivery) => {
    setEditingDelivery(delivery);

    setEditForm({
      customerName:
        delivery.customerName || "",

      phone:
        delivery.phone || "",

      location:
        delivery.location || "",

      address:
        delivery.address || "",

      waterQuantity:
        delivery.waterQuantity ?? "",

      deliveryCost:
        delivery.deliveryCost ?? "",

      notes:
        delivery.notes || "",
    });
  };

  /* =====================================================
     CLOSE EDIT MODAL
  ===================================================== */

  const closeEdit = () => {
    setEditingDelivery(null);
  };

  /* =====================================================
     ASK DELETE
  ===================================================== */

  const askDelete = (delivery) => {
    setConfirmModal({
      show: true,
      title: "Delete Delivery",
      message:
        "Are you sure you want to delete this delivery? This action cannot be undone.",
      action: () =>
        deleteDelivery(delivery._id),
      danger: true,
    });
  };

  /* =====================================================
     ASK STATUS CHANGE
  ===================================================== */

  const askStatusChange = (
    id,
    status
  ) => {
    setConfirmModal({
      show: true,
      title: "Update Delivery Status",
      message:
        `Are you sure you want to change the delivery status to "${status}"?`,
      action: () =>
        changeStatus(id, status),
      danger: false,
    });
  };

  /* =====================================================
     CLOSE CONFIRM MODAL
  ===================================================== */

  const closeConfirm = () => {
    setConfirmModal({
      show: false,
      title: "",
      message: "",
      action: null,
      danger: false,
    });
  };

  /* =====================================================
     UPDATE DELIVERY
  ===================================================== */

  const updateDelivery = async () => {
    if (!editingDelivery) {
      return;
    }

    if (
      !editForm.customerName.trim() ||
      !editForm.location.trim() ||
      !editForm.waterQuantity
    ) {
      showNotification(
        "Customer name, location and water quantity are required.",
        "error"
      );

      return;
    }

    if (
      Number(editForm.waterQuantity) <= 0
    ) {
      showNotification(
        "Water quantity must be greater than 0.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API}/deliveries/${editingDelivery._id}`,
        {
          customerName:
            editForm.customerName.trim(),

          phone:
            editForm.phone.trim(),

          location:
            editForm.location.trim(),

          address:
            editForm.address.trim(),

          waterQuantity: Number(
            editForm.waterQuantity
          ),

          deliveryCost: Number(
            editForm.deliveryCost || 0
          ),

          notes:
            editForm.notes.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification(
        "Delivery updated successfully.",
        "success"
      );

      closeEdit();

      await loadDeliveries();
    } catch (err) {
      console.log(err);

      showNotification(
        err?.response?.data?.message ||
          "Failed to update delivery.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DELETE DELIVERY
  ===================================================== */

  const deleteDelivery = async (
    id
  ) => {
    try {
      setLoading(true);

      await axios.delete(
        `${API}/deliveries/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification(
        "Delivery deleted successfully.",
        "success"
      );

      closeConfirm();

      await loadDeliveries();
    } catch (err) {
      console.log(err);

      showNotification(
        err?.response?.data?.message ||
          "Failed to delete delivery.",
        "error"
      );

      closeConfirm();
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     STATUS COUNTS
  ===================================================== */

  const totalDeliveries =
    deliveries.length;

  const pendingDeliveries =
    deliveries.filter(
      (d) => d.status === "Pending"
    ).length;

  const onRouteDeliveries =
    deliveries.filter(
      (d) => d.status === "On Route"
    ).length;

  const deliveredDeliveries =
    deliveries.filter(
      (d) => d.status === "Delivered"
    ).length;

  /* =====================================================
     TOTAL WATER
  ===================================================== */

  const totalWater =
    deliveries.reduce(
      (total, delivery) =>
        total +
        Number(
          delivery.waterQuantity || 0
        ),
      0
    );

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      style={{
        ...page,
        background: darkMode
          ? "#0f172a"
          : "#f8fafc",
        color: darkMode
          ? "#f8fafc"
          : "#0f172a",
      }}
    >
      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification.show && (
        <div
          style={{
            ...notificationStyle,
            background:
              notification.type ===
              "success"
                ? "linear-gradient(135deg,#16a34a,#22c55e)"
                : "linear-gradient(135deg,#dc2626,#ef4444)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 19,
              marginBottom: 5,
            }}
          >
            {notification.type ===
            "success" ? (
              <CheckCircle
                size={21}
                strokeWidth={2.5}
              />
            ) : (
              <AlertTriangle
                size={21}
                strokeWidth={2.5}
              />
            )}

            <span>
              {notification.type ===
              "success"
                ? "Success"
                : "Error"}
            </span>
          </div>

          <div>
            {notification.message}
          </div>
        </div>
      )}

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div style={pageHeader}>
        <div
          style={{
            ...titleIcon,
            background: darkMode
              ? "rgba(59,130,246,.18)"
              : "#dbeafe",
            color: "#3b82f6",
          }}
        >
          <Truck
            size={30}
            strokeWidth={2.2}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              ...title,
              color: darkMode
                ? "#f8fafc"
                : "#0f172a",
            }}
          >
            Water Deliveries
          </h1>

          <p
            style={{
              ...subTitle,
              color: darkMode
                ? "#94a3b8"
                : "#64748b",
            }}
          >
            Record, manage and monitor your
            water deliveries.
          </p>
        </div>
      </div>

      {/* =================================================
          DASHBOARD CARDS
      ================================================= */}

      <div style={cards}>
        <DashboardCard
          icon={Truck}
          title="Total Deliveries"
          value={totalDeliveries}
          description="All deliveries"
          darkMode={darkMode}
        />

        <DashboardCard
          icon={Clock}
          title="Pending"
          value={pendingDeliveries}
          description="Awaiting action"
          darkMode={darkMode}
        />

        <DashboardCard
          icon={Route}
          title="On Route"
          value={onRouteDeliveries}
          description="Currently on route"
          darkMode={darkMode}
        />

        <DashboardCard
          icon={CheckCircle}
          title="Delivered"
          value={deliveredDeliveries}
          description="Successfully delivered"
          darkMode={darkMode}
        />

        <DashboardCard
          icon={Droplets}
          title="Water Delivered"
          value={`${totalWater.toLocaleString()} L`}
          description="Total litres"
          darkMode={darkMode}
        />
      </div>

      {/* =================================================
          CREATE DELIVERY
      ================================================= */}

      <div
        style={{
          ...formCard,
          background: darkMode
            ? "#1e293b"
            : "#ffffff",
          boxShadow: darkMode
            ? "0 8px 25px rgba(0,0,0,.22)"
            : "0 8px 25px rgba(15,23,42,.08)",
        }}
      >
        <div style={sectionHeader}>
          <div
            style={{
              ...sectionIcon,
              background: darkMode
                ? "rgba(59,130,246,.18)"
                : "#dbeafe",
            }}
          >
            <Plus
              size={21}
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h2
              style={{
                ...sectionTitle,
                color: darkMode
                  ? "#f8fafc"
                  : "#0f172a",
              }}
            >
              Create Delivery
            </h2>

            <p
              style={{
                ...sectionDescription,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              Enter the customer's delivery
              information below.
            </p>
          </div>
        </div>

        <div style={grid}>
          {/* CUSTOMER */}

          <div style={field}>
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <User
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Customer Name
            </label>

            <input
              style={{
                ...input,
                ...inputTheme(darkMode),
              }}
              placeholder="Enter customer name"
              value={
                form.customerName
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  customerName:
                    e.target.value,
                })
              }
            />
          </div>

          {/* PHONE */}

          <div style={field}>
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <Phone
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Phone Number
            </label>

            <input
              style={{
                ...input,
                ...inputTheme(darkMode),
              }}
              type="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone:
                    e.target.value,
                })
              }
            />
          </div>

          {/* LOCATION */}

          <div style={field}>
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <MapPin
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Location
            </label>

            <input
              style={{
                ...input,
                ...inputTheme(darkMode),
              }}
              placeholder="Enter location"
              value={
                form.location
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  location:
                    e.target.value,
                })
              }
            />
          </div>

          {/* ADDRESS */}

          <div style={field}>
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <Map
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Address
            </label>

            <input
              style={{
                ...input,
                ...inputTheme(darkMode),
              }}
              placeholder="Enter address"
              value={
                form.address
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  address:
                    e.target.value,
                })
              }
            />
          </div>

          {/* WATER */}

          <div style={field}>
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <Droplets
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Water Quantity (L)
            </label>

            <input
              style={{
                ...input,
                ...inputTheme(darkMode),
              }}
              type="number"
              min="0"
              placeholder="Enter litres"
              value={
                form.waterQuantity
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  waterQuantity:
                    e.target.value,
                })
              }
            />
          </div>

          {/* COST */}

          <div style={field}>
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <DollarSign
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Delivery Cost (R)
            </label>

            <input
              style={{
                ...input,
                ...inputTheme(darkMode),
              }}
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter delivery cost"
              value={
                form.deliveryCost
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  deliveryCost:
                    e.target.value,
                })
              }
            />
          </div>

          {/* NOTES */}

          <div
            style={
              fullWidthField
            }
          >
            <label
              style={{
                ...label,
                color: darkMode
                  ? "#cbd5e1"
                  : "#334155",
              }}
            >
              <FileText
                size={14}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight: 5,
                }}
              />
              Notes
            </label>

            <textarea
              rows="4"
              style={{
                ...textarea,
                ...inputTheme(darkMode),
              }}
              placeholder="Additional delivery notes..."
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes:
                    e.target.value,
                })
              }
            />
          </div>
        </div>

        <button
          style={{
            ...button,
            opacity: loading
              ? 0.7
              : 1,
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
          disabled={loading}
          onClick={
            createDelivery
          }
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="spin"
              />
              Creating Delivery...
            </>
          ) : (
            <>
              <Truck
                size={18}
              />
              Create Delivery
            </>
          )}
        </button>
      </div>

      {/* =================================================
          DELIVERIES
      ================================================= */}

      <div
        style={{
          ...tableCard,
          background: darkMode
            ? "#1e293b"
            : "#ffffff",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            ...tableHeader,
            borderBottom: darkMode
              ? "1px solid #334155"
              : "1px solid #e2e8f0",
          }}
        >
          <div>
            <h2
              style={{
                ...tableTitle,
                color: darkMode
                  ? "#f8fafc"
                  : "#0f172a",
              }}
            >
              <span
                style={
                  tableTitleIcon
                }
              >
                <ClipboardList
                  size={21}
                />
              </span>

              My Deliveries
            </h2>

            <p
              style={{
                ...tableDescription,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              View and manage your delivery
              records.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                ...refreshButton,
                background: darkMode
                  ? "#334155"
                  : "#f1f5f9",
                color: darkMode
                  ? "#e2e8f0"
                  : "#334155",
              }}
              onClick={
                loadDeliveries
              }
              disabled={pageLoading}
            >
              <RefreshCw
                size={15}
                className={
                  pageLoading
                    ? "spin"
                    : ""
                }
              />
              Refresh
            </button>

            <div
              style={{
                ...recordCount,
                background: darkMode
                  ? "rgba(59,130,246,.18)"
                  : "#dbeafe",
                color: darkMode
                  ? "#93c5fd"
                  : "#1e3a8a",
              }}
            >
              {deliveries.length}{" "}
              {deliveries.length ===
              1
                ? "Delivery"
                : "Deliveries"}
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div
          className="desktop-delivery-table"
          style={tableWrapper}
        >
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>
                  #
                </th>

                <th style={th}>
                  Customer
                </th>

                <th style={th}>
                  Phone
                </th>

                <th style={th}>
                  Location
                </th>

                <th style={th}>
                  Address
                </th>

                <th style={th}>
                  Water
                </th>

                <th style={th}>
                  Cost
                </th>

                <th style={th}>
                  Status
                </th>

                <th style={th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {pageLoading ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      ...emptyCell,
                      color: darkMode
                        ? "#94a3b8"
                        : "#64748b",
                    }}
                  >
                    <Loader2
                      size={32}
                      className="spin"
                    />

                    <div
                      style={{
                        marginTop: 10,
                      }}
                    >
                      Loading deliveries...
                    </div>
                  </td>
                </tr>
              ) : deliveries.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      ...emptyCell,
                      color: darkMode
                        ? "#94a3b8"
                        : "#64748b",
                    }}
                  >
                    <div
                      style={{
                        ...emptyIcon,
                        background:
                          darkMode
                            ? "rgba(59,130,246,.12)"
                            : "#eff6ff",
                      }}
                    >
                      <Truck
                        size={42}
                        strokeWidth={1.7}
                      />
                    </div>

                    No deliveries found.
                  </td>
                </tr>
              ) : (
                deliveries.map(
                  (
                    delivery,
                    index
                  ) => (
                    <tr
                      key={
                        delivery._id
                      }
                      style={{
                        background:
                          darkMode
                            ? index %
                                2 ===
                              0
                              ? "#1e293b"
                              : "#172033"
                            : index %
                                2 ===
                              0
                            ? "#ffffff"
                            : "#f8fafc",
                      }}
                    >
                      {/* NUMBER */}

                      <td
                        style={{
                          ...td,
                          color:
                            darkMode
                              ? "#cbd5e1"
                              : "#334155",
                        }}
                      >
                        {index + 1}
                      </td>

                      {/* CUSTOMER */}

                      <td
                        style={{
                          ...td,
                          fontWeight: 700,
                          color:
                            darkMode
                              ? "#f8fafc"
                              : "#0f172a",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              background:
                                darkMode
                                  ? "rgba(59,130,246,.15)"
                                  : "#dbeafe",
                              color:
                                "#2563eb",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            <User
                              size={15}
                            />
                          </div>

                          <span>
                            {
                              delivery.customerName
                            }
                          </span>
                        </div>
                      </td>

                      {/* PHONE */}

                      <td
                        style={{
                          ...td,
                          color:
                            darkMode
                              ? "#cbd5e1"
                              : "#334155",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: 5,
                          }}
                        >
                          <Phone
                            size={13}
                          />

                          {delivery.phone ||
                            "-"}
                        </span>
                      </td>

                      {/* LOCATION */}

                      <td
                        style={{
                          ...td,
                          color:
                            darkMode
                              ? "#cbd5e1"
                              : "#334155",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: 5,
                          }}
                        >
                          <MapPin
                            size={13}
                          />

                          {
                            delivery.location
                          }
                        </span>
                      </td>

                      {/* ADDRESS */}

                      <td
                        style={{
                          ...td,
                          color:
                            darkMode
                              ? "#cbd5e1"
                              : "#334155",
                          maxWidth: 220,
                        }}
                      >
                        {delivery.address ||
                          "-"}
                      </td>

                      {/* WATER */}

                      <td
                        style={{
                          ...td,
                          fontWeight: 700,
                          color:
                            darkMode
                              ? "#93c5fd"
                              : "#1e40af",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: 5,
                          }}
                        >
                          <Droplets
                            size={14}
                          />

                          {
                            delivery.waterQuantity
                          }{" "}
                          L
                        </span>
                      </td>

                      {/* COST */}

                      <td
                        style={{
                          ...td,
                          fontWeight: 700,
                          color:
                            darkMode
                              ? "#86efac"
                              : "#166534",
                        }}
                      >
                        R{" "}
                        {Number(
                          delivery.deliveryCost ||
                            0
                        ).toFixed(2)}
                      </td>

                      {/* STATUS */}

                      <td style={td}>
                        <div
                          style={
                            statusContainer
                          }
                        >
                          <span
                            style={{
                              ...badge,
                              background:
                                getStatusColor(
                                  delivery.status
                                ),
                            }}
                          >
                            {getStatusIcon(
                              delivery.status
                            )}

                            {
                              delivery.status
                            }
                          </span>

                          <select
                            style={{
                              ...select,
                              ...inputTheme(
                                darkMode
                              ),
                            }}
                            value={
                              delivery.status
                            }
                            onChange={(
                              e
                            ) =>
                              askStatusChange(
                                delivery._id,
                                e.target
                                  .value
                              )
                            }
                          >
                            <option>
                              Pending
                            </option>

                            <option>
                              Accepted
                            </option>

                            <option>
                              On Route
                            </option>

                            <option>
                              Delivered
                            </option>

                            <option>
                              Cancelled
                            </option>
                          </select>
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td style={td}>
                        <div
                          style={
                            actionButtons
                          }
                        >
                          <button
                            style={
                              editButton
                            }
                            onClick={() =>
                              openEdit(
                                delivery
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />

                            Edit
                          </button>

                          <button
                            style={
                              deleteButton
                            }
                            onClick={() =>
                              askDelete(
                                delivery
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />

                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            MOBILE DELIVERY CARDS
        ================================================= */}

        <div
          className="mobile-delivery-list"
        >
          {pageLoading ? (
            <div
              style={{
                ...mobileEmpty,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              <Loader2
                size={32}
                className="spin"
              />

              <div>
                Loading deliveries...
              </div>
            </div>
          ) : deliveries.length ===
            0 ? (
            <div
              style={{
                ...mobileEmpty,
                color: darkMode
                  ? "#94a3b8"
                  : "#64748b",
              }}
            >
              <div
                style={{
                  ...emptyIcon,
                  background:
                    darkMode
                      ? "rgba(59,130,246,.12)"
                      : "#eff6ff",
                }}
              >
                <Truck
                  size={40}
                />
              </div>

              <strong>
                No deliveries found
              </strong>

              <span>
                Your delivery records will
                appear here.
              </span>
            </div>
          ) : (
            deliveries.map(
              (
                delivery,
                index
              ) => (
                <div
                  key={
                    delivery._id
                  }
                  style={{
                    ...mobileCard,
                    background:
                      darkMode
                        ? "#172033"
                        : "#ffffff",
                    border:
                      darkMode
                        ? "1px solid #334155"
                        : "1px solid #e2e8f0",
                  }}
                >
                  {/* CARD HEADER */}

                  <div
                    style={
                      mobileCardHeader
                    }
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          ...mobileCustomerIcon,
                          background:
                            darkMode
                              ? "rgba(59,130,246,.18)"
                              : "#dbeafe",
                        }}
                      >
                        <User
                          size={18}
                        />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            ...mobileCustomerName,
                            color:
                              darkMode
                                ? "#f8fafc"
                                : "#0f172a",
                          }}
                        >
                          {
                            delivery.customerName
                          }
                        </div>

                        <div
                          style={{
                            ...mobileRecordNumber,
                            color:
                              darkMode
                                ? "#94a3b8"
                                : "#64748b",
                          }}
                        >
                          Delivery #
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        ...badge,
                        background:
                          getStatusColor(
                            delivery.status
                          ),
                        flexShrink: 0,
                      }}
                    >
                      {getStatusIcon(
                        delivery.status
                      )}

                      {
                        delivery.status
                      }
                    </span>
                  </div>

                  {/* DATE */}

                  <div
                    style={{
                      ...mobileDate,
                      color:
                        darkMode
                          ? "#94a3b8"
                          : "#64748b",
                    }}
                  >
                    <CalendarDays
                      size={14}
                    />

                    {formatDate(
                      delivery.createdAt ||
                        delivery.date
                    )}
                  </div>

                  {/* DETAILS */}

                  <div
                    style={
                      mobileDetails
                    }
                  >
                    <div
                      style={{
                        ...mobileDetail,
                        background:
                          darkMode
                            ? "#1e293b"
                            : "#f8fafc",
                      }}
                    >
                      <Droplets
                        size={17}
                        color="#2563eb"
                      />

                      <div>
                        <span
                          style={
                            mobileDetailLabel
                          }
                        >
                          Water
                        </span>

                        <strong
                          style={{
                            color:
                              darkMode
                                ? "#f8fafc"
                                : "#0f172a",
                          }}
                        >
                          {
                            delivery.waterQuantity
                          }{" "}
                          L
                        </strong>
                      </div>
                    </div>

                    <div
                      style={{
                        ...mobileDetail,
                        background:
                          darkMode
                            ? "#1e293b"
                            : "#f8fafc",
                      }}
                    >
                      <DollarSign
                        size={17}
                        color="#16a34a"
                      />

                      <div>
                        <span
                          style={
                            mobileDetailLabel
                          }
                        >
                          Cost
                        </span>

                        <strong
                          style={{
                            color:
                              darkMode
                                ? "#86efac"
                                : "#166534",
                          }}
                        >
                          R{" "}
                          {Number(
                            delivery.deliveryCost ||
                              0
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div
                    style={{
                      ...mobileInfoRow,
                      color:
                        darkMode
                          ? "#cbd5e1"
                          : "#334155",
                    }}
                  >
                    <MapPin
                      size={16}
                      color="#2563eb"
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={
                          mobileInfoLabel
                        }
                      >
                        Location
                      </span>

                      <span
                        style={
                          mobileInfoValue
                        }
                      >
                        {
                          delivery.location
                        }
                      </span>
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div
                    style={{
                      ...mobileInfoRow,
                      color:
                        darkMode
                          ? "#cbd5e1"
                          : "#334155",
                    }}
                  >
                    <Map
                      size={16}
                      color="#2563eb"
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={
                          mobileInfoLabel
                        }
                      >
                        Address
                      </span>

                      <span
                        style={
                          mobileInfoValue
                        }
                      >
                        {delivery.address ||
                          "No address provided"}
                      </span>
                    </div>
                  </div>

                  {/* PHONE */}

                  <div
                    style={{
                      ...mobileInfoRow,
                      color:
                        darkMode
                          ? "#cbd5e1"
                          : "#334155",
                    }}
                  >
                    <Phone
                      size={16}
                      color="#2563eb"
                    />

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={
                          mobileInfoLabel
                        }
                      >
                        Phone
                      </span>

                      <span
                        style={
                          mobileInfoValue
                        }
                      >
                        {delivery.phone ||
                          "No phone number"}
                      </span>
                    </div>
                  </div>

                  {/* NOTES */}

                  {delivery.notes && (
                    <div
                      style={{
                        ...mobileNotes,
                        background:
                          darkMode
                            ? "#1e293b"
                            : "#f8fafc",
                        color:
                          darkMode
                            ? "#cbd5e1"
                            : "#475569",
                      }}
                    >
                      <FileText
                        size={15}
                        color="#2563eb"
                      />

                      <span>
                        {delivery.notes}
                      </span>
                    </div>
                  )}

                  {/* STATUS SELECT */}

                  <div
                    style={
                      mobileStatusSection
                    }
                  >
                    <label
                      style={{
                        ...mobileStatusLabel,
                        color:
                          darkMode
                            ? "#cbd5e1"
                            : "#475569",
                      }}
                    >
                      <Navigation
                        size={14}
                      />
                      Change Status
                    </label>

                    <select
                      style={{
                        ...mobileSelect,
                        ...inputTheme(
                          darkMode
                        ),
                      }}
                      value={
                        delivery.status
                      }
                      onChange={(e) =>
                        askStatusChange(
                          delivery._id,
                          e.target.value
                        )
                      }
                    >
                      <option>
                        Pending
                      </option>

                      <option>
                        Accepted
                      </option>

                      <option>
                        On Route
                      </option>

                      <option>
                        Delivered
                      </option>

                      <option>
                        Cancelled
                      </option>
                    </select>
                  </div>

                  {/* ACTIONS */}

                  <div
                    style={
                      mobileActions
                    }
                  >
                    <button
                      style={{
                        ...mobileEditButton,
                        flex: 1,
                      }}
                      onClick={() =>
                        openEdit(
                          delivery
                        )
                      }
                    >
                      <Pencil
                        size={16}
                      />
                      Edit
                    </button>

                    <button
                      style={{
                        ...mobileDeleteButton,
                        flex: 1,
                      }}
                      onClick={() =>
                        askDelete(
                          delivery
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                      Delete
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* =================================================
          EDIT DELIVERY MODAL
      ================================================= */}

      {editingDelivery && (
        <div
          style={
            modalOverlay
          }
        >
          <div
            style={{
              ...editModal,
              background:
                darkMode
                  ? "#1e293b"
                  : "#ffffff",
            }}
          >
            <div
              style={
                modalHeader
              }
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <h2
                  style={{
                    ...modalTitle,
                    color:
                      darkMode
                        ? "#f8fafc"
                        : "#0f172a",
                  }}
                >
                  <Pencil
                    size={23}
                    style={{
                      marginRight: 8,
                    }}
                  />

                  Edit Delivery
                </h2>

                <p
                  style={{
                    ...modalSubtitle,
                    color:
                      darkMode
                        ? "#94a3b8"
                        : "#64748b",
                  }}
                >
                  Update the delivery
                  information.
                </p>
              </div>

              <button
                style={{
                  ...closeButton,
                  background:
                    darkMode
                      ? "#334155"
                      : "#f1f5f9",
                  color:
                    darkMode
                      ? "#e2e8f0"
                      : "#334155",
                }}
                onClick={
                  closeEdit
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div
              style={
                modalGrid
              }
            >
              {/* CUSTOMER */}

              <div style={field}>
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Customer Name
                </label>

                <input
                  style={{
                    ...input,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  value={
                    editForm.customerName
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      customerName:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* PHONE */}

              <div style={field}>
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Phone Number
                </label>

                <input
                  style={{
                    ...input,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  type="tel"
                  value={
                    editForm.phone
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      phone:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* LOCATION */}

              <div style={field}>
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Location
                </label>

                <input
                  style={{
                    ...input,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  value={
                    editForm.location
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      location:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* ADDRESS */}

              <div style={field}>
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Address
                </label>

                <input
                  style={{
                    ...input,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  value={
                    editForm.address
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      address:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* WATER */}

              <div style={field}>
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Water Quantity (L)
                </label>

                <input
                  style={{
                    ...input,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  type="number"
                  min="0"
                  value={
                    editForm.waterQuantity
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      waterQuantity:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* COST */}

              <div style={field}>
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Delivery Cost (R)
                </label>

                <input
                  style={{
                    ...input,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editForm.deliveryCost
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      deliveryCost:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* NOTES */}

              <div
                style={
                  fullWidthField
                }
              >
                <label
                  style={{
                    ...label,
                    color:
                      darkMode
                        ? "#cbd5e1"
                        : "#334155",
                  }}
                >
                  Notes
                </label>

                <textarea
                  rows="4"
                  style={{
                    ...textarea,
                    ...inputTheme(
                      darkMode
                    ),
                  }}
                  value={
                    editForm.notes
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notes:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div
              style={
                modalButtons
              }
            >
              <button
                style={{
                  ...cancelButton,
                  background:
                    darkMode
                      ? "#334155"
                      : "#e2e8f0",
                  color:
                    darkMode
                      ? "#e2e8f0"
                      : "#334155",
                }}
                onClick={
                  closeEdit
                }
              >
                <X size={16} />
                Cancel
              </button>

              <button
                style={
                  saveButton
                }
                disabled={loading}
                onClick={
                  updateDelivery
                }
              >
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={16}
                    />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CONFIRMATION MODAL
      ================================================= */}

      {confirmModal.show && (
        <div
          style={
            modalOverlay
          }
        >
          <div
            style={{
              ...confirmModalBox,
              background:
                darkMode
                  ? "#1e293b"
                  : "#ffffff",
            }}
          >
            <div
              style={{
                ...confirmIcon,
                background:
                  confirmModal.danger
                    ? darkMode
                      ? "rgba(220,38,38,.18)"
                      : "#fee2e2"
                    : darkMode
                    ? "rgba(245,158,11,.18)"
                    : "#fef3c7",

                color:
                  confirmModal.danger
                    ? "#ef4444"
                    : "#f59e0b",
              }}
            >
              {confirmModal.danger ? (
                <Trash2
                  size={25}
                />
              ) : (
                <AlertTriangle
                  size={25}
                />
              )}
            </div>

            <h2
              style={{
                ...confirmTitle,
                color:
                  darkMode
                    ? "#f8fafc"
                    : "#0f172a",
              }}
            >
              {
                confirmModal.title
              }
            </h2>

            <p
              style={{
                ...confirmMessage,
                color:
                  darkMode
                    ? "#94a3b8"
                    : "#64748b",
              }}
            >
              {
                confirmModal.message
              }
            </p>

            <div
              style={
                modalButtons
              }
            >
              <button
                style={{
                  ...cancelButton,
                  background:
                    darkMode
                      ? "#334155"
                      : "#e2e8f0",
                  color:
                    darkMode
                      ? "#e2e8f0"
                      : "#334155",
                }}
                onClick={
                  closeConfirm
                }
              >
                <X size={16} />
                Cancel
              </button>

              <button
                style={
                  confirmModal.danger
                    ? deleteButton
                    : saveButton
                }
                disabled={loading}
                onClick={
                  confirmModal.action
                }
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                ) : (
                  <CheckCircle
                    size={16}
                  />
                )}

                {loading
                  ? "Please wait..."
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          RESPONSIVE + ANIMATIONS
      ================================================= */}

      <style>
        {`
          .spin {
            animation: deliverySpin 1s linear infinite;
          }

          @keyframes deliverySpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          button {
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease,
              opacity 0.15s ease;
          }

          button:not(:disabled):hover {
            transform: translateY(-1px);
          }

          button:not(:disabled):active {
            transform: translateY(0);
          }

          input,
          textarea,
          select {
            transition:
              border-color 0.15s ease,
              box-shadow 0.15s ease;
          }

          input:focus,
          textarea:focus,
          select:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59,130,246,.12);
          }

          .mobile-delivery-list {
            display: none;
          }

          @media (max-width: 900px) {

            .desktop-delivery-table {
              display: none !important;
            }

            .mobile-delivery-list {
              display: flex;
              flex-direction: column;
              gap: 15px;
              padding: 16px;
            }

          }

          @media (max-width: 700px) {

            .delivery-page-header {
              align-items: flex-start;
            }

          }

          @media (max-width: 600px) {

            .delivery-page {
              padding: 15px !important;
            }

            .delivery-cards {
              grid-template-columns: repeat(2, minmax(0,1fr)) !important;
              gap: 12px !important;
            }

            .delivery-form-grid {
              grid-template-columns: 1fr !important;
            }

            .delivery-full-width {
              grid-column: auto !important;
            }

            .delivery-create-button {
              max-width: none !important;
            }

            .delivery-modal-grid {
              grid-template-columns: 1fr !important;
            }

            .delivery-modal-buttons {
              flex-direction: column-reverse !important;
            }

            .delivery-modal-buttons button {
              width: 100% !important;
            }

          }

          @media (max-width: 420px) {

            .delivery-cards {
              grid-template-columns: 1fr !important;
            }

            .mobile-delivery-list {
              padding: 12px !important;
            }

            .mobile-delivery-card {
              padding: 14px !important;
            }

          }

          @media (max-width: 360px) {

            .delivery-title-icon {
              width: 48px !important;
              height: 48px !important;
              min-width: 48px !important;
            }

            .delivery-title-text {
              font-size: 25px !important;
            }

          }
        `}
      </style>
    </div>
  );
}

/* =====================================================
   DASHBOARD CARD
===================================================== */

function DashboardCard({
  icon: Icon,
  title,
  value,
  description,
  darkMode,
}) {
  return (
    <div
      className="delivery-dashboard-card"
      style={{
        ...dashboardCard,
        boxShadow: darkMode
          ? "0 10px 25px rgba(0,0,0,.25)"
          : "0 10px 25px rgba(30,64,175,.18)",
      }}
    >
      <div
        style={
          dashboardIcon
        }
      >
        <Icon
          size={22}
          strokeWidth={2.2}
        />
      </div>

      <div
        style={
          dashboardLabel
        }
      >
        {title}
      </div>

      <div
        style={
          dashboardNumber
        }
      >
        {value}
      </div>

      <div
        style={
          dashboardDescription
        }
      >
        {description}
      </div>
    </div>
  );
}

/* =====================================================
   STATUS ICON
===================================================== */

function getStatusIcon(status) {
  if (status === "Delivered") {
    return (
      <CheckCircle
        size={14}
        strokeWidth={2.5}
      />
    );
  }

  if (status === "On Route") {
    return (
      <Truck
        size={14}
        strokeWidth={2.5}
      />
    );
  }

  if (status === "Accepted") {
    return (
      <CircleCheck
        size={14}
        strokeWidth={2.5}
      />
    );
  }

  if (status === "Cancelled") {
    return (
      <CircleX
        size={14}
        strokeWidth={2.5}
      />
    );
  }

  return (
    <Clock
      size={14}
      strokeWidth={2.5}
    />
  );
}

/* =====================================================
   STATUS COLOR
===================================================== */

function getStatusColor(status) {
  if (status === "Delivered") {
    return "#16a34a";
  }

  if (status === "On Route") {
    return "#2563eb";
  }

  if (status === "Accepted") {
    return "#9333ea";
  }

  if (status === "Cancelled") {
    return "#dc2626";
  }

  return "#f59e0b";
}

/* =====================================================
   DARK MODE INPUT
===================================================== */

function inputTheme(darkMode) {
  return {
    background: darkMode
      ? "#0f172a"
      : "#ffffff",

    color: darkMode
      ? "#f8fafc"
      : "#0f172a",

    border: darkMode
      ? "1px solid #475569"
      : "1px solid #cbd5e1",
  };
}

/* =====================================================
   PAGE
===================================================== */

const page = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding:
    "clamp(15px,3vw,30px)",
  boxSizing: "border-box",
  minHeight: "100vh",
  overflowX: "hidden",
};

/* =====================================================
   HEADER
===================================================== */

const pageHeader = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 25,
  padding:
    "5px 0 10px 0",
};

const titleIcon = {
  width: 55,
  height: 55,
  minWidth: 55,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 15,
  boxShadow:
    "0 5px 15px rgba(37,99,235,.15)",
};

const title = {
  margin: 0,
  fontSize:
    "clamp(27px,4vw,40px)",
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: "-0.5px",
};

const subTitle = {
  margin:
    "7px 0 0 0",
  fontSize:
    "clamp(14px,2vw,16px)",
  lineHeight: 1.5,
};

/* =====================================================
   DASHBOARD
===================================================== */

const cards = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(190px,1fr))",
  gap: 18,
  marginBottom: 25,
};

const dashboardCard = {
  background:
    "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "white",
  borderRadius: 18,
  padding: 20,
  minHeight: 145,
  boxSizing: "border-box",
  boxShadow:
    "0 10px 25px rgba(30,64,175,.18)",
};

const dashboardIcon = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background:
    "rgba(255,255,255,.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
};

const dashboardLabel = {
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.95,
};

const dashboardNumber = {
  fontSize:
    "clamp(25px,4vw,36px)",
  fontWeight: 800,
  marginTop: 5,
  wordBreak: "break-word",
};

const dashboardDescription = {
  fontSize: 12,
  opacity: 0.85,
  marginTop: 5,
};

/* =====================================================
   FORM CARD
===================================================== */

const formCard = {
  padding:
    "clamp(18px,3vw,28px)",
  borderRadius: 20,
  marginBottom: 25,
  width: "100%",
  boxSizing: "border-box",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 22,
};

const sectionIcon = {
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: 12,
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionTitle = {
  margin: 0,
  fontSize:
    "clamp(20px,3vw,25px)",
  fontWeight: 800,
};

const sectionDescription = {
  margin:
    "4px 0 0 0",
  fontSize: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 18,
};

const field = {
  width: "100%",
  minWidth: 0,
};

const fullWidthField = {
  width: "100%",
  minWidth: 0,
  gridColumn: "1 / -1",
};

const label = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 7,
};

const input = {
  width: "100%",
  padding: 13,
  borderRadius: 11,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const textarea = {
  width: "100%",
  padding: 13,
  borderRadius: 11,
  fontSize: 14,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
};

const button = {
  marginTop: 24,
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "#ffffff",
  border: "none",
  padding:
    "14px 24px",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 700,
  width: "100%",
  maxWidth: 280,
  boxShadow:
    "0 6px 15px rgba(15,23,42,.18)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

/* =====================================================
   TABLE
===================================================== */

const tableCard = {
  borderRadius: 20,
  overflow: "hidden",
  boxShadow:
    "0 8px 25px rgba(15,23,42,.08)",
  width: "100%",
  marginBottom: 25,
};

const tableHeader = {
  padding:
    "20px clamp(18px,3vw,25px)",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap",
};

const tableTitle = {
  margin: 0,
  fontSize:
    "clamp(20px,3vw,25px)",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  gap: 9,
};

const tableTitleIcon = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2563eb",
};

const tableDescription = {
  margin:
    "5px 0 0 0",
  fontSize: 14,
};

const recordCount = {
  padding:
    "8px 13px",
  borderRadius: 20,
  fontWeight: 700,
  fontSize: 13,
};

const refreshButton = {
  border: "none",
  padding:
    "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling:
    "touch",
};

const table = {
  width: "100%",
  minWidth: 1100,
  borderCollapse:
    "collapse",
};

const th = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "#ffffff",
  padding: 14,
  textAlign: "left",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const td = {
  padding: 13,
  borderBottom:
    "1px solid #e2e8f0",
  fontSize: 14,
  verticalAlign: "middle",
};

const emptyCell = {
  padding: 55,
  textAlign: "center",
  fontWeight: 600,
};

const emptyIcon = {
  width: 70,
  height: 70,
  margin:
    "0 auto 12px",
  borderRadius: 18,
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* =====================================================
   STATUS
===================================================== */

const statusContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minWidth: 120,
};

const badge = {
  color: "#ffffff",
  padding:
    "6px 12px",
  borderRadius: 20,
  fontWeight: 700,
  fontSize: 12,
  textAlign: "center",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const select = {
  width: "100%",
  padding: 8,
  borderRadius: 8,
  boxSizing: "border-box",
  fontSize: 12,
  outline: "none",
};

const actionButtons = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 150,
};

const editButton = {
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#ffffff",
  border: "none",
  padding:
    "8px 12px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const deleteButton = {
  background:
    "linear-gradient(135deg,#dc2626,#b91c1c)",
  color: "#ffffff",
  border: "none",
  padding:
    "8px 12px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

/* =====================================================
   MOBILE CARDS
===================================================== */

const mobileCard = {
  borderRadius: 17,
  padding: 17,
  boxSizing: "border-box",
  boxShadow:
    "0 5px 18px rgba(15,23,42,.06)",
};

const mobileCardHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 10,
};

const mobileCustomerIcon = {
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 12,
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileCustomerName = {
  fontSize: 16,
  fontWeight: 800,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const mobileRecordNumber = {
  fontSize: 11,
  marginTop: 2,
};

const mobileDate = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  marginTop: 13,
};

const mobileDetails = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",
  gap: 10,
  marginTop: 14,
};

const mobileDetail = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: 12,
  borderRadius: 12,
};

const mobileDetailLabel = {
  display: "block",
  fontSize: 11,
  color: "#64748b",
  marginBottom: 2,
};

const mobileInfoRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 9,
  marginTop: 14,
  fontSize: 13,
};

const mobileInfoLabel = {
  display: "block",
  fontSize: 11,
  color: "#64748b",
  marginBottom: 2,
};

const mobileInfoValue = {
  display: "block",
  lineHeight: 1.4,
  wordBreak: "break-word",
};

const mobileNotes = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: 11,
  borderRadius: 10,
  marginTop: 14,
  fontSize: 12,
  lineHeight: 1.5,
};

const mobileStatusSection = {
  marginTop: 15,
  paddingTop: 14,
  borderTop:
    "1px solid rgba(148,163,184,.2)",
};

const mobileStatusLabel = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 7,
};

const mobileSelect = {
  width: "100%",
  padding: 11,
  borderRadius: 10,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const mobileActions = {
  display: "flex",
  gap: 9,
  marginTop: 14,
};

const mobileEditButton = {
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#ffffff",
  border: "none",
  padding: 11,
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const mobileDeleteButton = {
  background:
    "linear-gradient(135deg,#dc2626,#b91c1c)",
  color: "#ffffff",
  border: "none",
  padding: 11,
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const mobileEmpty = {
  padding: 45,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  textAlign: "center",
};

/* =====================================================
   NOTIFICATION
===================================================== */

const notificationStyle = {
  position: "fixed",
  top: 20,
  right: 20,
  width:
    "min(380px,calc(100vw - 40px))",
  color: "#ffffff",
  padding: 16,
  borderRadius: 14,
  boxShadow:
    "0 15px 40px rgba(0,0,0,.25)",
  zIndex: 99999,
  fontWeight: 600,
  fontSize: 14,
  boxSizing: "border-box",
};

/* =====================================================
   MODALS
===================================================== */

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background:
    "rgba(15,23,42,.65)",
  backdropFilter:
    "blur(3px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 15,
  boxSizing: "border-box",
  zIndex: 99999,
  overflowY: "auto",
};

const editModal = {
  width: "700px",
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 20,
  padding:
    "clamp(18px,3vw,28px)",
  boxShadow:
    "0 25px 60px rgba(0,0,0,.35)",
  boxSizing: "border-box",
};

const modalHeader = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "flex-start",
  gap: 15,
  marginBottom: 20,
};

const modalTitle = {
  margin: 0,
  fontSize:
    "clamp(21px,4vw,27px)",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
};

const modalSubtitle = {
  margin:
    "5px 0 0 0",
  fontSize: 14,
};

const closeButton = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const modalGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 18,
};

const modalButtons = {
  display: "flex",
  justifyContent:
    "flex-end",
  gap: 10,
  marginTop: 25,
  flexWrap: "wrap",
};

const cancelButton = {
  border: "none",
  padding:
    "11px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const saveButton = {
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#ffffff",
  border: "none",
  padding:
    "11px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

const confirmModalBox = {
  width: "420px",
  maxWidth: "100%",
  borderRadius: 20,
  padding: 28,
  boxShadow:
    "0 25px 60px rgba(0,0,0,.35)",
  boxSizing: "border-box",
};

const confirmIcon = {
  width: 55,
  height: 55,
  borderRadius: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 15,
};

const confirmTitle = {
  margin: 0,
  fontSize: 23,
  fontWeight: 800,
};

const confirmMessage = {
  lineHeight: 1.6,
  marginTop: 12,
};

export default Deliveries;