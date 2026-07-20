import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/water-sales";

export default function AdminSalesHistory() {

  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem("token");

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(amount || 0);

  const loadSales = async () => {
    try {
      const res = await fetch(`${API}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      console.log("SALES:", data);

      setSales(data);
      setFiltered(data);

    } catch {
      alert("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const deleteSale = async () => {
    await fetch(`${API}/${deleting}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setDeleting(null);
    loadSales();
  };

  const updateSale = async () => {
    await fetch(`${API}/${editing._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editing)
    });

    setEditing(null);
    loadSales();
  };

  useEffect(() => {

    let result = [...sales];

    if (search) {
      result = result.filter(s =>
        s.employee?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (date) {
      result = result.filter(s =>
        new Date(s.date).toLocaleDateString() ===
        new Date(date).toLocaleDateString()
      );
    }

    setFiltered(result);

  }, [search, date, sales]);

  const totalRevenue = filtered.reduce(
    (sum, s) => sum + Number(s.revenue || 0), 0
  );

  if (loading) return <div style={center}>Loading...</div>;

  return (

    <div style={page}>

      <h1 style={title}>📜 Sales History</h1>

      <div style={summaryCard}>
        <h3>Total Revenue</h3>
        <p style={totalText}>{formatMoney(totalRevenue)}</p>
      </div>

      <div style={card}>
        <div style={filterRow}>

          <input
            style={input}
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            style={input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button style={refreshBtn} onClick={loadSales}>
            Refresh
          </button>

        </div>
      </div>

      <div style={card}>

        <table style={table}>

          <thead style={thead}>
            <tr>
              <th style={th}>Employee</th>
              <th style={th}>Meter</th>
              <th style={th}>Water</th>
              <th style={th}>Revenue</th>
              <th style={th}>Date</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((s) => {

              // ✅ FIX METER
              const meterDisplay =
                s.meter?.meterNumber ||
                (s.items?.length ? "POS" : "N/A");

              // ✅ FIX LITERS
              let liters = 0;

              if (s.totalSold > 0) {
                liters = s.totalSold;
              } else if (s.closingReading > s.openingReading) {
                liters = s.closingReading - s.openingReading;
              } else if (s.items?.length > 0) {
                liters = s.items.reduce(
                  (sum, i) => sum + (i.quantity || 0),
                  0
                );
              }

              return (
                <tr key={s._id}>

                  <td style={td}>{s.employee?.name || "Unknown"}</td>

                  <td style={td}>{meterDisplay}</td>

                  <td style={td}>
                    {liters > 0 ? `${liters} L` : "0 L"}
                  </td>

                  <td style={td}>{formatMoney(s.revenue)}</td>

                  <td style={td}>
                    {new Date(s.date).toLocaleDateString()}
                  </td>

                  <td style={td}>

                    <button
                      style={editBtn}
                      onClick={() => setEditing(s)}
                    >
                      Edit
                    </button>

                    <button
                      style={deleteBtn}
                      onClick={() => setDeleting(s._id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      {editing && (
        <div style={modal}>
          <div style={modalBox}>
            <h3 style={{ marginBottom: 10 }}>✏️ Edit Sale</h3>

            <input
              style={input}
              value={editing.totalSold}
              onChange={(e) =>
                setEditing({ ...editing, totalSold: e.target.value })
              }
            />

            <input
              style={input}
              value={editing.revenue}
              onChange={(e) =>
                setEditing({ ...editing, revenue: e.target.value })
              }
            />

            <div style={modalActions}>
              <button style={saveBtn} onClick={updateSale}>
                Save Changes
              </button>

              <button style={cancelBtn} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {deleting && (
        <div style={modal}>
          <div style={modalBox}>
            <h3>⚠️ Confirm Delete</h3>
            <p style={{ opacity: 0.7 }}>
              Are you sure you want to delete this sale?
            </p>

            <div style={modalActions}>
              <button style={deleteConfirmBtn} onClick={deleteSale}>
                Yes, Delete
              </button>

              <button style={cancelBtn} onClick={() => setDeleting(null)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* STYLES */

const page = { width: "100%" };
const title = { fontSize: 26, fontWeight: 700, marginBottom: 20 };

const summaryCard = {
  background: "linear-gradient(135deg,#facc15,#eab308)",
  padding: 20,
  borderRadius: 16,
  marginBottom: 20
};

const totalText = { fontSize: 30, fontWeight: 700 };

const card = {
  background: "white",
  padding: 25,
  borderRadius: 16,
  marginBottom: 20
};

const filterRow = { display: "flex", gap: 10 };

const input = {
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 8
};

const refreshBtn = {
  background: "#eab308",
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const table = { width: "100%", borderCollapse: "collapse" };
const thead = { background: "#facc15" };
const th = { padding: 12, textAlign: "left" };
const td = { padding: 12, borderTop: "1px solid #eee" };

const editBtn = {
  background: "#2563eb",
  color: "white",
  marginRight: 6,
  padding: "6px 12px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const deleteBtn = {
  background: "#dc2626",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer"
};

const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalBox = {
  background: "white",
  padding: 25,
  borderRadius: 16,
  width: 320,
  display: "flex",
  flexDirection: "column",
  gap: 15,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
};

const modalActions = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10
};

const saveBtn = {
  background: "#16a34a",
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer"
};

const deleteConfirmBtn = {
  background: "#dc2626",
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer"
};

const cancelBtn = {
  background: "#6b7280",
  color: "white",
  padding: 10,
  border: "none",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer"
};

const center = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh"
};