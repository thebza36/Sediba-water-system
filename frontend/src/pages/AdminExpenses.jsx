import React, { useContext, useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Ban,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminExpenses() {
  const { theme } = useContext(ThemeContext);

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  /* =========================================================
     LOAD EXPENSES
  ========================================================= */

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/expenses`);
      const data = await res.json();

      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  /* =========================================================
     ADD EXPENSE
  ========================================================= */

  const addExpense = async () => {
    if (!title || !amount) {
      alert("Please enter expense name and amount");
      return;
    }

    try {
      const res = await fetch(`${API}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount,
          category,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add expense");
      }

      setTitle("");
      setAmount("");
      setCategory("general");

      loadExpenses();
    } catch (error) {
      console.error(error);
      alert("Failed to add expense");
    }
  };

  /* =========================================================
     DELETE EXPENSE
  ========================================================= */

  const deleteExpense = async () => {
    try {
      const res = await fetch(`${API}/expenses/${deleting}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setDeleting(null);
      loadExpenses();
    } catch (error) {
      console.error(error);
      alert("Failed to delete expense");
    }
  };

  /* =========================================================
     EDIT EXPENSE
  ========================================================= */

  const updateExpense = async () => {
    try {
      const res = await fetch(`${API}/expenses/${editing._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editing),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      setEditing(null);
      loadExpenses();
    } catch (error) {
      console.error(error);
      alert("Failed to update expense");
    }
  };

  /* =========================================================
     TOTAL
  ========================================================= */

  const total = expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={center(theme)}>
        <div style={loadingBox(theme)}>
          <div style={spinner(theme)} />
          <span>Loading expenses...</span>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div style={page(theme)}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={header}>
        <div>
          <h1 style={titleStyle(theme)}>
            <Wallet
              size={30}
              strokeWidth={2.2}
              style={{
                verticalAlign: "middle",
                marginRight: 9,
              }}
            />
            Expenses
          </h1>

          <p style={subtitle(theme)}>
            Track and manage business expenses
          </p>
        </div>
      </div>


      {/* =====================================================
          SUMMARY CARD
      ===================================================== */}

      <div style={summaryCard(theme)}>

        <div style={summaryHeader}>
          <div style={summaryIcon}>
            <Wallet size={22} strokeWidth={2.2} />
          </div>

          <h3 style={summaryTitle}>
            Total Expenses
          </h3>
        </div>

        <p style={totalText}>
          R{total.toFixed(2)}
        </p>

      </div>


      {/* =====================================================
          ADD EXPENSE
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>
          <Plus
            size={20}
            strokeWidth={2.3}
            style={{
              verticalAlign: "middle",
              marginRight: 7,
            }}
          />
          Add Expense
        </h3>

        <div style={formRow}>

          <input
            style={input(theme)}
            placeholder="Expense name"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <input
            style={input(theme)}
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

          <select
            style={input(theme)}
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="general">
              General
            </option>

            <option value="transport">
              Transport
            </option>

            <option value="maintenance">
              Maintenance
            </option>

            <option value="salary">
              Salary
            </option>

            <option value="utilities">
              Utilities
            </option>
          </select>

          <button
            style={addBtn(theme)}
            onClick={addExpense}
          >
            <Plus
              size={18}
              strokeWidth={2.5}
            />

            <span>Add Expense</span>
          </button>

        </div>

      </div>


      {/* =====================================================
          EXPENSE TABLE
      ===================================================== */}

      <div style={card(theme)}>

        <div style={tableHeading}>
          <div>
            <h3 style={tableTitle(theme)}>
              Expense Records
            </h3>

            <p style={recordCount(theme)}>
              {expenses.length} expense
              {expenses.length === 1 ? "" : "s"} recorded
            </p>
          </div>
        </div>

        <div style={tableWrapper}>

          <table style={table}>

            <thead>

              <tr style={thead(theme)}>

                <th style={th(theme)}>
                  Expense
                </th>

                <th style={th(theme)}>
                  Category
                </th>

                <th style={th(theme)}>
                  Amount
                </th>

                <th style={th(theme)}>
                  Date
                </th>

                <th style={th(theme)}>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {expenses.map((e) => (

                <tr
                  key={e._id}
                  style={row(theme)}
                >

                  <td style={td(theme)}>
                    {e.title}
                  </td>

                  <td style={td(theme)}>
                    <span style={categoryBadge(theme)}>
                      {e.category}
                    </span>
                  </td>

                  <td style={td(theme)}>
                    <strong>
                      R{Number(e.amount || 0).toFixed(2)}
                    </strong>
                  </td>

                  <td style={td(theme)}>
                    {new Date(
                      e.createdAt
                    ).toLocaleDateString("en-ZA")}
                  </td>

                  <td style={actionCell}>

                    <button
                      style={editBtn}
                      onClick={() =>
                        setEditing({ ...e })
                      }
                      title="Edit expense"
                    >
                      <Pencil
                        size={16}
                        strokeWidth={2.2}
                      />

                      <span>Edit</span>
                    </button>

                    <button
                      style={deleteBtn}
                      onClick={() =>
                        setDeleting(e._id)
                      }
                      title="Delete expense"
                    >
                      <Trash2
                        size={16}
                        strokeWidth={2.2}
                      />

                      <span>Delete</span>
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (

        <div
          style={modal}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditing(null);
            }
          }}
        >

          <div style={modalBox(theme)}>

            <div style={modalHeader}>

              <div>

                <h2 style={modalTitle(theme)}>
                  <Pencil
                    size={21}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  Edit Expense
                </h2>

                <p style={modalSubtitle(theme)}>
                  Update the expense information
                </p>

              </div>

              <button
                style={modalClose(theme)}
                onClick={() =>
                  setEditing(null)
                }
                title="Close"
              >
                <X size={20} />
              </button>

            </div>


            <input
              style={input(theme)}
              placeholder="Expense name"
              value={editing.title}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  title: e.target.value,
                })
              }
            />


            <input
              style={input(theme)}
              type="number"
              placeholder="Amount"
              value={editing.amount}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  amount: e.target.value,
                })
              }
            />


            <select
              style={input(theme)}
              value={editing.category}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category: e.target.value,
                })
              }
            >

              <option value="general">
                General
              </option>

              <option value="transport">
                Transport
              </option>

              <option value="maintenance">
                Maintenance
              </option>

              <option value="salary">
                Salary
              </option>

              <option value="utilities">
                Utilities
              </option>

            </select>


            <div style={modalActions}>

              <button
                style={cancelBtn}
                onClick={() =>
                  setEditing(null)
                }
              >
                <Ban
                  size={17}
                  strokeWidth={2.2}
                />

                <span>Cancel</span>
              </button>


              <button
                style={saveBtn}
                onClick={updateExpense}
              >
                <Save
                  size={17}
                  strokeWidth={2.2}
                />

                <span>Save Changes</span>
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleting && (

        <div
          style={modal}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleting(null);
            }
          }}
        >

          <div style={modalBox(theme)}>

            <div style={modalHeader}>

              <div>

                <h2 style={modalTitle(theme)}>
                  <AlertTriangle
                    size={21}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  Confirm Delete
                </h2>

                <p style={modalSubtitle(theme)}>
                  This action cannot be undone.
                </p>

              </div>

              <button
                style={modalClose(theme)}
                onClick={() =>
                  setDeleting(null)
                }
                title="Close"
              >
                <X size={20} />
              </button>

            </div>


            <div style={deleteWarning(theme)}>

              <div style={warningIcon}>
                <AlertTriangle
                  size={25}
                  strokeWidth={2}
                />
              </div>

              <p style={modalText(theme)}>
                Are you sure you want to delete
                this expense?
              </p>

              <p style={warningSmall(theme)}>
                The expense will be permanently
                removed from your records.
              </p>

            </div>


            <div style={modalActions}>

              <button
                style={cancelBtn}
                onClick={() =>
                  setDeleting(null)
                }
              >
                <Ban
                  size={17}
                  strokeWidth={2.2}
                />

                <span>Cancel</span>
              </button>


              <button
                style={deleteConfirmBtn}
                onClick={deleteExpense}
              >
                <Trash2
                  size={17}
                  strokeWidth={2.2}
                />

                <span>Delete</span>
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  padding: "15px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});


const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 15,
  marginBottom: 20,
};


const titleStyle = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
});


const subtitle = (theme) => ({
  margin: "6px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 14,
});


/* =========================================================
   SUMMARY
========================================================= */

const summaryCard = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.15)",
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box",
});


const summaryHeader = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};


const summaryIcon = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "rgba(255,255,255,.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const summaryTitle = {
  margin: 0,
  fontSize: 17,
};


const totalText = {
  fontSize: 30,
  fontWeight: 700,
  margin: "10px 0 0",
};


/* =========================================================
   CARDS
========================================================= */

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


const sectionTitle = (theme) => ({
  marginTop: 0,
  marginBottom: 15,
  color: theme.text,
  fontSize: 19,
  display: "flex",
  alignItems: "center",
});


/* =========================================================
   FORM
========================================================= */

const formRow = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  width: "100%",
};


const input = (theme) => ({
  width: "100%",
  padding: 12,
  border: `1px solid ${theme.border}`,
  borderRadius: 9,
  background: theme.input || theme.card,
  color: theme.text,
  boxSizing: "border-box",
  fontSize: 15,
  outline: "none",
  minHeight: 44,
});


const addBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
});


/* =========================================================
   TABLE
========================================================= */

const tableHeading = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 15,
};


const tableTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
});


const recordCount = (theme) => ({
  margin: "4px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 13,
});


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
};


const table = {
  width: "100%",
  minWidth: 560,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "white",
});


const th = (theme) => ({
  padding: 14,
  textAlign: "left",
  fontWeight: 600,
  whiteSpace: "nowrap",
  color: "white",
});


const td = (theme) => ({
  padding: 14,
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
});


const row = (theme) => ({
  background: theme.card,
});


const categoryBadge = (theme) => ({
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 8,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border: `1px solid ${theme.border}`,
  color: theme.text,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "capitalize",
});


const actionCell = {
  padding: 14,
  borderBottom: "1px solid transparent",
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  alignItems: "center",
};


const editBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: 8,
  cursor: "pointer",
  marginRight: 2,
  fontWeight: 600,
  minWidth: 75,
  minHeight: 38,
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
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  minWidth: 80,
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


/* =========================================================
   MODALS
========================================================= */

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
  zIndex: 1000,
  padding: 15,
  boxSizing: "border-box",
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 16,
  width: "100%",
  maxWidth: 380,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxSizing: "border-box",
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  border: `1px solid ${theme.border}`,
});


const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
};


const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 20,
  display: "flex",
  alignItems: "center",
});


const modalSubtitle = (theme) => ({
  margin: "5px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 13,
});


const modalClose = (theme) => ({
  width: 34,
  height: 34,
  minWidth: 34,
  borderRadius: "50%",
  border: `1px solid ${theme.border}`,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  color: theme.text,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const modalText = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: 0,
  fontWeight: 600,
});


const deleteWarning = (theme) => ({
  padding: 15,
  borderRadius: 10,
  background:
    theme.tableHeader ||
    theme.input ||
    theme.card,
  border: `1px solid ${theme.border}`,
});


const warningIcon = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
  background: "rgba(220,38,38,.12)",
  color: "#dc2626",
};


const warningSmall = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: "8px 0 0",
  fontSize: 13,
});


const modalActions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  width: "100%",
};


const saveBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


const cancelBtn = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


const deleteConfirmBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};


/* =========================================================
   LOADING
========================================================= */

const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
  background: "transparent",
});


const loadingBox = (theme) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  color: theme.text,
  fontWeight: 600,
});


const spinner = (theme) => ({
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: `3px solid ${theme.border}`,
  borderTopColor: theme.primary,
  animation: "spin 0.8s linear infinite",
});