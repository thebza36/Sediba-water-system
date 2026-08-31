import { useEffect, useState } from "react";
import API from "../api/axios";

import {
  ClipboardList,
  Droplets,
  Gauge,
  Database,
  Waves,
  BarChart3,
  Save,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  CalendarDays,
  MapPin,
  PlusCircle
} from "lucide-react";

function Readings() {
  /* ==================================
     STATES
  ================================== */

  const [meters, setMeters] = useState([]);
  const [readings, setReadings] = useState([]);
  const [refills, setRefills] = useState([]);

  const [meter, setMeter] = useState("");
  const [currentReading, setCurrentReading] = useState("");

  const [tankName, setTankName] = useState("");
  const [litresAdded, setLitresAdded] = useState("");

  const [modal, setModal] = useState({
    show: false,
    type: "success",
    message: ""
  });

  /* ==================================
     MODAL
  ================================== */

  const showModal = (type, message) => {
    setModal({
      show: true,
      type,
      message
    });

    setTimeout(() => {
      setModal({
        show: false,
        type: "success",
        message: ""
      });
    }, 3000);
  };

  /* ==================================
     LOAD DATA
  ================================== */

  const loadData = async () => {
    try {
      const [
        metersRes,
        readingsRes,
        refillsRes
      ] = await Promise.all([
        API.get("/meters"),
        API.get("/readings"),
        API.get("/readings/refills")
      ]);

      setMeters(
        Array.isArray(metersRes.data)
          ? metersRes.data
          : []
      );

      setReadings(
        Array.isArray(readingsRes.data)
          ? readingsRes.data
          : []
      );

      setRefills(
        Array.isArray(refillsRes.data)
          ? refillsRes.data
          : []
      );
    } catch (error) {
      console.log(error);

      showModal(
        "error",
        error?.response?.data?.message ||
          "Failed to load data"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ==================================
     SUBMIT METER READING
  ================================== */

  const submitReading = async () => {
    if (!meter) {
      showModal(
        "error",
        "Please select a meter"
      );
      return;
    }

    if (!currentReading) {
      showModal(
        "error",
        "Please enter current reading"
      );
      return;
    }

    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      await API.post("/readings", {
        meter,
        currentReading: Number(currentReading),
        employeeName: user?.name || ""
      });

      setMeter("");
      setCurrentReading("");

      await loadData();

      showModal(
        "success",
        "Reading saved successfully"
      );
    } catch (error) {
      showModal(
        "error",
        error?.response?.data?.message ||
          "Failed to save reading"
      );
    }
  };

  /* ==================================
     SUBMIT TANK REFILL
  ================================== */

  const submitRefill = async () => {
    if (!tankName.trim()) {
      showModal(
        "error",
        "Please enter tank name"
      );
      return;
    }

    if (!litresAdded) {
      showModal(
        "error",
        "Please enter litres added"
      );
      return;
    }

    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      await API.post(
        "/readings/refills",
        {
          tankName,
          litresAdded: Number(litresAdded),
          employeeName: user?.name || ""
        }
      );

      setTankName("");
      setLitresAdded("");

      await loadData();

      showModal(
        "success",
        "Tank refill recorded successfully"
      );
    } catch (error) {
      showModal(
        "error",
        error?.response?.data?.message ||
          "Failed to save refill"
      );
    }
  };

  /* ==================================
     FORMAT DATE
  ================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  /* ==================================
     RETURN
  ================================== */

  return (
    <div style={page}>

      {/* ==================================
          NOTIFICATION
      ================================== */}

      {modal.show && (
        <div
          style={{
            ...notification,
            background:
              modal.type === "success"
                ? "linear-gradient(135deg,#16a34a,#22c55e)"
                : "linear-gradient(135deg,#dc2626,#ef4444)"
          }}
        >
          <div style={notificationTop}>

            {modal.type === "success" ? (
              <CheckCircle2
                size={23}
                strokeWidth={2.5}
              />
            ) : (
              <XCircle
                size={23}
                strokeWidth={2.5}
              />
            )}

            <div style={notificationTitle}>
              {modal.type === "success"
                ? "Success"
                : "Error"}
            </div>

          </div>

          <div style={notificationMessage}>
            {modal.message}
          </div>
        </div>
      )}

      {/* ==================================
          PAGE HEADER
      ================================== */}

      <div style={pageHeader}>

        <div style={headerIcon}>
          <ClipboardList
            size={28}
            strokeWidth={2.2}
          />
        </div>

        <div>
          <h1 style={title}>
            Daily Meter Readings
          </h1>

          <p style={subtitle}>
            Record meter readings and manage
            daily water usage.
          </p>
        </div>

      </div>

      {/* ==================================
          SUMMARY CARDS
      ================================== */}

      <div style={statsGrid}>

        {/* TOTAL METERS */}

        <div style={statCard}>

          <div style={statIcon}>
            <Gauge
              size={22}
              strokeWidth={2.3}
            />
          </div>

          <div style={statLabel}>
            Total Meters
          </div>

          <div style={statNumber}>
            {meters.length}
          </div>

          <div style={statDescription}>
            Meters available
          </div>

        </div>

        {/* TOTAL READINGS */}

        <div style={statCard}>

          <div style={statIcon}>
            <ClipboardList
              size={22}
              strokeWidth={2.3}
            />
          </div>

          <div style={statLabel}>
            Total Readings
          </div>

          <div style={statNumber}>
            {readings.length}
          </div>

          <div style={statDescription}>
            Reading records
          </div>

        </div>

        {/* TANK REFILLS */}

        <div style={statCard}>

          <div style={statIcon}>
            <Droplets
              size={22}
              strokeWidth={2.3}
            />
          </div>

          <div style={statLabel}>
            Tank Refills
          </div>

          <div style={statNumber}>
            {refills.length}
          </div>

          <div style={statDescription}>
            Refill records
          </div>

        </div>

      </div>

      {/* ==================================
          RECORD METER READING
      ================================== */}

      <div style={card}>

        <div style={sectionHeader}>

          <div style={sectionIcon}>
            <BarChart3
              size={21}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h2 style={sectionTitle}>
              Record Daily Meter Reading
            </h2>

            <p style={sectionDescription}>
              Enter the latest reading for an
              assigned meter.
            </p>
          </div>

        </div>

        <div style={formGrid}>

          {/* METER */}

          <div style={fieldGroup}>

            <label style={label}>
              <Gauge
                size={15}
                strokeWidth={2}
              />
              Meter
            </label>

            <select
              style={input}
              value={meter}
              onChange={(e) =>
                setMeter(e.target.value)
              }
            >

              <option value="">
                Select Meter
              </option>

              {meters.map((m) => (
                <option
                  key={m._id}
                  value={m._id}
                >
                  {m.meterNumber} -{" "}
                  {m.location}
                </option>
              ))}

            </select>

          </div>

          {/* CURRENT READING */}

          <div style={fieldGroup}>

            <label style={label}>
              <BarChart3
                size={15}
                strokeWidth={2}
              />
              Current Reading
            </label>

            <input
              style={input}
              type="number"
              min="0"
              placeholder="Enter current reading"
              value={currentReading}
              onChange={(e) =>
                setCurrentReading(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <button
          style={primaryBtn}
          onClick={submitReading}
        >
          <Save
            size={18}
            strokeWidth={2.4}
          />

          Save Reading
        </button>

      </div>

      {/* ==================================
          METER READING HISTORY
      ================================== */}

      <div style={card}>

        <div style={sectionHeader}>

          <div style={sectionIcon}>
            <ClipboardList
              size={21}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h2 style={sectionTitle}>
              Meter Reading History
            </h2>

            <p style={sectionDescription}>
              Review previously recorded meter
              readings.
            </p>
          </div>

        </div>

        <div style={tableWrapper}>

          <table style={table}>

            <thead>
              <tr>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <CalendarDays size={15} />
                    Date
                  </span>
                </th>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <Gauge size={15} />
                    Meter
                  </span>
                </th>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <BarChart3 size={15} />
                    Current Reading
                  </span>
                </th>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <User size={15} />
                    Recorded By
                  </span>
                </th>

              </tr>
            </thead>

            <tbody>

              {readings.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    style={emptyCell}
                  >
                    <div style={emptyState}>

                      <ClipboardList
                        size={38}
                        strokeWidth={1.5}
                      />

                      <span>
                        No readings recorded yet
                      </span>

                    </div>
                  </td>

                </tr>

              ) : (

                readings.map(
                  (r, index) => (

                    <tr
                      key={r._id}
                      style={
                        index % 2 === 0
                          ? rowEven
                          : rowOdd
                      }
                    >

                      <td style={td}>
                        <span style={dateCell}>
                          <CalendarDays
                            size={15}
                          />
                          {formatDate(r.date)}
                        </span>
                      </td>

                      <td style={td}>
                        <strong style={strongCell}>
                          <Gauge
                            size={16}
                          />

                          {r.meter?.meterNumber ||
                            "-"}
                        </strong>
                      </td>

                      <td style={td}>
                        <strong>
                          {r.currentReading}
                        </strong>
                      </td>

                      <td style={td}>
                        <span style={employeeCell}>
                          <User size={15} />

                          {r.employeeName ||
                            "-"}
                        </span>
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ==================================
          RECORD TANK REFILL
      ================================== */}

      <div style={card}>

        <div style={sectionHeader}>

          <div style={sectionIcon}>
            <Droplets
              size={21}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h2 style={sectionTitle}>
              Record Tank Refill
            </h2>

            <p style={sectionDescription}>
              Record water added to a storage
              tank.
            </p>
          </div>

        </div>

        <div style={formGrid}>

          {/* TANK NAME */}

          <div style={fieldGroup}>

            <label style={label}>
              <Database
                size={15}
                strokeWidth={2}
              />
              Tank Name
            </label>

            <input
              style={input}
              placeholder="Enter tank name"
              value={tankName}
              onChange={(e) =>
                setTankName(
                  e.target.value
                )
              }
            />

          </div>

          {/* LITRES */}

          <div style={fieldGroup}>

            <label style={label}>
              <Droplets
                size={15}
                strokeWidth={2}
              />
              Litres Added
            </label>

            <input
              style={input}
              type="number"
              min="0"
              placeholder="Enter litres added"
              value={litresAdded}
              onChange={(e) =>
                setLitresAdded(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <button
          style={primaryBtn}
          onClick={submitRefill}
        >
          <Save
            size={18}
            strokeWidth={2.4}
          />

          Save Refill
        </button>

      </div>

      {/* ==================================
          TANK REFILL HISTORY
      ================================== */}

      <div style={card}>

        <div style={sectionHeader}>

          <div style={sectionIcon}>
            <Droplets
              size={21}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h2 style={sectionTitle}>
              Tank Refill History
            </h2>

            <p style={sectionDescription}>
              Review all recorded tank refills.
            </p>
          </div>

        </div>

        <div style={tableWrapper}>

          <table style={table}>

            <thead>

              <tr>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <CalendarDays size={15} />
                    Date
                  </span>
                </th>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <Database size={15} />
                    Tank
                  </span>
                </th>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <Droplets size={15} />
                    Litres Added
                  </span>
                </th>

                <th style={th}>
                  <span style={tableHeaderContent}>
                    <User size={15} />
                    Refilled By
                  </span>
                </th>

              </tr>

            </thead>

            <tbody>

              {refills.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    style={emptyCell}
                  >
                    <div style={emptyState}>

                      <Droplets
                        size={38}
                        strokeWidth={1.5}
                      />

                      <span>
                        No refills recorded yet
                      </span>

                    </div>
                  </td>

                </tr>

              ) : (

                refills.map(
                  (r, index) => (

                    <tr
                      key={r._id}
                      style={
                        index % 2 === 0
                          ? rowEven
                          : rowOdd
                      }
                    >

                      <td style={td}>
                        <span style={dateCell}>
                          <CalendarDays
                            size={15}
                          />

                          {formatDate(r.date)}
                        </span>
                      </td>

                      <td style={td}>
                        <strong style={strongCell}>

                          <Database
                            size={16}
                          />

                          {r.tankName ||
                            "-"}

                        </strong>
                      </td>

                      <td style={td}>
                        <strong style={litresCell}>

                          <Droplets
                            size={16}
                          />

                          {r.litresAdded} L

                        </strong>
                      </td>

                      <td style={td}>
                        <span style={employeeCell}>

                          <User size={15} />

                          {r.employeeName ||
                            "-"}

                        </span>
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

/* =========================================
   PAGE
========================================= */

const page = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "clamp(15px, 3vw, 30px)",
  boxSizing: "border-box",
  background: "#f8fafc",
  minHeight: "100vh",
  overflowX: "hidden"
};

/* =========================================
   PAGE HEADER
========================================= */

const pageHeader = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  marginBottom: 25,
  paddingTop: 5
};

const headerIcon = {
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
    "0 5px 15px rgba(37,99,235,0.15)"
};

const title = {
  margin: 0,
  fontSize: "clamp(26px, 4vw, 38px)",
  fontWeight: 800,
  lineHeight: 1.15,
  color: "#0f172a",
  letterSpacing: "-0.5px"
};

const subtitle = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: "clamp(13px, 2vw, 15px)",
  lineHeight: 1.5
};

/* =========================================
   STATS
========================================= */

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 25
};

const statCard = {
  background:
    "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "white",
  padding: 20,
  borderRadius: 18,
  minHeight: 145,
  boxSizing: "border-box",
  boxShadow:
    "0 10px 25px rgba(30,64,175,0.18)"
};

const statIcon = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background:
    "rgba(255,255,255,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12
};

const statLabel = {
  fontSize: 14,
  fontWeight: 600,
  opacity: 0.95
};

const statNumber = {
  fontSize: 32,
  fontWeight: 800,
  marginTop: 7,
  lineHeight: 1.1
};

const statDescription = {
  fontSize: 12,
  opacity: 0.85,
  marginTop: 7
};

/* =========================================
   CARD
========================================= */

const card = {
  background: "white",
  padding:
    "clamp(17px,3vw,25px)",
  borderRadius: 20,
  marginBottom: 25,
  width: "100%",
  boxSizing: "border-box",
  boxShadow:
    "0 8px 25px rgba(15,23,42,0.08)",
  border:
    "1px solid #e2e8f0"
};

/* =========================================
   SECTION HEADER
========================================= */

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20
};

const sectionIcon = {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 11,
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const sectionTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize:
    "clamp(18px,3vw,23px)",
  fontWeight: 750,
  lineHeight: 1.2
};

const sectionDescription = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.4
};

/* =========================================
   FORM
========================================= */

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 15,
  marginBottom: 18
};

const fieldGroup = {
  width: "100%"
};

const label = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 7
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: 12,
  border:
    "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none"
};

/* =========================================
   BUTTON
========================================= */

const primaryBtn = {
  width: "100%",
  maxWidth: 280,
  background:
    "linear-gradient(135deg,#1e3a8a,#2563eb)",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  boxShadow:
    "0 6px 15px rgba(37,99,235,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9
};

/* =========================================
   TABLE
========================================= */

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling:
    "touch",
  borderRadius: 12,
  border:
    "1px solid #e2e8f0"
};

const table = {
  width: "100%",
  minWidth: 650,
  borderCollapse: "collapse",
  background: "white"
};

const th = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "white",
  padding: "13px 14px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap"
};

const tableHeaderContent = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7
};

const td = {
  padding: "13px 14px",
  borderBottom:
    "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 14,
  whiteSpace: "nowrap"
};

const rowEven = {
  background: "#ffffff"
};

const rowOdd = {
  background: "#f8fafc"
};

const strongCell = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  color: "#0f172a"
};

const dateCell = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7
};

const employeeCell = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7
};

const litresCell = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  color: "#2563eb"
};

const emptyCell = {
  padding: "35px 20px",
  textAlign: "center",
  color: "#64748b",
  fontWeight: 600,
  fontSize: 14
};

const emptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  color: "#94a3b8"
};

/* =========================================
   NOTIFICATION
========================================= */

const notification = {
  position: "fixed",
  top: 80,
  right: 20,
  zIndex: 99999,
  width: "min(360px,calc(100vw - 40px))",
  boxSizing: "border-box",
  padding: 18,
  borderRadius: 16,
  color: "white",
  fontWeight: 600,
  boxShadow:
    "0 15px 40px rgba(0,0,0,0.25)",
  animation:
    "slideIn 0.3s ease"
};

const notificationTop = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 5
};

const notificationTitle = {
  fontSize: 17,
  fontWeight: 800
};

const notificationMessage = {
  fontSize: 14,
  lineHeight: 1.5
};

export default Readings;