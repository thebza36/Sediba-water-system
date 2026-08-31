import React, {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import { ThemeContext } from "../context/ThemeContext";
import {
  Users,
  Search,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/clients`;

export default function Clients() {
  const { theme } = useContext(ThemeContext);

  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    type: "individual",
  });

  const nameRef = useRef(null);

  // MODALS
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showModal && nameRef.current) {
      nameRef.current.focus();
    }
  }, [showModal]);

  const loadClients = async () => {
    try {
      setLoading(true);

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const arr = Array.isArray(data) ? data : [];

      setClients(arr);
      setFiltered(arr);
    } catch {
      setMsg("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      clients.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.location?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      )
    );
  }, [search, clients]);

  const validate = () => {
    if (!form.name) {
      setError("Name is required");
      return false;
    }

    if (!form.location) {
      setError("Location is required");
      return false;
    }

    if (form.phone) {
      const saRegex = /^(?:\+27|0)[6-8][0-9]{8}$/;

      if (!saRegex.test(form.phone)) {
        setError("Invalid South African phone number");
        return false;
      }
    }

    return true;
  };

  const saveClient = async () => {
    if (!validate()) return;

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API}/${editing}` : API;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      setShowSuccess(true);
      setShowModal(false);
      setEditing(null);

      setForm({
        name: "",
        location: "",
        phone: "",
        type: "individual",
      });

      loadClients();
    } catch {
      setMsg("Save failed");
    }
  };

  const confirmSave = () => {
    setShowSaveConfirm(false);
    saveClient();
  };

  const deleteClient = async (id) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMsg("Client deleted");
    setShowDeleteModal(false);
    setDeleteId(null);

    loadClients();
  };

  const startEdit = (c) => {
    setEditing(c._id);

    setForm({
      name: c.name || "",
      location: c.location || "",
      phone: c.phone || "",
      type: c.type || "individual",
    });

    setShowModal(true);
  };

  const totalClients = clients.length;

  const totalWater = clients.reduce(
    (t, c) => t + (c.totalWater || 0),
    0
  );

  const totalRevenue = clients.reduce(
    (t, c) => t + (c.totalRevenue || 0),
    0
  );

  const totalDebt = clients.reduce(
    (t, c) => t + (c.debt || 0),
    0
  );

  const currency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n || 0);

  if (loading) {
    return (
      <div style={loadingStyle(theme)}>
        Loading clients...
      </div>
    );
  }

  return (
    <div style={page(theme)}>

      {/* HEADER */}

      <div style={header}>
        <h1
          style={{
            ...pageTitle(theme),
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Users size={32} strokeWidth={2.2} />
          Clients
        </h1>

        <button
          style={primaryBtn(theme)}
          onClick={() => {
            setEditing(null);

            setForm({
              name: "",
              location: "",
              phone: "",
              type: "individual",
            });

            setShowModal(true);
          }}
        >
          + Add Client
        </button>
      </div>

      {/* MESSAGE */}

      {msg && (
        <div style={msgBox(theme)}>
          {msg}
        </div>
      )}

      {/* STATS */}

      <div style={statsGrid}>

        <Stat
          title="Clients"
          value={totalClients}
          theme={theme}
        />

        <Stat
          title="Water Sold"
          value={`${totalWater} L`}
          theme={theme}
        />

        <Stat
          title="Revenue"
          value={currency(totalRevenue)}
          theme={theme}
        />

        <Stat
          title="Debt"
          value={currency(totalDebt)}
          theme={theme}
        />

      </div>

      {/* SEARCH */}

      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <Search
          size={20}
          strokeWidth={2}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: theme.textSecondary || theme.text,
            pointerEvents: "none",
          }}
        />

        <input
          style={{
            ...searchBox(theme),
            paddingLeft: 44,
          }}
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CLIENT TABLE */}

      <div style={card(theme)}>

        {filtered.length === 0 ? (
          <Empty theme={theme} />
        ) : (
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >

            <table style={table}>

              <thead style={thead(theme)}>
                <tr>

                  <th style={th(theme)}>
                    Name
                  </th>

                  <th style={th(theme)}>
                    Location
                  </th>

                  <th style={th(theme)}>
                    Phone
                  </th>

                  <th style={th(theme)}>
                    Type
                  </th>

                  <th style={th(theme)}>
                    Water
                  </th>

                  <th style={th(theme)}>
                    Revenue
                  </th>

                  <th style={th(theme)}>
                    Debt
                  </th>

                  <th style={th(theme)}>
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filtered.map((c, i) => (

                  <tr
                    key={c._id}
                    style={
                      i % 2
                        ? rowAlt(theme)
                        : row(theme)
                    }
                  >

                    <td style={td(theme)}>
                      {c.name}
                    </td>

                    <td style={td(theme)}>
                      {c.location}
                    </td>

                    <td style={td(theme)}>
                      {c.phone || "—"}
                    </td>

                    <td style={td(theme)}>
                      <Badge
                        type={c.type}
                        theme={theme}
                      />
                    </td>

                    <td style={td(theme)}>
                      {c.totalWater || 0} L
                    </td>

                    <td style={td(theme)}>
                      {currency(c.totalRevenue)}
                    </td>

                    <td style={td(theme)}>
                      {currency(c.debt)}
                    </td>

                    <td
                      style={{
                        ...td(theme),
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >

                      <button
                        style={smallBtn(theme)}
                        onClick={() =>
                          startEdit(c)
                        }
                      >
                        Edit
                      </button>

                      <button
                        style={dangerBtn}
                        onClick={() => {
                          setDeleteId(c._id);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <Modal
          theme={theme}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        >

          <h3 style={modalHeading(theme)}>
            {editing
              ? "Update Client"
              : "Add Client"}
          </h3>

          <input
            ref={nameRef}
            style={input(theme)}
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            style={input(theme)}
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value,
              })
            }
          />

          <input
            style={input(theme)}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <select
            style={input(theme)}
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
          >

            <option value="individual">
              Individual
            </option>

            <option value="business">
              Business
            </option>

          </select>

          <button
            style={primaryBtn(theme)}
            onClick={() =>
              setShowSaveConfirm(true)
            }
          >
            {editing
              ? "Update Client"
              : "Create Client"}
          </button>

        </Modal>
      )}

      {/* SAVE CONFIRMATION */}

      {showSaveConfirm && (
        <Modal
          theme={theme}
          onClose={() =>
            setShowSaveConfirm(false)
          }
        >

          <h3
            style={{
              ...modalHeading(theme),
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Save size={22} strokeWidth={2.2} />
            Confirm
          </h3>

          <p style={modalText(theme)}>
            Save this client?
          </p>

          <button
            style={primaryBtn(theme)}
            onClick={confirmSave}
          >
            Yes
          </button>

        </Modal>
      )}

      {/* DELETE CONFIRMATION */}

      {showDeleteModal && (
        <Modal
          theme={theme}
          onClose={() =>
            setShowDeleteModal(false)
          }
        >

          <h3
            style={{
              ...modalHeading(theme),
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#dc2626",
            }}
          >
            <AlertTriangle size={22} strokeWidth={2.2} />
            Delete
          </h3>

          <p style={modalText(theme)}>
            Delete this client?
          </p>

          <button
            style={dangerBtn}
            onClick={() =>
              deleteClient(deleteId)
            }
          >
            Delete
          </button>

        </Modal>
      )}

      {/* SUCCESS */}

      {showSuccess && (
        <Modal
          theme={theme}
          onClose={() =>
            setShowSuccess(false)
          }
        >

          <h3
            style={{
              color: "#16a34a",
              marginTop: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle size={22} strokeWidth={2.2} />
            Success
          </h3>

          <p style={modalText(theme)}>
            Client saved successfully!
          </p>

        </Modal>
      )}

      {/* ERROR */}

      {error && (
        <Modal
          theme={theme}
          onClose={() => setError("")}
        >

          <h3
            style={{
              ...modalHeading(theme),
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#dc2626",
            }}
          >
            <XCircle size={22} strokeWidth={2.2} />
            Error
          </h3>

          <p style={modalText(theme)}>
            {error}
          </p>

        </Modal>
      )}

    </div>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

const Stat = ({ title, value, theme }) => (
  <div style={statCard(theme)}>

    <div
      style={{
        fontSize: 14,
        color: theme.textSecondary || theme.text,
        fontWeight: 600,
      }}
    >
      {title}
    </div>

    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        marginTop: 8,
        color: theme.text,
      }}
    >
      {value}
    </div>

  </div>
);


const Modal = ({
  children,
  onClose,
  theme,
}) => (
  <div style={overlay}>

    <div style={modal(theme)}>

      {children}

      <button
        style={closeBtn(theme)}
        onClick={onClose}
      >
        Close
      </button>

    </div>

  </div>
);


const Badge = ({ type, theme }) => (
  <span
    style={{
      padding: "5px 10px",
      borderRadius: 20,
      fontSize: 12,
      background:
        type === "business"
          ? theme.primary
          : theme.tableHeader || theme.card,
      color:
        type === "business"
          ? "white"
          : theme.text,
      fontWeight: 600,
      display: "inline-block",
    }}
  >
    {type}
  </span>
);


const Empty = ({ theme }) => (
  <div
    style={{
      textAlign: "center",
      padding: 50,
      color: theme.textSecondary || theme.text,
    }}
  >

    <h3 style={{ color: theme.text }}>
      No clients found
    </h3>

    <p>
      Create your first client.
    </p>

  </div>
);


/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  padding: "clamp(15px,3vw,25px)",
  background: "transparent",
  color: theme.text,
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  overflowX: "hidden",
});


const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 15,
  marginBottom: 20,
};


const pageTitle = (theme) => ({
  margin: 0,
  color: theme.primary,
  fontSize: "clamp(24px,5vw,32px)",
  fontWeight: 700,
});


const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 15,
  marginBottom: 20,
  width: "100%",
};


const statCard = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 18,
  borderRadius: 15,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center",
  border: `1px solid ${theme.border}`,
});


const searchBox = (theme) => ({
  width: "100%",
  padding: 14,
  margin: "20px 0",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: theme.input || theme.card,
  color: theme.text,
  fontSize: 16,
  boxSizing: "border-box",
  outline: "none",
});


const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


const table = {
  width: "100%",
  minWidth: 850,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});


const th = (theme) => ({
  padding: 12,
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: 14,
  color: "white",
});


const td = (theme) => ({
  padding: 12,
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
  fontSize: 14,
});


const row = (theme) => ({
  background: theme.card,
});


const rowAlt = (theme) => ({
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
});


const primaryBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  maxWidth: 220,
  minHeight: 46,
});


const smallBtn = (theme) => ({
  padding: "8px 14px",
  marginRight: 8,
  marginBottom: 8,
  background: theme.tableHeader || theme.primary,
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minWidth: 70,
  minHeight: 38,
  fontWeight: 600,
});


const dangerBtn = {
  padding: "8px 14px",
  marginBottom: 8,
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minWidth: 70,
  minHeight: 38,
  fontWeight: 600,
};


const input = (theme) => ({
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 12,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  background: theme.input || theme.card,
  color: theme.text,
  boxSizing: "border-box",
  outline: "none",
  fontSize: 15,
});


const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: 15,
  boxSizing: "border-box",
};


const modal = (theme) => ({
  background: theme.card,
  color: theme.text,
  width: "100%",
  maxWidth: 500,
  borderRadius: 16,
  padding: 25,
  boxSizing: "border-box",
  boxShadow: "0 15px 40px rgba(0,0,0,.2)",
  border: `1px solid ${theme.border}`,
  maxHeight: "90vh",
  overflowY: "auto",
});


const modalHeading = (theme) => ({
  marginTop: 0,
  color: theme.text,
});


const modalText = (theme) => ({
  color: theme.textSecondary || theme.text,
});


const closeBtn = (theme) => ({
  marginTop: 20,
  width: "100%",
  padding: 12,
  background: theme.tableHeader || "#111827",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 42,
});


const msgBox = (theme) => ({
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.text,
  padding: 12,
  borderRadius: 8,
  marginBottom: 15,
  border: `1px solid ${theme.border}`,
});


const loadingStyle = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
  color: theme.text,
  background: "transparent",
});