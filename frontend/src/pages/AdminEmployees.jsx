import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  Users,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  UserCog,
  X,
} from "lucide-react";

export default function AdminEmployees() {
  const { theme } = useContext(ThemeContext);

  const API = `${import.meta.env.VITE_API_URL}/users`;

  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================
     LOAD EMPLOYEES
  ========================================================= */

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setEmployees(data);
        setFiltered(data);
      } else {
        setMsg(data.message || "Failed to load employees");

        setTimeout(() => {
          setMsg("");
        }, 3000);
      }
    } catch {
      setMsg("Failed to load employees");

      setTimeout(() => {
        setMsg("");
      }, 3000);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  useEffect(() => {
    const q = search.toLowerCase();

    const result = employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );

    setFiltered(result);
    setPage(1);
  }, [search, employees]);

  /* =========================================================
     CREATE OR UPDATE EMPLOYEE
  ========================================================= */

  const saveEmployee = async () => {
    if (!name || !email) {
      setMsg("Name and email required");

      setTimeout(() => {
        setMsg("");
      }, 3000);

      return;
    }

    try {
      const payload = {
        name,
        email,
        role,
      };

      if (password) {
        payload.password = password;
      }

      let res;

      const token = localStorage.getItem("token");

      /* UPDATE */

      if (editingId) {
        res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        /* CREATE */

        if (!password) {
          setMsg("Password required for new employee");

          setTimeout(() => {
            setMsg("");
          }, 3000);

          return;
        }

        payload.password = password;

        res = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setMsg(editingId ? "Employee updated" : "Employee created");

        setTimeout(() => {
          setMsg("");
        }, 3000);

        resetForm();
        loadEmployees();
      } else {
        setMsg(data.message || "Operation failed");

        setTimeout(() => {
          setMsg("");
        }, 3000);
      }
    } catch {
      setMsg("Operation failed");

      setTimeout(() => {
        setMsg("");
      }, 3000);
    }
  };

  /* =========================================================
     DELETE / DISABLE
  ========================================================= */

  const deleteEmployee = async (id) => {
    if (!window.confirm("Disable employee?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/${id}/disable`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMsg("Employee disabled");

        setTimeout(() => {
          setMsg("");
        }, 3000);

        loadEmployees();
      } else {
        setMsg("Operation failed");

        setTimeout(() => {
          setMsg("");
        }, 3000);
      }
    } catch {
      setMsg("Operation failed");

      setTimeout(() => {
        setMsg("");
      }, 3000);
    }
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const editEmployee = (emp) => {
    setEditingId(emp._id);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role || "employee");
    setPassword("");
    setShowPassword(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("employee");
    setShowPassword(false);
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const start = (page - 1) * perPage;

  const paginated = filtered.slice(start, start + perPage);

  const pages = Math.ceil(filtered.length / perPage);

  /* =========================================================
     STATS
  ========================================================= */

  const totalEmployees = employees.length;

  const totalAdmins = employees.filter(
    (e) => e.role === "admin"
  ).length;

  const totalStaff = employees.filter(
    (e) => e.role === "employee"
  ).length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div style={container(theme)}>
      <h1 style={title(theme)}>
        <Users
          size={30}
          strokeWidth={2.2}
          style={{
            verticalAlign: "middle",
            marginRight: 10,
          }}
        />
        Employee Management
      </h1>

      {/* MESSAGE */}

      {msg && <div style={msgBox(theme)}>{msg}</div>}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div style={statsGrid}>
        <div style={statCard(theme)}>
          <Users size={28} strokeWidth={2} />
          <h2>{totalEmployees}</h2>
          <p>Total Users</p>
        </div>

        <div style={statCard(theme)}>
          <UserCog size={28} strokeWidth={2} />
          <h2>{totalStaff}</h2>
          <p>Employees</p>
        </div>

        <div style={statCard(theme)}>
          <Shield size={28} strokeWidth={2} />
          <h2>{totalAdmins}</h2>
          <p>Admins</p>
        </div>
      </div>

      {/* =====================================================
          CREATE / EDIT
      ===================================================== */}

      <div style={card(theme)}>
        <h3 style={sectionTitle(theme)}>
          {editingId ? (
            <>
              <Edit
                size={20}
                style={{
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Edit Employee
            </>
          ) : (
            <>
              <UserPlus
                size={20}
                style={{
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Create Employee
            </>
          )}
        </h3>

        <div style={grid}>
          <input
            style={input(theme)}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={input(theme)}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}

          <div style={passwordWrapper}>
            <input
              style={input(theme)}
              type={showPassword ? "text" : "password"}
              placeholder={
                editingId
                  ? "New Password (optional)"
                  : "Password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              style={showBtn(theme)}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* ROLE */}

          <select
            style={input(theme)}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}

        <div style={formActions}>
          <div style={actionButtons}>
            <button
              style={{
                ...primaryBtn(theme),
                flex: 1,
                minWidth: 160,
              }}
              onClick={saveEmployee}
            >
              {editingId ? (
                <>
                  <Edit
                    size={17}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  Update Employee
                </>
              ) : (
                <>
                  <UserPlus
                    size={17}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  Create Employee
                </>
              )}
            </button>

            {editingId && (
              <button
                style={{
                  ...cancelBtn(theme),
                  flex: 1,
                  minWidth: 120,
                }}
                onClick={resetForm}
              >
                <X
                  size={17}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6,
                  }}
                />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div style={searchWrapper(theme)}>
        <Search
          size={20}
          style={searchIcon(theme)}
        />

        <input
          style={searchBox(theme)}
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div style={card(theme)}>
        <div style={{ overflowX: "auto" }}>
          <div style={tableWrapper}>
            <table style={table}>
              <thead style={thead(theme)}>
                <tr>
                  <th style={th(theme)}>Name</th>
                  <th style={th(theme)}>Email</th>
                  <th style={th(theme)}>Role</th>
                  <th style={th(theme)}>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={emptyTable(theme)}
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((emp, i) => (
                    <tr
                      key={emp._id}
                      style={
                        i % 2
                          ? rowAlt(theme)
                          : row(theme)
                      }
                    >
                      <td style={td(theme)}>
                        {emp.name}
                      </td>

                      <td style={td(theme)}>
                        {emp.email}
                      </td>

                      <td style={td(theme)}>
                        <span
                          style={roleBadge(
                            theme,
                            emp.role
                          )}
                        >
                          {emp.role}
                        </span>
                      </td>

                      <td
                        style={{
                          ...td(theme),
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <button
                          style={editBtn}
                          onClick={() =>
                            editEmployee(emp)
                          }
                        >
                          <Edit
                            size={16}
                            style={{
                              verticalAlign: "middle",
                              marginRight: 5,
                            }}
                          />
                          Edit
                        </button>

                        <button
                          style={deleteBtn}
                          onClick={() =>
                            deleteEmployee(emp._id)
                          }
                        >
                          <Trash2
                            size={16}
                            style={{
                              verticalAlign: "middle",
                              marginRight: 5,
                            }}
                          />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        {pages > 1 && (
          <div style={paginationWrapper}>
            <div style={pagination}>
              {Array.from(
                { length: pages },
                (_, i) => (
                  <button
                    key={i}
                    style={pageBtn(
                      theme,
                      page === i + 1
                    )}
                    onClick={() =>
                      setPage(i + 1)
                    }
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const container = (theme) => ({
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  padding: "15px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});


const title = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  marginBottom: 20,
  color: theme.primary,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
});


const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 15,
  marginBottom: 20,
};


const statCard = (theme) => ({
  background: `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  padding: 20,
  borderRadius: 16,
  textAlign: "center",
  boxShadow: "0 8px 25px rgba(0,0,0,.15)",
  minWidth: 0,
});


const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 16,
  marginTop: 20,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  width: "100%",
});


const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  width: "100%",
};


const input = (theme) => ({
  width: "100%",
  padding: 12,
  borderRadius: 9,
  border: `1px solid ${theme.border}`,
  background: theme.input || theme.card,
  color: theme.text,
  boxSizing: "border-box",
  fontSize: 15,
  outline: "none",
});


const showBtn = (theme) => ({
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: theme.primary,
  padding: 5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const primaryBtn = (theme) => ({
  marginTop: 15,
  padding: "11px 16px",
  background: `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  border: "none",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
});


const cancelBtn = (theme) => ({
  padding: "11px 16px",
  background: "#64748b",
  color: "white",
  border: "none",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  minHeight: 42,
});


const searchWrapper = (theme) => ({
  position: "relative",
  width: "100%",
  marginTop: 20,
});


const searchIcon = (theme) => ({
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.textSecondary || theme.text,
  pointerEvents: "none",
});


const searchBox = (theme) => ({
  width: "100%",
  padding: "13px 13px 13px 44px",
  borderRadius: 10,
  border: `1px solid ${theme.border}`,
  background: theme.input || theme.card,
  color: theme.text,
  boxSizing: "border-box",
  fontSize: 15,
  outline: "none",
});


const table = {
  width: "100%",
  minWidth: 600,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "#ffffff",
});


const th = (theme) => ({
  padding: 14,
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: 14,
  color: "#ffffff",
  fontWeight: 700,
});


const td = (theme) => ({
  padding: 14,
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
  fontSize: 14,
});


const row = (theme) => ({
  background: theme.card,
  color: theme.text,
});


const rowAlt = (theme) => ({
  background: theme.tableHeader || theme.card,
  color: theme.text,
});


const editBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 13px",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 75,
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "9px 13px",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 75,
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
};


const actionButtons = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  width: "100%",
};


const msgBox = (theme) => ({
  background: theme.tableHeader || theme.card,
  color: theme.text,
  padding: 12,
  borderRadius: 10,
  marginBottom: 20,
  fontWeight: 600,
  border: `1px solid ${theme.border}`,
});


const paginationWrapper = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
};


const pagination = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 20,
};


const pageBtn = (theme, active) => ({
  padding: "10px 14px",
  borderRadius: 8,
  border: `1px solid ${theme.border}`,
  background: active
    ? theme.primary
    : theme.tableHeader || theme.card,
  color: active
    ? "white"
    : theme.text,
  cursor: "pointer",
  minWidth: 42,
  minHeight: 40,
  fontWeight: 600,
});


const formActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 15,
  width: "100%",
};


const passwordWrapper = {
  position: "relative",
  width: "100%",
};


const sectionTitle = (theme) => ({
  marginTop: 0,
  marginBottom: 15,
  color: theme.text,
  fontSize: 20,
});


const tableTitle = (theme) => ({
  marginTop: 0,
  color: theme.text,
  fontSize: 19,
});


const roleBadge = (theme, role) => ({
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "capitalize",
  background:
    role === "admin"
      ? theme.primary
      : theme.tableHeader || theme.card,
  color:
    role === "admin"
      ? "white"
      : theme.text,
});


const emptyTable = (theme) => ({
  padding: 25,
  textAlign: "center",
  color: theme.textSecondary || theme.text,
  background: theme.card,
});