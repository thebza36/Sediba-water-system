import { useEffect, useState } from "react";
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
} from "lucide-react";

function Deliveries() {
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL;

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     NOTIFICATION
  =============================== */

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /* ===============================
     CREATE FORM
  =============================== */

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    location: "",
    address: "",
    waterQuantity: "",
    deliveryCost: "",
    notes: "",
  });

  /* ===============================
     EDITING
  =============================== */

  const [editingDelivery, setEditingDelivery] = useState(null);

  const [editForm, setEditForm] = useState({
    customerName: "",
    phone: "",
    location: "",
    address: "",
    waterQuantity: "",
    deliveryCost: "",
    notes: "",
  });

  /* ===============================
     CONFIRM MODAL
  =============================== */

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    action: null,
    danger: false,
  });

  /* ===============================
     SHOW NOTIFICATION
  =============================== */

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

  /* ===============================
     LOAD PAGE
  =============================== */

  useEffect(() => {
    loadDeliveries();
  }, []);

  /* ===============================
     LOAD MY DELIVERIES
  =============================== */

  const loadDeliveries = async () => {
    try {
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
    }
  };

  /* ===============================
     CREATE DELIVERY
  =============================== */

  const createDelivery = async () => {
    if (
      !form.customerName ||
      !form.location ||
      !form.waterQuantity
    ) {
      showNotification(
        "Customer name, location and water quantity are required.",
        "error"
      );

      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/deliveries`,
        {
          customerName: form.customerName,
          phone: form.phone,
          location: form.location,
          address: form.address,
          waterQuantity: Number(
            form.waterQuantity
          ),
          deliveryCost: Number(
            form.deliveryCost || 0
          ),
          notes: form.notes,
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

  /* ===============================
     CHANGE STATUS
  =============================== */

  const changeStatus = async (
    id,
    status
  ) => {
    try {
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
        "Failed to update delivery status.",
        "error"
      );
    }
  };

  /* ===============================
     OPEN EDIT MODAL
  =============================== */

  const openEdit = (delivery) => {
    setEditingDelivery(delivery);

    setEditForm({
      customerName:
        delivery.customerName || "",
      phone: delivery.phone || "",
      location:
        delivery.location || "",
      address:
        delivery.address || "",
      waterQuantity:
        delivery.waterQuantity ?? "",
      deliveryCost:
        delivery.deliveryCost ?? "",
      notes: delivery.notes || "",
    });
  };

  /* ===============================
     CLOSE EDIT MODAL
  =============================== */

  const closeEdit = () => {
    setEditingDelivery(null);
  };

  /* ===============================
     ASK DELETE
  =============================== */

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

  /* ===============================
     ASK STATUS CHANGE
  =============================== */

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

  /* ===============================
     CLOSE CONFIRM MODAL
  =============================== */

  const closeConfirm = () => {
    setConfirmModal({
      show: false,
      title: "",
      message: "",
      action: null,
      danger: false,
    });
  };

  /* ===============================
     UPDATE DELIVERY
  =============================== */

  const updateDelivery = async () => {
    if (!editingDelivery) {
      return;
    }

    if (
      !editForm.customerName ||
      !editForm.location ||
      !editForm.waterQuantity
    ) {
      showNotification(
        "Customer name, location and water quantity are required.",
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
            editForm.customerName,
          phone: editForm.phone,
          location:
            editForm.location,
          address:
            editForm.address,
          waterQuantity: Number(
            editForm.waterQuantity
          ),
          deliveryCost: Number(
            editForm.deliveryCost || 0
          ),
          notes: editForm.notes,
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

  /* ===============================
     DELETE DELIVERY
  =============================== */

  const deleteDelivery = async (
    id
  ) => {
    try {
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
    }
  };

  /* ===============================
     STATUS COUNTS
  =============================== */

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

  /* ===============================
     RETURN
  =============================== */

  return (
    <div style={page}>

      {/* ===============================
          NOTIFICATION
      =============================== */}

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
              fontSize: 20,
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

      {/* ===============================
          PAGE HEADER
      =============================== */}

      <div style={pageHeader}>

        <div style={titleIcon}>
          <Truck
            size={30}
            strokeWidth={2.2}
          />
        </div>

        <div>
          <h1 style={title}>
            Water Deliveries
          </h1>

          <p style={subTitle}>
            Record, manage and monitor your
            water deliveries.
          </p>
        </div>

      </div>

      {/* ===============================
          DASHBOARD CARDS
      =============================== */}

      <div style={cards}>

        <DashboardCard
          icon={Truck}
          title="Total Deliveries"
          value={totalDeliveries}
          description="All deliveries"
        />

        <DashboardCard
          icon={Clock}
          title="Pending"
          value={pendingDeliveries}
          description="Awaiting action"
        />

        <DashboardCard
          icon={MapPin}
          title="On Route"
          value={onRouteDeliveries}
          description="Currently on route"
        />

        <DashboardCard
          icon={CheckCircle}
          title="Delivered"
          value={deliveredDeliveries}
          description="Successfully delivered"
        />

      </div>

      {/* ===============================
          CREATE DELIVERY
      =============================== */}

      <div style={formCard}>

        <div style={sectionHeader}>

          <div style={sectionIcon}>
            <Plus
              size={21}
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h2 style={sectionTitle}>
              Create Delivery
            </h2>

            <p style={sectionDescription}>
              Enter the customer's delivery
              information below.
            </p>
          </div>

        </div>

        <div style={grid}>

          <div style={field}>
            <label style={label}>
              Customer Name
            </label>

            <input
              style={input}
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

          <div style={field}>
            <label style={label}>
              Phone Number
            </label>

            <input
              style={input}
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

          <div style={field}>
            <label style={label}>
              Location
            </label>

            <input
              style={input}
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

          <div style={field}>
            <label style={label}>
              Address
            </label>

            <input
              style={input}
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

          <div style={field}>
            <label style={label}>
              Water Quantity (L)
            </label>

            <input
              style={input}
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

          <div style={field}>
            <label style={label}>
              Delivery Cost (R)
            </label>

            <input
              style={input}
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

          <div
            style={
              fullWidthField
            }
          >
            <label style={label}>
              Notes
            </label>

            <textarea
              rows="4"
              style={textarea}
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

      {/* ===============================
          DELIVERIES TABLE
      =============================== */}

      <div style={tableCard}>

        <div style={tableHeader}>

          <div>
            <h2 style={tableTitle}>
              <span
                style={tableTitleIcon}
              >
                <FileText size={21} />
              </span>

              My Deliveries
            </h2>

            <p style={tableDescription}>
              View and manage your delivery
              records.
            </p>
          </div>

          <div style={recordCount}>
            {deliveries.length}{" "}
            {deliveries.length === 1
              ? "Delivery"
              : "Deliveries"}
          </div>

        </div>

        <div style={tableWrapper}>

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

              {deliveries.length ===
              0 ? (
                <tr>

                  <td
                    colSpan="9"
                    style={
                      emptyCell
                    }
                  >
                    <div
                      style={
                        emptyIcon
                      }
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
                      style={
                        index % 2 === 0
                          ? rowEven
                          : rowOdd
                      }
                    >

                      <td style={td}>
                        {index + 1}
                      </td>

                      <td
                        style={{
                          ...td,
                          fontWeight: 700,
                          color:
                            "#0f172a",
                        }}
                      >
                        {
                          delivery.customerName
                        }
                      </td>

                      <td style={td}>
                        {delivery.phone ||
                          "-"}
                      </td>

                      <td style={td}>
                        {
                          delivery.location
                        }
                      </td>

                      <td style={td}>
                        {delivery.address ||
                          "-"}
                      </td>

                      <td
                        style={{
                          ...td,
                          fontWeight: 700,
                        }}
                      >
                        {
                          delivery.waterQuantity
                        }{" "}
                        L
                      </td>

                      <td
                        style={{
                          ...td,
                          fontWeight: 700,
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
                            style={
                              select
                            }
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

      </div>

      {/* ===============================
          EDIT DELIVERY MODAL
      =============================== */}

      {editingDelivery && (
        <div
          style={modalOverlay}
        >

          <div
            style={editModal}
          >

            <div
              style={
                modalHeader
              }
            >

              <div>
                <h2
                  style={
                    modalTitle
                  }
                >
                  <Pencil
                    size={23}
                    style={{
                      verticalAlign:
                        "middle",
                      marginRight: 8,
                    }}
                  />

                  Edit Delivery
                </h2>

                <p
                  style={
                    modalSubtitle
                  }
                >
                  Update the delivery
                  information.
                </p>
              </div>

              <button
                style={
                  closeButton
                }
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

              <div style={field}>
                <label
                  style={label}
                >
                  Customer Name
                </label>

                <input
                  style={input}
                  value={
                    editForm.customerName
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      customerName:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div style={field}>
                <label
                  style={label}
                >
                  Phone Number
                </label>

                <input
                  style={input}
                  type="tel"
                  value={
                    editForm.phone
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      phone:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div style={field}>
                <label
                  style={label}
                >
                  Location
                </label>

                <input
                  style={input}
                  value={
                    editForm.location
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      location:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div style={field}>
                <label
                  style={label}
                >
                  Address
                </label>

                <input
                  style={input}
                  value={
                    editForm.address
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      address:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div style={field}>
                <label
                  style={label}
                >
                  Water Quantity (L)
                </label>

                <input
                  style={input}
                  type="number"
                  min="0"
                  value={
                    editForm.waterQuantity
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      waterQuantity:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div style={field}>
                <label
                  style={label}
                >
                  Delivery Cost (R)
                </label>

                <input
                  style={input}
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editForm.deliveryCost
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      deliveryCost:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div
                style={
                  fullWidthField
                }
              >
                <label
                  style={label}
                >
                  Notes
                </label>

                <textarea
                  rows="4"
                  style={
                    textarea
                  }
                  value={
                    editForm.notes
                  }
                  onChange={(
                    e
                  ) =>
                    setEditForm({
                      ...editForm,
                      notes:
                        e.target
                          .value,
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
                style={
                  cancelButton
                }
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

      {/* ===============================
          CONFIRMATION MODAL
      =============================== */}

      {confirmModal.show && (
        <div
          style={
            modalOverlay
          }
        >

          <div
            style={
              confirmModalBox
            }
          >

            <div
              style={{
                ...confirmIcon,
                background:
                  confirmModal.danger
                    ? "#fee2e2"
                    : "#fef3c7",
                color:
                  confirmModal.danger
                    ? "#dc2626"
                    : "#d97706",
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
              style={
                confirmTitle
              }
            >
              {
                confirmModal.title
              }
            </h2>

            <p
              style={
                confirmMessage
              }
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
                style={
                  cancelButton
                }
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
                onClick={
                  confirmModal.action
                }
              >
                <CheckCircle
                  size={16}
                />

                Confirm
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===============================
          ICON ANIMATION
      =============================== */}

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
}) {
  return (
    <div style={dashboardCard}>

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
      <CheckCircle
        size={14}
        strokeWidth={2.5}
      />
    );
  }

  if (status === "Cancelled") {
    return (
      <X
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
   PAGE
===================================================== */

const page = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding:
    "clamp(15px,3vw,30px)",
  boxSizing: "border-box",
  background: "#f8fafc",
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
  background: "#dbeafe",
  color: "#2563eb",
  borderRadius: 15,
  boxShadow:
    "0 5px 15px rgba(37,99,235,.15)",
};

const title = {
  margin: 0,
  fontSize:
    "clamp(27px,4vw,40px)",
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1.15,
  letterSpacing: "-0.5px",
};

const subTitle = {
  margin:
    "7px 0 0 0",
  color: "#64748b",
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
    "repeat(auto-fit,minmax(210px,1fr))",
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
    "clamp(28px,4vw,36px)",
  fontWeight: 800,
  marginTop: 5,
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
  background: "#ffffff",
  padding:
    "clamp(18px,3vw,28px)",
  borderRadius: 20,
  boxShadow:
    "0 8px 25px rgba(15,23,42,.08)",
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
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize:
    "clamp(20px,3vw,25px)",
  fontWeight: 800,
};

const sectionDescription = {
  margin:
    "4px 0 0 0",
  color: "#64748b",
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
  color: "#334155",
  marginBottom: 7,
};

const input = {
  width: "100%",
  padding: 13,
  borderRadius: 11,
  border:
    "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const textarea = {
  width: "100%",
  padding: 13,
  borderRadius: 11,
  border:
    "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
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
  background: "#ffffff",
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
  borderBottom:
    "1px solid #e2e8f0",
};

const tableTitle = {
  margin: 0,
  color: "#0f172a",
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
  color: "#64748b",
  fontSize: 14,
};

const recordCount = {
  background: "#dbeafe",
  color: "#1e3a8a",
  padding:
    "8px 13px",
  borderRadius: 20,
  fontWeight: 700,
  fontSize: 13,
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling:
    "touch",
};

const table = {
  width: "100%",
  minWidth: 1050,
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
  color: "#334155",
  fontSize: 14,
  verticalAlign: "middle",
};

const rowEven = {
  background: "#ffffff",
};

const rowOdd = {
  background: "#f8fafc",
};

const emptyCell = {
  padding: 50,
  textAlign: "center",
  color: "#64748b",
  fontWeight: 600,
};

const emptyIcon = {
  width: 70,
  height: 70,
  margin:
    "0 auto 12px",
  borderRadius: 18,
  background: "#eff6ff",
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
  border:
    "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
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
    "rgba(15,23,42,.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 15,
  boxSizing: "border-box",
  zIndex: 99999,
  overflowY: "auto",
};

const editModal = {
  background: "#ffffff",
  width: "700px",
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 20,
  padding:
    "clamp(18px,3vw,28px)",
  boxShadow:
    "0 25px 60px rgba(0,0,0,.3)",
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
  color: "#0f172a",
  fontSize:
    "clamp(21px,4vw,27px)",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
};

const modalSubtitle = {
  margin:
    "5px 0 0 0",
  color: "#64748b",
  fontSize: 14,
};

const closeButton = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: "none",
  background: "#f1f5f9",
  color: "#334155",
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
  background: "#e2e8f0",
  color: "#334155",
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
  background: "#ffffff",
  width: "420px",
  maxWidth: "100%",
  borderRadius: 20,
  padding: 28,
  boxShadow:
    "0 25px 60px rgba(0,0,0,.3)",
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
  color: "#0f172a",
  fontSize: 23,
  fontWeight: 800,
};

const confirmMessage = {
  color: "#64748b",
  lineHeight: 1.6,
  marginTop: 12,
};

export default Deliveries;