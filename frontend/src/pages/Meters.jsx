import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Meters() {

  const [meters, setMeters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const [search, setSearch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);

  const [form, setForm] = useState({
    meterNumber: "",
    location: "",
    pricePerUnit: "",
    assignedEmployee: ""
  });

  /* THEME */

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {

    const detectTheme = () => {

      const savedTheme = localStorage.getItem("theme");

      if (savedTheme) {
        setIsDark(savedTheme === "dark");
        return;
      }

      const bodyColor =
        window.getComputedStyle(document.body).backgroundColor;

      const root = document.getElementById("root");

      const rootColor = root
        ? window.getComputedStyle(root).backgroundColor
        : "";

      const darkColors = [
        "rgb(15, 23, 42)",
        "rgb(30, 41, 59)",
        "rgb(30, 64, 175)"
      ];

      setIsDark(
        darkColors.includes(bodyColor) ||
        darkColors.includes(rootColor)
      );
    };

    detectTheme();

    const observer = new MutationObserver(() => {
      detectTheme();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"]
    });

    const root = document.getElementById("root");

    if (root) {
      observer.observe(root, {
        attributes: true,
        attributeFilter: ["style", "class"]
      });
    }

    window.addEventListener("storage", detectTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", detectTheme);
    };

  }, []);


  /* LOAD DATA */

  const loadAll = async () => {

    try {

      setLoading(true);

      const metersRes = await API.get("/meters");
      const empRes = await API.get("/users");

      setMeters(metersRes.data || []);
      setEmployees(empRes.data || []);

    } catch (error) {

      console.error(error);
      showMessage("error", "Failed to load meters");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadAll();
  }, []);


  /* MESSAGE */

  const showMessage = (type, text) => {

    setMsg({ type, text });

    setTimeout(() => {
      setMsg(null);
    }, 3000);

  };


  /* CREATE */

  const createMeter = async () => {

    if (
      !form.meterNumber ||
      !form.location ||
      !form.pricePerUnit
    ) {
      showMessage("error", "Fill all fields");
      return;
    }

    try {

      await API.post("/meters", {
        meterNumber: form.meterNumber,
        location: form.location,
        pricePerUnit: Number(form.pricePerUnit),
        assignedEmployee: form.assignedEmployee || null
      });

      showMessage("success", "Meter created");

      setShowCreate(false);

      resetForm();
      loadAll();

    } catch {

      showMessage("error", "Failed to create meter");

    }

  };


  /* EDIT */

  const openEdit = (meter) => {

    setEditingMeter(meter);

    setForm({
      meterNumber: meter.meterNumber,
      location: meter.location,
      pricePerUnit: meter.pricePerUnit,
      assignedEmployee:
        meter.assignedEmployee?._id || ""
    });

    setShowEdit(true);

  };


  const updateMeter = async () => {

    try {

      await API.put(
        `/meters/${editingMeter._id}`,
        {
          meterNumber: form.meterNumber,
          location: form.location,
          pricePerUnit: Number(form.pricePerUnit),
          assignedEmployee:
            form.assignedEmployee || null
        }
      );

      showMessage("success", "Meter updated");

      setShowEdit(false);

      resetForm();
      loadAll();

    } catch {

      showMessage("error", "Update failed");

    }

  };


  /* DELETE */

  const deleteMeter = async (id) => {

    if (!window.confirm("Delete this meter?")) return;

    try {

      await API.delete(`/meters/${id}`);

      showMessage("success", "Meter deleted");

      loadAll();

    } catch {

      showMessage("error", "Delete failed");

    }

  };


  /* ASSIGN EMPLOYEE */

  const assignEmployee = async (
    meterId,
    employeeId
  ) => {

    try {

      await API.put(
        `/meters/${meterId}`,
        {
          assignedEmployee:
            employeeId || null
        }
      );

      showMessage(
        "success",
        "Employee updated"
      );

      loadAll();

    } catch {

      showMessage(
        "error",
        "Failed to assign employee"
      );

    }

  };


  /* TOGGLE */

  const toggleMeter = async (m) => {

    try {

      await API.put(
        `/meters/${m._id}`,
        {
          isActive: !m.isActive
        }
      );

      loadAll();

    } catch {

      showMessage(
        "error",
        "Failed to update meter"
      );

    }

  };


  /* RESET FORM */

  const resetForm = () => {

    setForm({
      meterNumber: "",
      location: "",
      pricePerUnit: "",
      assignedEmployee: ""
    });

  };


  /* FILTER */

  const filteredMeters = meters.filter((m) => {

    const searchMatch =
      m.meterNumber
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      m.location
        .toLowerCase()
        .includes(search.toLowerCase());

    const employeeMatch =
      !filterEmployee ||
      m.assignedEmployee?._id ===
        filterEmployee;

    return searchMatch && employeeMatch;

  });


  /* STATS */

  const activeMeters =
    meters.filter(m => m.isActive).length;

  const inactiveMeters =
    meters.filter(m => !m.isActive).length;


  if (loading) {
    return (
      <Center dark={isDark}>
        Loading meters...
      </Center>
    );
  }


  return (

    <div
      style={{
        ...page,
        background: isDark
          ? "#1e293b"
          : "#f1f5f9",
        color: isDark
          ? "#f8fafc"
          : "#111827"
      }}
    >

      {/* HEADER */}

      <div style={header}>

        <div>

          <h2
            style={{
              margin: 0,
              color: isDark
                ? "#f8fafc"
                : "#111827"
            }}
          >
            Water Meters
          </h2>

          <p
            style={{
              marginTop: 6,
              color: isDark
                ? "#cbd5e1"
                : "#64748b"
            }}
          >
            Manage water meters and assign employees.
          </p>

        </div>


        <button
          style={primaryBtn}
          onClick={() => setShowCreate(true)}
        >
          + Add Meter
        </button>

      </div>


      {/* STATS */}

      <div style={statsGrid}>

        <div style={cardBlue1}>

          <h3>Total Meters</h3>

          <h1>{meters.length}</h1>

        </div>


        <div style={cardBlue2}>

          <h3>Active Meters</h3>

          <h1>{activeMeters}</h1>

        </div>


        <div style={cardBlue3}>

          <h3>Inactive Meters</h3>

          <h1>{inactiveMeters}</h1>

        </div>

      </div>


      {/* SEARCH */}

      <div style={filters}>

        <input
          style={{
            ...input,
            background: isDark
              ? "#334155"
              : "#ffffff",
            color: isDark
              ? "#f8fafc"
              : "#111827",
            borderColor: isDark
              ? "#475569"
              : "#d1d5db"
          }}
          placeholder="Search meter or location"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />


        <select
          style={{
            ...input,
            background: isDark
              ? "#334155"
              : "#ffffff",
            color: isDark
              ? "#f8fafc"
              : "#111827",
            borderColor: isDark
              ? "#475569"
              : "#d1d5db"
          }}
          value={filterEmployee}
          onChange={(e) =>
            setFilterEmployee(e.target.value)
          }
        >

          <option value="">
            All Employees
          </option>

          {employees.map(emp => (

            <option
              key={emp._id}
              value={emp._id}
            >
              {emp.name}
            </option>

          ))}

        </select>

      </div>


      {/* MESSAGE */}

      {msg && (

        <div
          style={{
            ...msgBox,
            background:
              msg.type === "error"
                ? isDark
                  ? "#450a0a"
                  : "#fee2e2"
                : isDark
                  ? "#052e16"
                  : "#dcfce7",

            color:
              msg.type === "error"
                ? isDark
                  ? "#fecaca"
                  : "#991b1b"
                : isDark
                  ? "#bbf7d0"
                  : "#166534"
          }}
        >
          {msg.text}
        </div>

      )}


      {/* TABLE */}

      <div
        style={{
          ...tableCard,
          background: isDark
            ? "#273449"
            : "#ffffff",
          boxShadow: isDark
            ? "0 8px 25px rgba(0,0,0,.25)"
            : "0 4px 12px rgba(0,0,0,.05)"
        }}
      >

        <div style={tableScroll}>

          <table style={table}>

            <thead>

              <tr style={thead}>

                <th style={th}>
                  Meter
                </th>

                <th style={th}>
                  Location
                </th>

                <th style={th}>
                  Price
                </th>

                <th style={th}>
                  Employee
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

              {filteredMeters.map((m, i) => (

                <tr
                  key={m._id}
                  style={
                    i % 2
                      ? {
                          ...rowAlt,
                          background: isDark
                            ? "#334155"
                            : "#f8fafc"
                        }
                      : {
                          ...row,
                          background: isDark
                            ? "#273449"
                            : "#ffffff"
                        }
                  }
                >

                  <td
                    style={{
                      ...td,
                      color: isDark
                        ? "#f8fafc"
                        : "#111827",
                      borderBottomColor:
                        isDark
                          ? "#475569"
                          : "#f1f5f9"
                    }}
                  >
                    {m.meterNumber}
                  </td>


                  <td
                    style={{
                      ...td,
                      color: isDark
                        ? "#f8fafc"
                        : "#111827",
                      borderBottomColor:
                        isDark
                          ? "#475569"
                          : "#f1f5f9"
                    }}
                  >
                    {m.location}
                  </td>


                  <td
                    style={{
                      ...td,
                      color: isDark
                        ? "#f8fafc"
                        : "#111827",
                      borderBottomColor:
                        isDark
                          ? "#475569"
                          : "#f1f5f9"
                    }}
                  >
                    R {m.pricePerUnit}
                  </td>


                  <td
                    style={{
                      ...td,
                      borderBottomColor:
                        isDark
                          ? "#475569"
                          : "#f1f5f9"
                    }}
                  >

                    <select
                      style={{
                        ...input,
                        width: 180,
                        maxWidth: 180,
                        background: isDark
                          ? "#475569"
                          : "#ffffff",
                        color: isDark
                          ? "#f8fafc"
                          : "#111827",
                        borderColor: isDark
                          ? "#64748b"
                          : "#d1d5db"
                      }}

                      value={
                        m.assignedEmployee?._id ||
                        ""
                      }

                      onChange={(e) =>
                        assignEmployee(
                          m._id,
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Unassigned
                      </option>

                      {employees.map(emp => (

                        <option
                          key={emp._id}
                          value={emp._id}
                        >
                          {emp.name}
                        </option>

                      ))}

                    </select>

                  </td>


                  <td
                    style={{
                      ...td,
                      borderBottomColor:
                        isDark
                          ? "#475569"
                          : "#f1f5f9"
                    }}
                  >

                    <Status
                      active={m.isActive}
                      dark={isDark}
                    />

                  </td>


                  <td
                    style={{
                      ...td,
                      borderBottomColor:
                        isDark
                          ? "#475569"
                          : "#f1f5f9"
                    }}
                  >

                    <div style={actions}>

                      <button
                        style={smallBtn}
                        onClick={() =>
                          openEdit(m)
                        }
                      >
                        Edit
                      </button>


                      <button
                        style={smallBtn}
                        onClick={() =>
                          toggleMeter(m)
                        }
                      >
                        {m.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>


                      <button
                        style={dangerBtn}
                        onClick={() =>
                          deleteMeter(m._id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}


              {filteredMeters.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: isDark
                        ? "#cbd5e1"
                        : "#64748b"
                    }}
                  >
                    No meters found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* CREATE MODAL */}

      {showCreate && (

        <div style={overlay}>

          <div
            style={{
              ...modal,
              background: isDark
                ? "#273449"
                : "#ffffff",
              color: isDark
                ? "#f8fafc"
                : "#111827"
            }}
          >

            <h2>
              Add Water Meter
            </h2>


            <input
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              placeholder="Meter Number"
              value={form.meterNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  meterNumber:
                    e.target.value
                })
              }
            />


            <input
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location:
                    e.target.value
                })
              }
            />


            <input
              type="number"
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              placeholder="Price Per Unit"
              value={form.pricePerUnit}
              onChange={(e) =>
                setForm({
                  ...form,
                  pricePerUnit:
                    e.target.value
                })
              }
            />


            <select
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              value={form.assignedEmployee}
              onChange={(e) =>
                setForm({
                  ...form,
                  assignedEmployee:
                    e.target.value
                })
              }
            >

              <option value="">
                Unassigned
              </option>

              {employees.map(emp => (

                <option
                  key={emp._id}
                  value={emp._id}
                >
                  {emp.name}
                </option>

              ))}

            </select>


            <div style={modalActions}>

              <button
                style={primaryBtn}
                onClick={createMeter}
              >
                Create Meter
              </button>

              <button
                style={secondaryBtn}
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}


      {/* EDIT MODAL */}

      {showEdit && (

        <div style={overlay}>

          <div
            style={{
              ...modal,
              background: isDark
                ? "#273449"
                : "#ffffff",
              color: isDark
                ? "#f8fafc"
                : "#111827"
            }}
          >

            <h2>
              Edit Water Meter
            </h2>


            <input
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              placeholder="Meter Number"
              value={form.meterNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  meterNumber:
                    e.target.value
                })
              }
            />


            <input
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location:
                    e.target.value
                })
              }
            />


            <input
              type="number"
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              placeholder="Price Per Unit"
              value={form.pricePerUnit}
              onChange={(e) =>
                setForm({
                  ...form,
                  pricePerUnit:
                    e.target.value
                })
              }
            />


            <select
              style={{
                ...modalInput,
                background: isDark
                  ? "#334155"
                  : "#ffffff",
                color: isDark
                  ? "#f8fafc"
                  : "#111827",
                borderColor: isDark
                  ? "#475569"
                  : "#d1d5db"
              }}
              value={form.assignedEmployee}
              onChange={(e) =>
                setForm({
                  ...form,
                  assignedEmployee:
                    e.target.value
                })
              }
            >

              <option value="">
                Unassigned
              </option>

              {employees.map(emp => (

                <option
                  key={emp._id}
                  value={emp._id}
                >
                  {emp.name}
                </option>

              ))}

            </select>


            <div style={modalActions}>

              <button
                style={primaryBtn}
                onClick={updateMeter}
              >
                Save Changes
              </button>

              <button
                style={secondaryBtn}
                onClick={() => {
                  setShowEdit(false);
                  resetForm();
                }}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


/* COMPONENTS */

const Status = ({ active, dark }) => (

  <span
    style={{
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      background: active
        ? dark
          ? "#1e3a8a"
          : "#dbeafe"
        : dark
          ? "#475569"
          : "#e5e7eb",

      color: active
        ? dark
          ? "#bfdbfe"
          : "#1e3a8a"
        : dark
          ? "#e2e8f0"
          : "#374151"
    }}
  >
    {active ? "Active" : "Inactive"}
  </span>

);


const Center = ({ children, dark }) => (

  <div
    style={{
      display: "flex",
      height: "60vh",
      alignItems: "center",
      justifyContent: "center",
      background: dark
        ? "#1e293b"
        : "#f1f5f9",
      color: dark
        ? "#f8fafc"
        : "#111827"
    }}
  >
    {children}
  </div>

);


/* STYLES */

const page = {
  padding: "clamp(15px,4vw,40px)",
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  overflowX: "hidden"
};


const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 25
};


const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: 20,
  marginBottom: 30
};


const filters = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 20
};


const tableCard = {
  borderRadius: 12,
  width: "100%",
  overflow: "hidden"
};


const tableScroll = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch"
};


const table = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse"
};


const thead = {
  background: "#1e3a8a",
  color: "white"
};


const th = {
  padding: 16,
  textAlign: "left",
  fontSize: 14,
  whiteSpace: "nowrap"
};


const td = {
  padding: 16,
  whiteSpace: "nowrap"
};


const row = {
  background: "white"
};


const rowAlt = {
  background: "#f8fafc"
};


const actions = {
  display: "flex",
  gap: 8,
  alignItems: "center"
};


const primaryBtn = {
  padding: "12px 18px",
  background: "#2563eb",
  border: "none",
  borderRadius: 10,
  color: "white",
  cursor: "pointer",
  width: "100%",
  maxWidth: 220,
  fontWeight: 600
};


const smallBtn = {
  padding: "8px 14px",
  background: "#e2e8f0",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minWidth: 90,
  height: 38,
  fontWeight: 600
};


const secondaryBtn = {
  padding: "12px 18px",
  background: "#64748b",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  width: "100%",
  maxWidth: 220,
  fontWeight: 600
};


const dangerBtn = {
  padding: "8px 14px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minWidth: 90,
  height: 38,
  fontWeight: 600
};


const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  width: "100%",
  maxWidth: 250,
  boxSizing: "border-box"
};


const modalInput = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
  boxSizing: "border-box",
  fontSize: 15,
  marginBottom: 12,
  outline: "none"
};


const cardBlue1 = {
  padding: 20,
  borderRadius: 12,
  color: "white",
  background:
    "linear-gradient(135deg,#3b82f6,#1d4ed8)"
};


const cardBlue2 = {
  padding: 20,
  borderRadius: 12,
  color: "white",
  background:
    "linear-gradient(135deg,#60a5fa,#2563eb)"
};


const cardBlue3 = {
  padding: 20,
  borderRadius: 12,
  color: "white",
  background:
    "linear-gradient(135deg,#93c5fd,#3b82f6)"
};


const msgBox = {
  padding: 10,
  borderRadius: 6,
  marginBottom: 15
};


/* MODALS */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 15,
  zIndex: 9999,
  boxSizing: "border-box"
};


const modal = {
  padding: 25,
  borderRadius: 16,
  width: "100%",
  maxWidth: 450,
  boxSizing: "border-box",
  boxShadow: "0 15px 40px rgba(0,0,0,.3)"
};


const modalActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 10
};

