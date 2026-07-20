import { useEffect, useState } from "react";
import API from "../api/axios";

function Readings() {

  const [meters, setMeters] = useState([]);
  const [readings, setReadings] = useState([]);
  const [refills, setRefills] = useState([]);

  const [meter, setMeter] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [notes, setNotes] = useState("");

  const [tankName, setTankName] = useState("");
  const [litresAdded, setLitresAdded] = useState("");

  const [modal, setModal] = useState({
  show: false,
  type: "success",
  message: ""
        });

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

    const user =
      JSON.parse(
        localStorage.getItem("user")
      );

    await API.post("/readings", {
      meter,
      currentReading:
        Number(currentReading),
      employeeName:
        user?.name || ""
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



const submitRefill = async () => {

  if (!tankName) {
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

console.log("USER:", user);

console.log("SENDING REFILL:", {
  tankName,
  litresAdded: Number(litresAdded),
  employeeName: user?.name || ""
});

    await API.post(
      "/readings/refills",
      {
        tankName,
        litresAdded:
          Number(litresAdded),
        employeeName:
          user?.name || ""
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

  return (

    <div style={page}>

  {modal.show && (

  <div
    style={{
      position: "fixed",
      top: 25,
      right: 25,
      zIndex: 99999,
      minWidth: 320,
      padding: 20,
      borderRadius: 16,
      color: "white",
      fontWeight: 600,
      fontSize: 16,
      boxShadow:
        "0 15px 40px rgba(0,0,0,0.25)",
      background:
        modal.type === "success"
          ? "linear-gradient(135deg,#16a34a,#22c55e)"
          : "linear-gradient(135deg,#dc2626,#ef4444)",
      animation:
        "slideIn 0.3s ease"
    }}
  >

    <div
      style={{
        fontSize: 20,
        marginBottom: 6
      }}
    >
      {modal.type === "success"
        ? "✅ Success"
        : "❌ Error"}
    </div>

    <div>
      {modal.message}
    </div>

  </div>

)}

      <h1 style={title}>
        📋 Daily Meter Readings Logbook
      </h1>

      <div style={statsGrid}>

        <div style={statCard}>
          <h3>Total Meters</h3>
          <h1>{meters.length}</h1>
        </div>

        <div style={statCard}>
          <h3>Total Readings</h3>
          <h1>{readings.length}</h1>
        </div>

        <div style={statCard}>
          <h3>Tank Refills</h3>
          <h1>{refills.length}</h1>
        </div>

      </div>

      <div style={card}>

        <h2 style={sectionTitle}>
          Record Daily Meter Reading
        </h2>



        <div style={formGrid}>

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
                {m.meterNumber} - {m.location}
              </option>
            ))}

          </select>

          <input
            style={input}
            type="number"
            placeholder="Current Reading"
            value={currentReading}
            onChange={(e) =>
              setCurrentReading(
                e.target.value
              )
            }
          />

        </div>


        <button
          style={primaryBtn}
          onClick={submitReading}
        >
          Save Reading
        </button>

      </div>

      
  {/* METER READING HISTORY */}

<div style={card}>

  <h2 style={sectionTitle}>
    📊 Meter Reading History
  </h2>

  <div style={tableWrapper}>

    <table style={table}>

      <thead>

        <tr>

          <th style={th}>Date</th>
          <th style={th}>Meter</th>
          <th style={th}>Current</th>
          <th style={th}>Recorded by</th>

        </tr>

      </thead>

      <tbody>

        {readings.length === 0 ? (

          <tr>

            <td
              colSpan="6"
              style={emptyCell}
            >
              No readings recorded
            </td>

          </tr>

        ) : (

          readings.map((r, index) => (

            <tr
              key={r._id}
              style={
                index % 2 === 0
                  ? rowEven
                  : rowOdd
              }
            >

              <td style={td}>
                {new Date(
                  r.date
                ).toLocaleDateString()}
              </td>

              <td style={td}>
                {r.meter?.meterNumber}
              </td>


              <td style={td}>
                {r.currentReading}
              </td>

              <td style={td}>
                {r.employeeName}
              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

      <div style={card}>

        <h2 style={sectionTitle}>
          Record Tank Refill
        </h2>



        <div style={formGrid}>

          <input
            style={input}
            placeholder="Tank Name"
            value={tankName}
            onChange={(e) =>
              setTankName(
                e.target.value
              )
            }
          />

          <input
            style={input}
            type="number"
            placeholder="Litres Added"
            value={litresAdded}
            onChange={(e) =>
              setLitresAdded(
                e.target.value
              )
            }
          />

        </div>

        <button
          style={primaryBtn}
          onClick={submitRefill}
        >
          Save Refill
        </button>

      </div>

      {/* TANK REFILL HISTORY */}

<div style={card}>

  <h2 style={sectionTitle}>
    🚰 Tank Refill History
  </h2>

  <div style={tableWrapper}>

    <table style={table}>

      <thead>

        <tr>

          <th style={th}>Date</th>
          <th style={th}>Tank</th>
          <th style={th}>Litres Added</th>
          <th style={th}>Refilled by</th>

        </tr>

      </thead>

      <tbody>

        {refills.length === 0 ? (

          <tr>

            <td
              colSpan="4"
              style={emptyCell}
            >
              No refills recorded
            </td>

          </tr>

        ) : (

          refills.map((r, index) => (

            <tr
              key={r._id}
              style={
                index % 2 === 0
                  ? rowEven
                  : rowOdd
              }
            >

              <td style={td}>
                {new Date(
                  r.date
                ).toLocaleDateString()}
              </td>

              <td style={td}>
                {r.tankName}
              </td>

              <td style={td}>
                {r.litresAdded} L
              </td>

             <td style={td}>
              {r.employeeName || "-"}
              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

    </div>

  );

}

/* ===========================
   STYLES
=========================== */

const page = {
  padding: 30,
  background: "#f1f5f9",
  minHeight: "100vh"
};

const title = {
  fontSize: 42,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 25
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: 20,
  marginBottom: 25
};

const statCard = {
  background:
    "linear-gradient(135deg,#0f172a,#1e3a8a)",
  color: "white",
  padding: 25,
  borderRadius: 20
};

const card = {
  background: "white",
  padding: 25,
  borderRadius: 20,
  marginBottom: 25,
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.08)"
};

const sectionTitle = {
  marginBottom: 15,
  color: "#0f172a"
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: 15,
  marginBottom: 15
};

const input = {
  padding: 14,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  width: "100%"
};

const textarea = {
  width: "100%",
  minHeight: 120,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  marginBottom: 15
};

const primaryBtn = {
  background:
    "linear-gradient(135deg,#1e3a8a,#2563eb)",
  color: "white",
  border: "none",
  padding: "14px 22px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700
};

const tableWrapper = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const th = {
  background: "#1e3a8a",
  color: "white",
  padding: 12,
  textAlign: "left"
};

const td = {
  padding: 12,
  borderBottom:
    "1px solid #e2e8f0"
};

const rowEven = {
  background: "#ffffff"
};

const rowOdd = {
  background: "#f8fafc"
};

const emptyCell = {
  padding: "30px",
  textAlign: "center",
  color: "#64748b",
  fontWeight: 600
};

export default Readings;