import { useEffect, useState } from "react";
import API from "../api/axios";

import {
  Gauge,
  Plus,
  Search,
  Users,
  MapPin,
  Banknote,
  UserRound,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  UserPlus,
  CircleGauge,
  Activity,
  AlertTriangle,
  Droplets,
  Settings2,
  ListChecks,
  LoaderCircle
} from "lucide-react";

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

  /* =====================================================
     THEME
  ===================================================== */

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


  /* =====================================================
     LOAD DATA
  ===================================================== */

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


  /* =====================================================
     MESSAGE
  ===================================================== */

  const showMessage = (type, text) => {

    setMsg({ type, text });

    setTimeout(() => {
      setMsg(null);
    }, 3000);

  };


  /* =====================================================
     CREATE
  ===================================================== */

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

    } catch (error) {

      console.error(error);
      showMessage("error", "Failed to create meter");

    }

  };


  /* =====================================================
     EDIT
  ===================================================== */

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

    if (!editingMeter) return;

    if (
      !form.meterNumber ||
      !form.location ||
      !form.pricePerUnit
    ) {
      showMessage("error", "Fill all fields");
      return;
    }

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
      setEditingMeter(null);

      resetForm();
      loadAll();

    } catch (error) {

      console.error(error);
      showMessage("error", "Update failed");

    }

  };


  /* =====================================================
     DELETE
  ===================================================== */

  const deleteMeter = async (id) => {

    if (!window.confirm("Delete this meter?")) return;

    try {

      await API.delete(`/meters/${id}`);

      showMessage("success", "Meter deleted");

      loadAll();

    } catch (error) {

      console.error(error);
      showMessage("error", "Delete failed");

    }

  };


  /* =====================================================
     ASSIGN EMPLOYEE
  ===================================================== */

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

    } catch (error) {

      console.error(error);

      showMessage(
        "error",
        "Failed to assign employee"
      );

    }

  };


  /* =====================================================
     TOGGLE
  ===================================================== */

  const toggleMeter = async (m) => {

    try {

      await API.put(
        `/meters/${m._id}`,
        {
          isActive: !m.isActive
        }
      );

      showMessage(
        "success",
        m.isActive
          ? "Meter deactivated"
          : "Meter activated"
      );

      loadAll();

    } catch (error) {

      console.error(error);

      showMessage(
        "error",
        "Failed to update meter"
      );

    }

  };


  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {

    setForm({
      meterNumber: "",
      location: "",
      pricePerUnit: "",
      assignedEmployee: ""
    });

  };


  /* =====================================================
     CLOSE MODALS
  ===================================================== */

  const closeCreate = () => {

    setShowCreate(false);
    resetForm();

  };


  const closeEdit = () => {

    setShowEdit(false);
    setEditingMeter(null);
    resetForm();

  };


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredMeters = meters.filter((m) => {

    const meterNumber =
      String(m.meterNumber || "").toLowerCase();

    const location =
      String(m.location || "").toLowerCase();

    const searchValue =
      search.toLowerCase();

    const searchMatch =
      meterNumber.includes(searchValue) ||
      location.includes(searchValue);

    const employeeMatch =
      !filterEmployee ||
      m.assignedEmployee?._id ===
        filterEmployee;

    return searchMatch && employeeMatch;

  });


  /* =====================================================
     STATS
  ===================================================== */

  const activeMeters =
    meters.filter(m => m.isActive).length;

  const inactiveMeters =
    meters.filter(m => !m.isActive).length;


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <Center dark={isDark}>
        <LoaderCircle
          size={28}
          className="meter-loading-icon"
        />

        <span>
          Loading meters...
        </span>

        <style>{`

          .meter-loading-icon {
            animation: meterSpin 1s linear infinite;
          }

          @keyframes meterSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

        `}</style>
      </Center>
    );

  }


  return (

    <div
      className="meters-page"
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

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="meters-header"
        style={header}
      >

        <div className="meters-title">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: isDark
                  ? "#1e3a8a"
                  : "#dbeafe",
                color: isDark
                  ? "#bfdbfe"
                  : "#1d4ed8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Gauge size={24} />
            </div>

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

          </div>


          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: isDark
                ? "#cbd5e1"
                : "#64748b"
            }}
          >
            Manage water meters and assign employees.
          </p>

        </div>


        <button
          className="meters-primary-button"
          style={primaryBtn}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={19} />
          <span>Add Meter</span>
        </button>

      </div>


      {/* =================================================
          STATS
      ================================================= */}

      <div
        className="meters-stats-grid"
        style={statsGrid}
      >

        <div
          className="meter-stat-card"
          style={cardBlue1}
        >

          <div className="stat-icon">
            <Gauge size={23} />
          </div>

          <div>

            <h3>
              Total Meters
            </h3>

            <h1>
              {meters.length}
            </h1>

          </div>

        </div>


        <div
          className="meter-stat-card"
          style={cardBlue2}
        >

          <div className="stat-icon">
            <CheckCircle2 size={23} />
          </div>

          <div>

            <h3>
              Active Meters
            </h3>

            <h1>
              {activeMeters}
            </h1>

          </div>

        </div>


        <div
          className="meter-stat-card"
          style={cardBlue3}
        >

          <div className="stat-icon">
            <XCircle size={23} />
          </div>

          <div>

            <h3>
              Inactive Meters
            </h3>

            <h1>
              {inactiveMeters}
            </h1>

          </div>

        </div>

      </div>


      {/* =================================================
          SEARCH / FILTERS
      ================================================= */}

      <div
        className="meters-filters"
        style={filters}
      >

        <div className="filter-field">

          <Search
            size={18}
            className="filter-icon"
          />

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

        </div>


        <div className="filter-field">

          <Users
            size={18}
            className="filter-icon"
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

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {msg && (

        <div
          className="meters-message"
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

          {msg.type === "error"
            ? <AlertTriangle size={18} />
            : <CheckCircle2 size={18} />
          }

          <span>
            {msg.text}
          </span>

        </div>

      )}


      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

      <div
        className="meters-desktop-table"
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
                  <span className="table-heading">
                    <Gauge size={16} />
                    Meter
                  </span>
                </th>

                <th style={th}>
                  <span className="table-heading">
                    <MapPin size={16} />
                    Location
                  </span>
                </th>

                <th style={th}>
                  <span className="table-heading">
                    <Banknote size={16} />
                    Price
                  </span>
                </th>

                <th style={th}>
                  <span className="table-heading">
                    <Users size={16} />
                    Employee
                  </span>
                </th>

                <th style={th}>
                  <span className="table-heading">
                    <Activity size={16} />
                    Status
                  </span>
                </th>

                <th style={th}>
                  <span className="table-heading">
                    <Settings2 size={16} />
                    Actions
                  </span>
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

                    <div className="table-cell-with-icon">

                      <Gauge
                        size={17}
                        className="cell-icon"
                      />

                      <strong>
                        {m.meterNumber}
                      </strong>

                    </div>

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

                    <div className="table-cell-with-icon">

                      <MapPin
                        size={17}
                        className="cell-icon"
                      />

                      <span>
                        {m.location}
                      </span>

                    </div>

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

                    <div className="table-cell-with-icon">

                      <Banknote
                        size={17}
                        className="cell-icon"
                      />

                      <strong>
                        R {m.pricePerUnit}
                      </strong>

                    </div>

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

                    <div className="employee-select-wrapper">

                      <Users
                        size={17}
                        className="employee-select-icon"
                      />

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

                    </div>

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
                        title="Edit meter"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>


                      <button
                        style={smallBtn}
                        onClick={() =>
                          toggleMeter(m)
                        }
                        title={
                          m.isActive
                            ? "Deactivate meter"
                            : "Activate meter"
                        }
                      >

                        {m.isActive ? (
                          <>
                            <PowerOff size={15} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power size={15} />
                            Activate
                          </>
                        )}

                      </button>


                      <button
                        style={dangerBtn}
                        onClick={() =>
                          deleteMeter(m._id)
                        }
                        title="Delete meter"
                      >
                        <Trash2 size={15} />
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
                      padding: 50,
                      textAlign: "center",
                      color: isDark
                        ? "#cbd5e1"
                        : "#64748b"
                    }}
                  >

                    <div className="empty-state">

                      <CircleGauge size={42} />

                      <strong>
                        No meters found
                      </strong>

                      <span>
                        Try changing your search or employee filter.
                      </span>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          MOBILE METER CARDS
      ================================================= */}

      <div
        className="meters-mobile-list"
      >

        {filteredMeters.map((m) => (

          <div
            key={m._id}
            className="meter-mobile-card"
            style={{
              background: isDark
                ? "#273449"
                : "#ffffff",
              color: isDark
                ? "#f8fafc"
                : "#111827",
              boxShadow: isDark
                ? "0 8px 25px rgba(0,0,0,.25)"
                : "0 4px 12px rgba(0,0,0,.06)"
            }}
          >

            {/* CARD HEADER */}

            <div className="mobile-card-header">

              <div>

                <div className="mobile-meter-title">

                  <Gauge size={19} />

                  <strong>
                    {m.meterNumber}
                  </strong>

                </div>

                <div
                  className="mobile-meter-location"
                  style={{
                    color: isDark
                      ? "#cbd5e1"
                      : "#64748b"
                  }}
                >

                  <MapPin size={16} />

                  <span>
                    {m.location}
                  </span>

                </div>

              </div>


              <Status
                active={m.isActive}
                dark={isDark}
              />

            </div>


            {/* DETAILS */}

            <div className="mobile-meter-details">

              <div
                className="mobile-detail-item"
                style={{
                  background: isDark
                    ? "#334155"
                    : "#f8fafc"
                }}
              >

                <Banknote size={18} />

                <div>

                  <span
                    style={{
                      color: isDark
                        ? "#94a3b8"
                        : "#64748b"
                    }}
                  >
                    Price Per Unit
                  </span>

                  <strong>
                    R {m.pricePerUnit}
                  </strong>

                </div>

              </div>


              <div
                className="mobile-detail-item"
                style={{
                  background: isDark
                    ? "#334155"
                    : "#f8fafc"
                }}
              >

                <UserRound size={18} />

                <div>

                  <span
                    style={{
                      color: isDark
                        ? "#94a3b8"
                        : "#64748b"
                    }}
                  >
                    Assigned Employee
                  </span>

                  <strong>
                    {m.assignedEmployee?.name ||
                      "Unassigned"}
                  </strong>

                </div>

              </div>

            </div>


            {/* ASSIGN EMPLOYEE */}

            <div className="mobile-assignment">

              <label>
                <UserPlus size={16} />
                Assign Employee
              </label>

              <div className="mobile-select-wrapper">

                <Users size={17} />

                <select
                  style={{
                    ...input,
                    maxWidth: "100%",
                    width: "100%",
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

              </div>

            </div>


            {/* ACTIONS */}

            <div className="mobile-meter-actions">

              <button
                style={smallBtn}
                onClick={() =>
                  openEdit(m)
                }
              >
                <Pencil size={16} />
                Edit
              </button>


              <button
                style={smallBtn}
                onClick={() =>
                  toggleMeter(m)
                }
              >

                {m.isActive ? (
                  <>
                    <PowerOff size={16} />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power size={16} />
                    Activate
                  </>
                )}

              </button>


              <button
                style={dangerBtn}
                onClick={() =>
                  deleteMeter(m._id)
                }
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>

          </div>

        ))}


        {filteredMeters.length === 0 && (

          <div
            className="mobile-empty-state"
            style={{
              background: isDark
                ? "#273449"
                : "#ffffff",
              color: isDark
                ? "#cbd5e1"
                : "#64748b"
              }}
          >

            <CircleGauge size={45} />

            <strong>
              No meters found
            </strong>

            <span>
              Try changing your search or employee filter.
            </span>

          </div>

        )}

      </div>


      {/* =================================================
          CREATE MODAL
      ================================================= */}

      {showCreate && (

        <div
          style={overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeCreate();
            }
          }}
        >

          <div
            className="meter-modal"
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

            <div className="modal-header">

              <div>

                <div className="modal-title">

                  <div className="modal-title-icon">
                    <Plus size={21} />
                  </div>

                  <h2>
                    Add Water Meter
                  </h2>

                </div>

                <p
                  style={{
                    color: isDark
                      ? "#94a3b8"
                      : "#64748b"
                  }}
                >
                  Create a new water meter.
                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeCreate}
                style={{
                  color: isDark
                    ? "#cbd5e1"
                    : "#475569"
                }}
                title="Close"
              >
                <X size={21} />
              </button>

            </div>


            <FormField
              icon={<Gauge size={18} />}
              label="Meter Number"
              dark={isDark}
            >

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
                placeholder="Enter meter number"
                value={form.meterNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    meterNumber:
                      e.target.value
                  })
                }
              />

            </FormField>


            <FormField
              icon={<MapPin size={18} />}
              label="Location"
              dark={isDark}
            >

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
                placeholder="Enter meter location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location:
                      e.target.value
                  })
                }
              />

            </FormField>


            <FormField
              icon={<Banknote size={18} />}
              label="Price Per Unit"
              dark={isDark}
            >

              <input
                type="number"
                min="0"
                step="0.01"
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
                placeholder="Enter price per unit"
                value={form.pricePerUnit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricePerUnit:
                      e.target.value
                  })
                }
              />

            </FormField>


            <FormField
              icon={<UserPlus size={18} />}
              label="Assign Employee"
              dark={isDark}
            >

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

            </FormField>


            <div style={modalActions}>

              <button
                className="modal-action-primary"
                style={primaryBtn}
                onClick={createMeter}
              >
                <Save size={18} />
                Create Meter
              </button>


              <button
                className="modal-action-secondary"
                style={secondaryBtn}
                onClick={closeCreate}
              >
                <X size={18} />
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {showEdit && (

        <div
          style={overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEdit();
            }
          }}
        >

          <div
            className="meter-modal"
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

            <div className="modal-header">

              <div>

                <div className="modal-title">

                  <div className="modal-title-icon edit">
                    <Pencil size={20} />
                  </div>

                  <h2>
                    Edit Water Meter
                  </h2>

                </div>

                <p
                  style={{
                    color: isDark
                      ? "#94a3b8"
                      : "#64748b"
                  }}
                >
                  Update this water meter.
                </p>

              </div>


              <button
                className="modal-close"
                onClick={closeEdit}
                style={{
                  color: isDark
                    ? "#cbd5e1"
                    : "#475569"
                }}
                title="Close"
              >
                <X size={21} />
              </button>

            </div>


            <FormField
              icon={<Gauge size={18} />}
              label="Meter Number"
              dark={isDark}
            >

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
                placeholder="Enter meter number"
                value={form.meterNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    meterNumber:
                      e.target.value
                  })
                }
              />

            </FormField>


            <FormField
              icon={<MapPin size={18} />}
              label="Location"
              dark={isDark}
            >

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
                placeholder="Enter meter location"
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location:
                      e.target.value
                  })
                }
              />

            </FormField>


            <FormField
              icon={<Banknote size={18} />}
              label="Price Per Unit"
              dark={isDark}
            >

              <input
                type="number"
                min="0"
                step="0.01"
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
                placeholder="Enter price per unit"
                value={form.pricePerUnit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricePerUnit:
                      e.target.value
                  })
                }
              />

            </FormField>


            <FormField
              icon={<UserPlus size={18} />}
              label="Assign Employee"
              dark={isDark}
            >

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

            </FormField>


            <div style={modalActions}>

              <button
                className="modal-action-primary"
                style={primaryBtn}
                onClick={updateMeter}
              >
                <Save size={18} />
                Save Changes
              </button>


              <button
                className="modal-action-secondary"
                style={secondaryBtn}
                onClick={closeEdit}
              >
                <X size={18} />
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          RESPONSIVE CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .meters-page {
          max-width: 100%;
        }

        .meters-header {
          width: 100%;
        }

        .meters-title {
          min-width: 0;
        }

        .meters-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .meter-stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          min-height: 125px;
        }

        .meter-stat-card h3 {
          margin: 0 0 5px;
          font-size: 14px;
          font-weight: 600;
        }

        .meter-stat-card h1 {
          margin: 0;
          font-size: 30px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .meters-filters {
          width: 100%;
        }

        .filter-field {
          position: relative;
          width: min(100%, 310px);
        }

        .filter-field input,
        .filter-field select {
          padding-left: 42px !important;
          max-width: none !important;
        }

        .filter-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          pointer-events: none;
        }

        .meters-message {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .table-heading {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .table-cell-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cell-icon {
          flex-shrink: 0;
          opacity: .75;
        }

        .employee-select-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .employee-select-wrapper select {
          padding-left: 38px !important;
        }

        .employee-select-icon {
          position: absolute;
          left: 11px;
          z-index: 2;
          pointer-events: none;
        }

        .actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .empty-state,
        .mobile-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .empty-state svg,
        .mobile-empty-state svg {
          opacity: .6;
        }

        .empty-state strong,
        .mobile-empty-state strong {
          font-size: 16px;
        }

        .empty-state span,
        .mobile-empty-state span {
          font-size: 14px;
        }

        .meters-mobile-list {
          display: none;
        }

        .meter-mobile-card {
          width: 100%;
          border-radius: 14px;
          padding: 17px;
          margin-bottom: 14px;
          overflow: hidden;
        }

        .mobile-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(148,163,184,.2);
        }

        .mobile-meter-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
        }

        .mobile-meter-location {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 7px;
          font-size: 13px;
          word-break: break-word;
        }

        .mobile-meter-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .mobile-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px;
          border-radius: 10px;
          min-width: 0;
        }

        .mobile-detail-item svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .mobile-detail-item div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .mobile-detail-item span {
          font-size: 11px;
        }

        .mobile-detail-item strong {
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .mobile-assignment {
          margin-top: 15px;
        }

        .mobile-assignment label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 600;
        }

        .mobile-select-wrapper {
          position: relative;
        }

        .mobile-select-wrapper > svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          pointer-events: none;
        }

        .mobile-select-wrapper select {
          padding-left: 39px !important;
          margin: 0 !important;
        }

        .mobile-meter-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 15px;
        }

        .mobile-meter-actions button {
          width: 100%;
          min-width: 0 !important;
          max-width: none !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding-left: 7px !important;
          padding-right: 7px !important;
        }

        .meter-modal {
          max-height: calc(100vh - 30px);
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-title h2 {
          margin: 0;
          font-size: 21px;
        }

        .modal-header p {
          margin: 7px 0 0 42px;
          font-size: 13px;
        }

        .modal-title-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #dbeafe;
          color: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title-icon.edit {
          background: #e0e7ff;
          color: #4338ca;
        }

        .modal-close {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 9px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: rgba(148,163,184,.15);
        }

        .form-field {
          margin-bottom: 13px;
        }

        .form-field-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .form-field-control {
          width: 100%;
        }

        .form-field-control input,
        .form-field-control select {
          margin-bottom: 0 !important;
        }

        .modal-action-primary,
        .modal-action-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        @media (max-width: 767px) {

          .meters-page {
            padding: 15px !important;
          }

          .meters-header {
            align-items: stretch !important;
            margin-bottom: 20px !important;
          }

          .meters-title h2 {
            font-size: 21px;
          }

          .meters-title p {
            font-size: 13px;
            line-height: 1.45;
          }

          .meters-primary-button {
            width: 100% !important;
            max-width: none !important;
          }

          .meters-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
          }

          .meter-stat-card {
            min-height: 100px;
            padding: 16px !important;
          }

          .meter-stat-card h1 {
            font-size: 27px;
          }

          .meters-filters {
            display: flex !important;
            flex-direction: column;
            gap: 10px !important;
            margin-bottom: 15px !important;
          }

          .filter-field {
            width: 100%;
          }

          .meters-message {
            margin-bottom: 13px !important;
            font-size: 13px;
            line-height: 1.4;
          }

          .meters-desktop-table {
            display: none !important;
          }

          .meters-mobile-list {
            display: block;
          }

          .mobile-card-header {
            align-items: flex-start;
          }

          .mobile-meter-title {
            font-size: 15px;
          }

          .mobile-meter-location {
            max-width: 190px;
          }

          .mobile-meter-details {
            grid-template-columns: 1fr;
          }

          .mobile-meter-actions {
            grid-template-columns: 1fr;
          }

          .meter-modal {
            width: 100% !important;
            max-width: none !important;
            padding: 19px !important;
            border-radius: 14px !important;
          }

          .modal-title h2 {
            font-size: 18px;
          }

          .modal-header p {
            margin-left: 0;
            margin-top: 6px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-action-primary,
          .modal-action-secondary {
            width: 100% !important;
            max-width: none !important;
          }

        }

        @media (min-width: 768px) and (max-width: 1100px) {

          .meters-page {
            padding: 24px !important;
          }

          .meters-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .meters-desktop-table {
            overflow: hidden;
          }

          .table-scroll {
            overflow-x: auto;
          }

        }

        @media (max-width: 420px) {

          .meters-page {
            padding: 12px !important;
          }

          .meter-mobile-card {
            padding: 14px;
          }

          .mobile-card-header {
            gap: 8px;
          }

          .mobile-meter-location {
            max-width: 160px;
          }

          .modal-title {
            align-items: flex-start;
          }

          .modal-title-icon {
            width: 33px;
            height: 33px;
          }

          .modal-title h2 {
            font-size: 17px;
          }

        }

      `}</style>

    </div>

  );

}


/* =====================================================
   FORM FIELD COMPONENT
===================================================== */

const FormField = ({
  icon,
  label,
  dark,
  children
}) => (

  <div className="form-field">

    <label
      className="form-field-label"
      style={{
        color: dark
          ? "#e2e8f0"
          : "#334155"
      }}
    >

      {icon}

      <span>
        {label}
      </span>

    </label>

    <div className="form-field-control">
      {children}
    </div>

  </div>

);


/* =====================================================
   STATUS COMPONENT
===================================================== */

const Status = ({ active, dark }) => (

  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "6px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",

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

    {active ? (
      <CheckCircle2 size={14} />
    ) : (
      <XCircle size={14} />
    )}

    {active ? "Active" : "Inactive"}

  </span>

);


/* =====================================================
   CENTER COMPONENT
===================================================== */

const Center = ({ children, dark }) => (

  <div
    style={{
      display: "flex",
      minHeight: "60vh",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
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


/* =====================================================
   BASE STYLES
===================================================== */

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
  alignItems: "center",
  flexWrap: "wrap"
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
  padding: "8px 12px",
  background: "#e2e8f0",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minWidth: 90,
  height: 38,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  whiteSpace: "nowrap"
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
  padding: "8px 12px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minWidth: 90,
  height: 38,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  whiteSpace: "nowrap"
};


const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  width: "100%",
  maxWidth: 250,
  boxSizing: "border-box",
  outline: "none"
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
  padding: 11,
  borderRadius: 8,
  marginBottom: 15
};


/* =====================================================
   MODALS
===================================================== */

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