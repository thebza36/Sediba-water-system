import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { ClipboardList } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const AdminMeterReadings = () => {

  const { theme } = useContext(ThemeContext);

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

    return (
      <div style={center(theme)}>
        Loading...
      </div>
    );
  }

  return (

    <>

      {/* MAIN CARD */}

      <div style={page(theme)}>

        <div style={headerRow}>

         <h2
            style={{
              ...heading(theme),
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ClipboardList size={26} strokeWidth={2.2} />
            Meter Readings History
          </h2>

          <button
            onClick={printPage}
            style={printBtn}
          >
            Print PDF
          </button>

        </div>

        {/* TABLE */}

        <div style={tableWrapper}>

          <table style={table}>

            <thead>

              <tr style={thead(theme)}>

                <th style={th}>
                  Date
                </th>

                <th style={th}>
                  Meter
                </th>

                <th style={th}>
                  Employee
                </th>

                <th style={th}>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {readings.map(
                (reading) => (

                  <tr
                    key={reading._id}
                    style={row(theme)}
                  >

                    <td style={td(theme)}>

                      {new Date(
                        reading.date
                      ).toLocaleDateString()}

                    </td>

                    <td style={td(theme)}>

                      {reading?.meter?.meterNumber ||
                        "N/A"}

                    </td>

                    <td style={td(theme)}>

                      {reading.employeeName ||
                        "-"}

                    </td>

                    <td style={td(theme)}>

                      <button
                        onClick={() =>
                          openEditModal(
                            reading
                          )
                        }
                        style={editBtn}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {

                          setDeleteId(
                            reading._id
                          );

                          setDeleteModal(
                            true
                          );

                        }}
                        style={deleteBtn}
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


      {/* DELETE MODAL */}

      {deleteModal && (

        <div style={overlay}>

          <div style={modalBox(theme)}>

            <h2 style={deleteTitle}>
              Confirm Delete
            </h2>

            <p style={modalText(theme)}>
              Are you sure you want to delete
              this meter reading?
            </p>

            <div style={modalActions}>

              <button
                onClick={() => {

                  deleteReading(
                    deleteId
                  );

                  setDeleteModal(false);

                }}
                style={deleteConfirmBtn}
              >
                Delete
              </button>

              <button
                onClick={() =>
                  setDeleteModal(false)
                }
                style={cancelBtn}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}


      {/* EDIT MODAL */}

      {showModal && (

        <div style={overlay}>

          <div style={modalBox(theme)}>

            <h3 style={modalTitle(theme)}>
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
              style={input(theme)}
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
              style={input(theme)}
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
              style={input(theme)}
            />

            <div style={modalActions}>

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


      {/* SUCCESS MODAL */}

      {successModal && (

        <div style={overlay}>

          <div style={modalBox(theme)}>

            <h2 style={successTitle}>
              Success
            </h2>

            <p style={modalText(theme)}>
              {successMessage}
            </p>

            <button
              onClick={() =>
                setSuccessModal(false)
              }
              style={successBtn}
            >
              OK
            </button>

          </div>

        </div>

      )}

    </>

  );
};


/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: 1300,
  margin: "0 auto",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 15,
  marginBottom: 20,
};


const heading = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: "clamp(20px, 4vw, 26px)",
});


const printBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
  maxWidth: 180,
  minHeight: 44,
  fontWeight: 600,
};


const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
};


const table = {
  width: "100%",
  minWidth: 700,
  borderCollapse: "collapse",
};


const thead = (theme) => ({
  background: theme.primary,
  color: "#fff",
});


const th = {
  padding: 12,
  textAlign: "left",
  whiteSpace: "nowrap",
  color: "#fff",
};


const td = (theme) => ({
  padding: 12,
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
});


const row = (theme) => ({
  background: theme.card,
});


const editBtn = {
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  marginRight: 8,
  marginBottom: 8,
  cursor: "pointer",
  minWidth: 80,
  minHeight: 38,
  fontWeight: 600,
};


const deleteBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  marginBottom: 8,
  cursor: "pointer",
  minWidth: 80,
  minHeight: 38,
  fontWeight: 600,
};


const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: 15,
  boxSizing: "border-box",
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 25,
  borderRadius: 16,
  width: "90%",
  maxWidth: 420,
  boxSizing: "border-box",
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
  border: `1px solid ${theme.border}`,
});


const modalTitle = (theme) => ({
  marginTop: 0,
  marginBottom: 15,
  color: theme.text,
});


const deleteTitle = {
  color: "#dc2626",
  marginTop: 0,
  marginBottom: 15,
};


const successTitle = {
  color: "#16a34a",
  marginTop: 0,
  marginBottom: 15,
};


const modalText = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: 0,
});


const input = (theme) => ({
  width: "100%",
  padding: 12,
  marginTop: 10,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
  background: theme.input || theme.card,
  color: theme.text,
  outline: "none",
});


const modalActions = {
  marginTop: 20,
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  width: "100%",
};


const saveBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  flex: 1,
  minHeight: 42,
  fontWeight: 600,
};


const cancelBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  flex: 1,
  minHeight: 42,
  fontWeight: 600,
};


const deleteConfirmBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  flex: 1,
  minHeight: 42,
  fontWeight: 600,
};


const successBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  marginTop: 20,
  minHeight: 42,
  fontWeight: 600,
  width: "100%",
};


const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
  fontSize: 20,
  fontWeight: 600,
  color: theme.text,
  background: "transparent",
});


export default AdminMeterReadings;