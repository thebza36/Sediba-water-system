import { useEffect, useState } from "react";
import axios from "axios";

function Deliveries() {
  const token = localStorage.getItem("token");

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
  show: false,
  message: "",
  type: "success",
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
});

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
  ============================== */

  const loadDeliveries = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/deliveries/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeliveries(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ===============================
     CREATE DELIVERY
  ============================== */

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
        `${import.meta.env.VITE_API_URL}/deliveries`,
        {
          customerName: form.customerName,
          phone: form.phone,
          location: form.location,
          address: form.address,
          waterQuantity: Number(form.waterQuantity),
          deliveryCost: Number(form.deliveryCost),
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
      setLoading(false);
    } catch (err) {

      setLoading(false);
      console.log(err);

      if (err.response) {
        showNotification(
                    err.response.data.message,
                   "error"
                      );
      } else {
        showNotification(
                          "Failed to create delivery.",
                          "error"
                        );
      }
    }
  };

  /* ===============================
     CHANGE STATUS
  ============================== */
  const changeStatus = async (id, status) => {

  try {

    await axios.put(
      `${import.meta.env.VITE_API_URL}/deliveries/${id}/status`,
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
    customerName: delivery.customerName,
    phone: delivery.phone,
    location: delivery.location,
    address: delivery.address,
    waterQuantity: delivery.waterQuantity,
    deliveryCost: delivery.deliveryCost,
    notes: delivery.notes,
  });

};

/* ===============================
   CLOSE EDIT MODAL
=============================== */

const closeEdit = () => {

  setEditingDelivery(null);

};

/* ===============================
   DELETE CONFIRMATION
=============================== */

const askDelete = (delivery) => {

  setConfirmModal({

    show: true,

    title: "Delete Delivery",

    message:
      "Are you sure you want to delete this delivery?",

    action: () => deleteDelivery(delivery._id),

  });

};

/* ===============================
   STATUS CONFIRMATION
=============================== */

const askStatusChange = (id, status) => {

  setConfirmModal({

    show: true,

    title: "Update Status",

    message:
      `Change delivery status to "${status}"?`,

    action: () => changeStatus(id, status),

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

  });

};

/* ===============================
   UPDATE DELIVERY
=============================== */

const updateDelivery = async () => {

  try {

    setLoading(true);

    await axios.put(

      `${import.meta.env.VITE_API_URL}/deliveries/${editingDelivery._id}`,

      {

        customerName: editForm.customerName,
        phone: editForm.phone,
        location: editForm.location,
        address: editForm.address,
        waterQuantity: Number(editForm.waterQuantity),
        deliveryCost: Number(editForm.deliveryCost),
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

const deleteDelivery = async (id) => {

  try {

    await axios.delete(

      `${import.meta.env.VITE_API_URL}/deliveries/${id}`,

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
      "Failed to delete delivery.",
      "error"
    );

  }

};
  

  return (
    <div style={page}>

      {notification.show && (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      background:
        notification.type === "success"
          ? "#16a34a"
          : "#dc2626",
      color: "white",
      padding: "14px 22px",
      borderRadius: 10,
      boxShadow: "0 8px 20px rgba(0,0,0,.25)",
      zIndex: 9999,
      fontWeight: "bold",
      animation: "fadeIn .3s",
    }}
  >
    {notification.message}
  </div>
)}

      {/* HEADER */}

      <div style={header}>
        <h1 style={{ margin: 0 }}>
          🚚 Water Deliveries
        </h1>

        <p style={subTitle}>
          Record and monitor water deliveries.
        </p>
      </div>

      {/* DASHBOARD */}

      <div style={cards}>

        <DashboardCard
          title="Total Deliveries"
          value={deliveries.length}
        />

        <DashboardCard
          title="Pending"
          value={
            deliveries.filter(
              (d) => d.status === "Pending"
            ).length
          }
        />

        <DashboardCard
          title="On Route"
          value={
            deliveries.filter(
              (d) => d.status === "On Route"
            ).length
          }
        />

        <DashboardCard
          title="Delivered"
          value={
            deliveries.filter(
              (d) => d.status === "Delivered"
            ).length
          }
        />

      </div>

      {/* CREATE DELIVERY */}

      <div style={formCard}>

        <h2>Create Delivery</h2>

        <div style={grid}>

          <div>
            <label>Customer Name</label>

            <input
              style={input}
              placeholder="Enter customer name"
              value={form.customerName}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Phone Number</label>

            <input
              style={input}
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Location</label>

            <input
              style={input}
              placeholder="Enter location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Address</label>

            <input
              style={input}
              placeholder="Enter address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Water Quantity (L)</label>

            <input
              style={input}
              type="number"
              value={form.waterQuantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  waterQuantity: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Delivery Cost (R)</label>

            <input
              style={input}
              type="number"
              value={form.deliveryCost}
              onChange={(e) =>
                setForm({
                  ...form,
                  deliveryCost: e.target.value,
                })
              }
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Notes</label>

            <textarea
              rows="4"
              style={textarea}
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
            />
          </div>

        </div>

        <button
  style={{
    ...button,
    opacity: loading ? 0.7 : 1,
    cursor: loading ? "not-allowed" : "pointer",
  }}
  disabled={loading}
  onClick={createDelivery}
>
  {loading ? "Creating Delivery..." : "🚚 Create Delivery"}
</button>

      </div>
    {/* ===============================
          DELIVERIES TABLE
      =============================== */}

      <div style={tableCard}>

        <table style={table}>

          <thead>

            <tr>

              <th>#</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Address</th>
              <th>Water</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {deliveries.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    padding: 30,
                  }}
                >
                  No deliveries found.
                </td>

              </tr>

            ) : (

              deliveries.map((delivery, index) => (

                <tr key={delivery._id}>

                  <td>{index + 1}</td>

                  <td>{delivery.customerName}</td>

                  <td>{delivery.phone}</td>

                  <td>{delivery.location}</td>

                  <td>{delivery.address}</td>

                  <td>{delivery.waterQuantity} L</td>

                  <td>
                    R {Number(delivery.deliveryCost).toFixed(2)}
                  </td>

                  <td>

                    <span
                      style={{
                        ...badge,

                        background:
                          delivery.status === "Delivered"
                            ? "#16a34a"
                            : delivery.status === "On Route"
                            ? "#2563eb"
                            : delivery.status === "Accepted"
                            ? "#9333ea"
                            : delivery.status === "Cancelled"
                            ? "#dc2626"
                            : "#f59e0b",
                      }}
                    >
                      {delivery.status}
                    </span>

                  </td>

                 <td>

                  <select
                    style={select}
                    value={delivery.status}
                      onChange={(e) =>
                        askStatusChange(
                          delivery._id,
                          e.target.value
                        )
                      }
                    >

                    <option>Pending</option>
                    <option>Accepted</option>
                    <option>On Route</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>

                  </select>

                </td>

                <td>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >

                    <button
                      style={editButton}
                      onClick={() => openEdit(delivery)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={deleteButton}
                      onClick={() => askDelete(delivery)}
                    >
                      🗑 Delete
                    </button>

                  </div>

                </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>




      {/* =====================================
    EDIT DELIVERY MODAL
===================================== */}

{editingDelivery && (

<div style={modalOverlay}>

  <div style={modal}>

    <h2>Edit Delivery</h2>

    <div style={grid}>

      <div>
        <label>Customer Name</label>

        <input
          style={input}
          value={editForm.customerName}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              customerName:e.target.value,
            })
          }
        />
      </div>

      <div>
        <label>Phone Number</label>

        <input
          style={input}
          value={editForm.phone}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              phone:e.target.value,
            })
          }
        />
      </div>

      <div>
        <label>Location</label>

        <input
          style={input}
          value={editForm.location}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              location:e.target.value,
            })
          }
        />
      </div>

      <div>
        <label>Address</label>

        <input
          style={input}
          value={editForm.address}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              address:e.target.value,
            })
          }
        />
      </div>

      <div>
        <label>Water Quantity (L)</label>

        <input
          type="number"
          style={input}
          value={editForm.waterQuantity}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              waterQuantity:e.target.value,
            })
          }
        />
      </div>

      <div>
        <label>Delivery Cost (R)</label>

        <input
          type="number"
          style={input}
          value={editForm.deliveryCost}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              deliveryCost:e.target.value,
            })
          }
        />
      </div>

      <div style={{gridColumn:"1 / -1"}}>

        <label>Notes</label>

        <textarea
          rows={4}
          style={textarea}
          value={editForm.notes}
          onChange={(e)=>
            setEditForm({
              ...editForm,
              notes:e.target.value,
            })
          }
        />

      </div>

    </div>

    <div
      style={{
        display:"flex",
        justifyContent:"flex-end",
        gap:10,
        marginTop:20,
      }}
    >

      <button
        style={cancelButton}
        onClick={closeEdit}
      >
        Cancel
      </button>

      <button
        style={saveButton}
        onClick={updateDelivery}
      >
        Save Changes
      </button>

    </div>

  </div>

</div>

)}

{/* =====================================
    CONFIRMATION MODAL
===================================== */}

{confirmModal.show && (

<div style={modalOverlay}>

  <div style={confirmModalBox}>

    <h2>{confirmModal.title}</h2>

    <p
      style={{
        marginTop: 15,
        color: "#555",
      }}
    >
      {confirmModal.message}
    </p>

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 30,
      }}
    >

      <button
        style={cancelButton}
        onClick={closeConfirm}
      >
        Cancel
      </button>

      <button
        style={deleteButton}
        onClick={confirmModal.action}
      >
        Confirm
      </button>

    </div>

  </div>

</div>

)}

    </div>    

  );
}

/* ===============================
   DASHBOARD CARD
=============================== */

function DashboardCard({ title, value }) {
  return (
    <div style={card}>

      <div
        style={{
          fontSize: 15,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: "bold",
          marginTop: 15,
        }}
      >
        {value}
      </div>

    </div>
  );
}
/* ===============================
   STYLES
=============================== */

const page = {
  padding: 25,
  background: "#f4f7fb",
  minHeight: "100vh",
};

const header = {
  background: "linear-gradient(135deg,#0f172a,#2563eb)",
  color: "#fff",
  padding: 30,
  borderRadius: 15,
  marginBottom: 25,
  boxShadow: "0 8px 25px rgba(0,0,0,.15)",
};

const subTitle = {
  marginTop: 10,
  opacity: 0.9,
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 25,
};

const card = {
  background: "#fff",
  borderRadius: 15,
  padding: 25,
  boxShadow: "0 6px 20px rgba(0,0,0,.08)",
  textAlign: "center",
};

const formCard = {
  background: "#fff",
  padding: 25,
  borderRadius: 15,
  boxShadow: "0 6px 20px rgba(0,0,0,.08)",
  marginBottom: 25,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: 20,
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginTop: 6,
  outline: "none",
  boxSizing: "border-box",
};

const textarea = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginTop: 6,
  resize: "vertical",
  boxSizing: "border-box",
};

const button = {
  marginTop: 25,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "14px 24px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 15,
  fontWeight: "bold",
};

const tableCard = {
  background: "#fff",
  borderRadius: 15,
  overflowX: "auto",
  boxShadow: "0 6px 20px rgba(0,0,0,.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const badge = {
  color: "#fff",
  padding: "6px 14px",
  borderRadius: 20,
  fontWeight: "bold",
  fontSize: 13,
};

const select = {
  padding: 8,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  cursor: "pointer",
};

const editButton = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const deleteButton = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

/* ===============================
   MODALS
=============================== */

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const modal = {
  background: "#fff",
  width: "650px",
  maxWidth: "95%",
  borderRadius: 15,
  padding: 25,
  boxShadow: "0 20px 40px rgba(0,0,0,.25)",
};

const modalGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: 18,
  marginTop: 20,
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 25,
};

const cancelButton = {
  background: "#6b7280",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const saveButton = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const confirmModalBox = {
  background: "#fff",
  width: "420px",
  maxWidth: "90%",
  borderRadius: 15,
  padding: 25,
  boxShadow: "0 20px 40px rgba(0,0,0,.25)",
};

export default Deliveries;