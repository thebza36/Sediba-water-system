import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const AdminMeterReadings = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);

  const [previousReading, setPreviousReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchReadings = async () => {
    try {
      const res = await fetch(
        `${API}/readings`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setReadings(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const openEditModal = (reading) => {
    setSelectedReading(reading);

    setPreviousReading(
      reading.previousReading || 0
    );

    setCurrentReading(
      reading.currentReading || 0
    );

    setEmployeeName(
      reading.employeeName || ""
    );

    setShowModal(true);
  };

  const saveReading = async () => {
    try {

      const res = await fetch(
        `${API}/readings/${selectedReading._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            previousReading,
            currentReading,
            employeeName
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setSuccessMessage(
  "Meter reading updated successfully."
);

setSuccessModal(true);

setShowModal(false);

fetchReadings();

    } catch (err) {

      console.error(err);

      setSuccessMessage(
  "Failed to update reading."
);

setSuccessModal(true);
    }
  };

  const deleteReading = async (id) => {
  try {

    const res = await fetch(
      `${API}/readings/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    setReadings(
      readings.filter(
        item => item._id !== id
      )
    );

    setSuccessMessage(
      "Meter reading deleted successfully."
    );

    setSuccessModal(true);

  } catch (err) {

    console.error(err);

    setSuccessMessage(
      "Failed to delete reading."
    );

    setSuccessModal(true);

  }
};

 const printPage = () => {

  const printWindow =
    window.open("", "", "width=900,height=700");

  const reportHTML = `
    <html>
      <head>
        <title>Meter Readings Report</title>

        <style>
          body{
            font-family: Arial;
            padding:40px;
          }

          h1{
            text-align:center;
            margin-bottom:5px;
          }

          h2{
            text-align:center;
            margin-bottom:30px;
          }

          table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }

          th,td{
            border:1px solid #000;
            padding:10px;
            text-align:left;
          }

          th{
            background:#eee;
          }

          .footer{
            margin-top:50px;
          }
        </style>
      </head>

      <body>

        <h1>SEDIBA STILL WATER SYSTEM</h1>

        <h2>Meter Readings Report</h2>

        <p>
          Generated:
          ${new Date().toLocaleDateString()}
        </p>

        <table>

          <thead>
            <tr>
              <th>Date</th>
              <th>Meter</th>
              <th>Current Reading</th>
              <th>Employee</th>
            </tr>
          </thead>

          <tbody>
              ${readings.map(
              (reading) => `
                <tr>
                  <td>
                    ${new Date(
                      reading.date
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    ${
                      reading?.meter?.meterNumber ||
                      "N/A"
                    }
                  </td>

                  <td>
                    ${reading.currentReading || 0}
                  </td>

                  <td>
                    ${
                      reading.employeeName ||
                      "-"
                    }
                  </td>
                </tr>
              `
            ).join("")}
          </tbody>

        </table>

        <h3>
          Total Readings:
          ${readings.length}
        </h3>

        <div class="footer">
          <p>Prepared By:</p>

          <br/><br/>

          _______________________

          <br/>

          Administrator
        </div>

      </body>
    </html>
  `;

  printWindow.document.write(reportHTML);
  printWindow.document.close();

  printWindow.print();
};

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <div
        style={{
          background: "#fff",
          padding: 25,
          borderRadius: 12,
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20
          }}
        >
          <h2>
            📋 Meter Readings History
          </h2>

          <button
            onClick={printPage}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Print PDF
          </button>
        </div>

        <div
          style={{
            overflowX: "auto"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1e3a8a",
                  color: "#fff"
                }}
              >
                <th style={th}>Date</th>
                <th style={th}>Meter</th>
                <th style={th}>Employee</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {readings.map(
                (reading) => (
                  <tr key={reading._id}>
                    <td style={td}>
                      {new Date(
                        reading.date
                      ).toLocaleDateString()}
                    </td>

                    <td style={td}>
                      {reading?.meter?.meterNumber ||
                        "N/A"}
                    </td>

                    <td style={td}>
                      {reading.employeeName ||
                        "-"}
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          openEditModal(
                            reading
                          )
                        }
                        style={{
                          background:
                            "#f59e0b",
                          color: "#fff",
                          border: "none",
                          padding:
                            "8px 14px",
                          borderRadius: 8,
                          marginRight: 10,
                          cursor: "pointer"
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(reading._id);
                          setDeleteModal(true);
                        }}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          padding: "8px 14px",
                          borderRadius: 8,
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal && (
  <div style={overlay}>
    <div
      style={{
        background: "#fff",
        padding: 30,
        borderRadius: 12,
        width: 350,
        textAlign: "center"
      }}
    >
      <h2
        style={{
          color: "#dc2626",
          marginBottom: 15
        }}
      >
        Confirm Delete
      </h2>

      <p>
        Are you sure you want to delete
        this meter reading?
      </p>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 10
        }}
      >
        <button
          onClick={() => {
            deleteReading(deleteId);
            setDeleteModal(false);
          }}
          style={{
            background: "#dc2626",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Delete
        </button>

        <button
          onClick={() =>
            setDeleteModal(false)
          }
          style={{
            background: "#6b7280",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3>
              Edit Meter Reading
            </h3>

            <input
              type="number"
              value={previousReading}
              onChange={(e) =>
                setPreviousReading(
                  e.target.value
                )
              }
              placeholder="Previous Reading"
              style={input}
            />

            <input
              type="number"
              value={currentReading}
              onChange={(e) =>
                setCurrentReading(
                  e.target.value
                )
              }
              placeholder="Current Reading"
              style={input}
            />

            <input
              type="text"
              value={employeeName}
              onChange={(e) =>
                setEmployeeName(
                  e.target.value
                )
              }
              placeholder="Employee Name"
              style={input}
            />

            <div
              style={{
                marginTop: 20
              }}
            >
              <button
                onClick={saveReading}
                style={saveBtn}
              >
                Save
              </button>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                style={cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
            {successModal && (
        <div style={overlay}>
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 12,
              width: 350,
              textAlign: "center"
            }}
          >
            <h2
              style={{
                color: "#16a34a",
                marginBottom: 15
              }}
            >
              Success
            </h2>

            <p>{successMessage}</p>

            <button
              onClick={() =>
                setSuccessModal(false)
              }
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                marginTop: 20
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const th = {
  padding: 12,
  textAlign: "left"
};

const td = {
  padding: 12,
  borderBottom:
    "1px solid #e5e7eb"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background:
    "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const modal = {
  background: "#fff",
  padding: 25,
  borderRadius: 12,
  width: 400
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  border: "1px solid #ddd",
  borderRadius: 8
};

const saveBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  marginRight: 10
};

const cancelBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer"
};

export default AdminMeterReadings;