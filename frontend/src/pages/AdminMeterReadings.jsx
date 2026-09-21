import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

import {
  ClipboardList,
  Gauge,
  CalendarDays,
  User,
  Pencil,
  Trash2,
  Printer,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Hash,
  Activity,
  ArrowLeftRight,
} from "lucide-react";

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

  /* =========================================================
     FETCH READINGS
  ========================================================= */

  const fetchReadings = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/readings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setReadings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (reading) => {
    setSelectedReading(reading);

    setPreviousReading(reading.previousReading || 0);

    setCurrentReading(reading.currentReading || 0);

    setEmployeeName(reading.employeeName || "");

    setShowModal(true);
  };

  /* =========================================================
     SAVE READING
  ========================================================= */

  const saveReading = async () => {
    try {
      const res = await fetch(
        `${API}/readings/${selectedReading._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            previousReading,
            currentReading,
            employeeName,
          }),
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

  /* =========================================================
     DELETE READING
  ========================================================= */

  const deleteReading = async (id) => {
    try {
      const res = await fetch(
        `${API}/readings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setReadings(
        readings.filter(
          (item) => item._id !== id
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

  /* =========================================================
     PRINT REPORT
  ========================================================= */

  const printPage = () => {
    const printWindow = window.open(
      "",
      "",
      "width=900,height=700"
    );

    const reportHTML = `
      <html>
        <head>
          <title>Meter Readings Report</title>

          <style>

            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }

            h1 {
              text-align: center;
              margin-bottom: 5px;
            }

            h2 {
              text-align: center;
              margin-bottom: 30px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #eee;
            }

            .footer {
              margin-top: 50px;
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
                <th>Previous Reading</th>
                <th>Current Reading</th>
                <th>Employee</th>
              </tr>

            </thead>

            <tbody>

              ${readings
                .map(
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
                        ${reading.previousReading || 0}
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
                )
                .join("")}

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

  /* =========================================================
     CALCULATE READING DIFFERENCE
  ========================================================= */

  const getDifference = (reading) => {
    const previous = Number(
      reading.previousReading || 0
    );

    const current = Number(
      reading.currentReading || 0
    );

    const difference = current - previous;

    return difference >= 0 ? difference : 0;
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={center(theme)}>
        <RefreshCw
          size={24}
          strokeWidth={2.2}
          style={{
            animation:
              "meterReadingsSpin 1s linear infinite",
          }}
        />

        <span>
          Loading meter readings...
        </span>

        <style>
          {`
            @keyframes meterReadingsSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <>
      <div
        className="meter-readings-page"
        style={page(theme)}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="meter-header">

          <div className="meter-header-left">

            <div
              className="meter-header-icon"
              style={{
                background: `${theme.primary}18`,
                color: theme.primary,
              }}
            >
              <ClipboardList
                size={27}
                strokeWidth={2.2}
              />
            </div>

            <div>

              <h1 style={heading(theme)}>
                Meter Readings History
              </h1>

              <p style={subtitle(theme)}>
                View, manage and print all recorded
                meter readings.
              </p>

            </div>

          </div>

          <button
            onClick={printPage}
            style={printBtn}
            title="Print meter readings report"
          >
            <Printer
              size={18}
              strokeWidth={2.2}
            />

            <span>
              Print Report
            </span>
          </button>

        </div>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="reading-summary-grid">

          <div style={summaryCard(theme)}>

            <div>

              <p style={summaryLabel(theme)}>
                Total Readings
              </p>

              <h2 style={summaryValue(theme)}>
                {readings.length}
              </h2>

            </div>

            <div
              className="summary-icon"
              style={{
                background:
                  `${theme.primary}18`,
                color: theme.primary,
              }}
            >
              <ClipboardList
                size={24}
                strokeWidth={2.2}
              />
            </div>

          </div>

          <div style={summaryCard(theme)}>

            <div>

              <p style={summaryLabel(theme)}>
                Latest Reading
              </p>

              <h2 style={summaryValue(theme)}>
                {readings.length > 0
                  ? readings[0]?.currentReading || 0
                  : 0}
              </h2>

            </div>

            <div
              className="summary-icon"
              style={{
                background:
                  `${theme.primary}18`,
                color: theme.primary,
              }}
            >
              <Gauge
                size={24}
                strokeWidth={2.2}
              />
            </div>

          </div>

          <div style={summaryCard(theme)}>

            <div>

              <p style={summaryLabel(theme)}>
                Total Usage
              </p>

              <h2 style={summaryValue(theme)}>
                {readings.reduce(
                  (sum, reading) =>
                    sum + getDifference(reading),
                  0
                )}
              </h2>

            </div>

            <div
              className="summary-icon"
              style={{
                background:
                  `${theme.primary}18`,
                color: theme.primary,
              }}
            >
              <Activity
                size={24}
                strokeWidth={2.2}
              />
            </div>

          </div>

        </div>

        {/* ===================================================
            RECORDS CARD
        =================================================== */}

        <div style={recordsCard(theme)}>

          <div className="records-heading">

            <div>

              <h3 style={sectionTitle(theme)}>

                <FileText
                  size={20}
                  strokeWidth={2.2}
                />

                Meter Reading Records

              </h3>

              <p style={sectionSubtitle(theme)}>
                {readings.length} reading
                {readings.length === 1
                  ? ""
                  : "s"} recorded
              </p>

            </div>

            <div
              className="record-count"
              style={{
                background:
                  `${theme.primary}12`,
                color: theme.primary,
                border:
                  `1px solid ${theme.primary}25`,
              }}
            >

              <ClipboardList
                size={15}
                strokeWidth={2.2}
              />

              {readings.length}

            </div>

          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="desktop-readings-table">

            <div style={tableWrapper}>

              <table style={table}>

                <thead>

                  <tr style={thead(theme)}>

                    <th style={th}>
                      <span className="table-heading">

                        <CalendarDays
                          size={15}
                        />

                        Date

                      </span>
                    </th>

                    <th style={th}>
                      <span className="table-heading">

                        <Hash
                          size={15}
                        />

                        Meter

                      </span>
                    </th>

                    <th style={th}>
                      <span className="table-heading">

                        <ArrowLeftRight
                          size={15}
                        />

                        Previous

                      </span>
                    </th>

                    <th style={th}>
                      <span className="table-heading">

                        <Gauge
                          size={15}
                        />

                        Current

                      </span>
                    </th>

                    <th style={th}>
                      <span className="table-heading">

                        <Activity
                          size={15}
                        />

                        Usage

                      </span>
                    </th>

                    <th style={th}>
                      <span className="table-heading">

                        <User
                          size={15}
                        />

                        Employee

                      </span>
                    </th>

                    <th
                      style={{
                        ...th,
                        textAlign: "center",
                      }}
                    >
                      <span className="table-heading center">

                        <ClipboardList
                          size={15}
                        />

                        Actions

                      </span>
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {readings.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        style={emptyTableCell(theme)}
                      >

                        <div style={emptyState(theme)}>

                          <ClipboardList
                            size={42}
                            strokeWidth={1.6}
                          />

                          <strong>
                            No meter readings found
                          </strong>

                          <span>
                            There are currently no
                            meter readings to display.
                          </span>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    readings.map(
                      (reading) => (

                        <tr
                          key={reading._id}
                          style={row(theme)}
                        >

                          <td style={td(theme)}>

                            <div className="table-cell-with-icon">

                              <CalendarDays
                                size={16}
                                color={
                                  theme.primary
                                }
                              />

                              {new Date(
                                reading.date
                              ).toLocaleDateString()}

                            </div>

                          </td>

                          <td style={td(theme)}>

                            <span
                              className="meter-number-badge"
                              style={{
                                background:
                                  `${theme.primary}12`,
                                color:
                                  theme.primary,
                              }}
                            >

                              <Hash size={14} />

                              {reading?.meter
                                ?.meterNumber ||
                                "N/A"}

                            </span>

                          </td>

                          <td style={td(theme)}>

                            <strong>
                              {reading.previousReading ||
                                0}
                            </strong>

                          </td>

                          <td style={td(theme)}>

                            <strong>
                              {reading.currentReading ||
                                0}
                            </strong>

                          </td>

                          <td style={td(theme)}>

                            <span
                              className="usage-badge"
                              style={{
                                background:
                                  `${theme.primary}12`,
                                color:
                                  theme.primary,
                              }}
                            >

                              <Activity
                                size={14}
                              />

                              {getDifference(
                                reading
                              )}

                            </span>

                          </td>

                          <td style={td(theme)}>

                            <div className="employee-cell">

                              <div
                                className="employee-avatar"
                                style={{
                                  background:
                                    `${theme.primary}18`,
                                  color:
                                    theme.primary,
                                }}
                              >
                                {(reading.employeeName ||
                                  "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <span>
                                {reading.employeeName ||
                                  "-"}
                              </span>

                            </div>

                          </td>

                          <td
                            style={{
                              ...td(theme),
                              textAlign:
                                "center",
                            }}
                          >

                            <div className="action-buttons">

                              <button
                                onClick={() =>
                                  openEditModal(
                                    reading
                                  )
                                }
                                style={editBtn}
                                title="Edit meter reading"
                              >

                                <Pencil
                                  size={15}
                                  strokeWidth={2.2}
                                />

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
                                title="Delete meter reading"
                              >

                                <Trash2
                                  size={15}
                                  strokeWidth={2.2}
                                />

                                Delete

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="mobile-readings-list">

            {readings.length === 0 ? (

              <div style={mobileEmpty(theme)}>

                <ClipboardList
                  size={40}
                  strokeWidth={1.6}
                />

                <strong>
                  No meter readings found
                </strong>

                <span>
                  There are currently no
                  meter readings to display.
                </span>

              </div>

            ) : (

              readings.map(
                (reading) => (

                  <div
                    key={reading._id}
                    className="mobile-reading-card"
                    style={{
                      background:
                        theme.card,
                      border:
                        `1px solid ${theme.border}`,
                    }}
                  >

                    {/* MOBILE CARD HEADER */}

                    <div className="mobile-reading-header">

                      <div className="mobile-reading-title">

                        <div
                          className="mobile-reading-icon"
                          style={{
                            background:
                              `${theme.primary}18`,
                            color:
                              theme.primary,
                          }}
                        >

                          <Gauge
                            size={20}
                            strokeWidth={2.2}
                          />

                        </div>

                        <div>

                          <strong
                            style={{
                              color:
                                theme.text,
                            }}
                          >
                            {reading?.meter
                              ?.meterNumber ||
                              "N/A"}
                          </strong>

                          <span
                            style={{
                              color:
                                theme.textSecondary ||
                                theme.text,
                            }}
                          >
                            Meter Reading
                          </span>

                        </div>

                      </div>

                      <div
                        className="mobile-date-badge"
                        style={{
                          background:
                            `${theme.primary}12`,
                          color:
                            theme.primary,
                        }}
                      >

                        <CalendarDays
                          size={14}
                        />

                        {new Date(
                          reading.date
                        ).toLocaleDateString()}

                      </div>

                    </div>

                    {/* MOBILE DETAILS */}

                    <div
                      className="mobile-reading-details"
                      style={{
                        borderTop:
                          `1px solid ${theme.border}`,
                        borderBottom:
                          `1px solid ${theme.border}`,
                      }}
                    >

                      <div className="mobile-detail">

                        <span
                          style={mobileLabel(theme)}
                        >

                          <ArrowLeftRight
                            size={14}
                          />

                          Previous

                        </span>

                        <strong
                          style={mobileValue(theme)}
                        >
                          {reading.previousReading ||
                            0}
                        </strong>

                      </div>

                      <div className="mobile-detail">

                        <span
                          style={mobileLabel(theme)}
                        >

                          <Gauge
                            size={14}
                          />

                          Current

                        </span>

                        <strong
                          style={mobileValue(theme)}
                        >
                          {reading.currentReading ||
                            0}
                        </strong>

                      </div>

                      <div className="mobile-detail">

                        <span
                          style={mobileLabel(theme)}
                        >

                          <Activity
                            size={14}
                          />

                          Usage

                        </span>

                        <strong
                          style={{
                            ...mobileValue(theme),
                            color:
                              theme.primary,
                          }}
                        >
                          {getDifference(
                            reading
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* MOBILE EMPLOYEE */}

                    <div className="mobile-employee">

                      <div
                        className="employee-avatar"
                        style={{
                          background:
                            `${theme.primary}18`,
                          color:
                            theme.primary,
                        }}
                      >

                        {(reading.employeeName ||
                          "U")
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <span
                          style={{
                            color:
                              theme.textSecondary ||
                              theme.text,
                            fontSize: 12,
                          }}
                        >
                          Employee
                        </span>

                        <strong
                          style={{
                            color:
                              theme.text,
                          }}
                        >
                          {reading.employeeName ||
                            "-"}
                        </strong>

                      </div>

                    </div>

                    {/* MOBILE ACTIONS */}

                    <div className="mobile-reading-actions">

                      <button
                        onClick={() =>
                          openEditModal(
                            reading
                          )
                        }
                        style={editBtn}
                      >

                        <Pencil
                          size={16}
                          strokeWidth={2.2}
                        />

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

                        <Trash2
                          size={16}
                          strokeWidth={2.2}
                        />

                        Delete

                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (

        <div style={overlay}>

          <div style={modalBox(theme)}>

            <div className="modal-heading">

              <div
                className="modal-warning-icon"
              >

                <AlertTriangle
                  size={25}
                  strokeWidth={2.2}
                />

              </div>

              <button
                onClick={() =>
                  setDeleteModal(false)
                }
                className="modal-close"
                style={{
                  color:
                    theme.textSecondary ||
                    theme.text,
                }}
                title="Close"
              >

                <X size={20} />

              </button>

            </div>

            <h2 style={deleteTitle}>

              <Trash2
                size={20}
                strokeWidth={2.2}
              />

              Confirm Delete

            </h2>

            <p style={modalText(theme)}>

              Are you sure you want to delete
              this meter reading? This action
              cannot be undone.

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

                <Trash2
                  size={17}
                  strokeWidth={2.2}
                />

                Delete Reading

              </button>

              <button
                onClick={() =>
                  setDeleteModal(false)
                }
                style={cancelBtn}
              >

                <X
                  size={17}
                  strokeWidth={2.2}
                />

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div style={overlay}>

          <div style={modalBox(theme)}>

            <div className="modal-heading">

              <div>

                <h3 style={modalTitle(theme)}>

                  <Pencil
                    size={20}
                    strokeWidth={2.2}
                  />

                  Edit Meter Reading

                </h3>

                <p style={modalSubtitle(theme)}>
                  Update the reading information
                  below.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="modal-close"
                style={{
                  color:
                    theme.textSecondary ||
                    theme.text,
                }}
                title="Close"
              >

                <X size={20} />

              </button>

            </div>

            {/* PREVIOUS READING */}

            <div className="modal-field">

              <label style={filterLabel(theme)}>

                <ArrowLeftRight
                  size={15}
                />

                Previous Reading

              </label>

              <div className="input-with-icon">

                <Gauge
                  size={18}
                  strokeWidth={2}
                  style={inputIcon}
                />

                <input
                  type="number"
                  min="0"
                  value={previousReading}
                  onChange={(e) =>
                    setPreviousReading(
                      e.target.value
                    )
                  }
                  placeholder="Previous Reading"
                  style={input(theme)}
                />

              </div>

            </div>

            {/* CURRENT READING */}

            <div className="modal-field">

              <label style={filterLabel(theme)}>

                <Gauge
                  size={15}
                />

                Current Reading

              </label>

              <div className="input-with-icon">

                <Activity
                  size={18}
                  strokeWidth={2}
                  style={inputIcon}
                />

                <input
                  type="number"
                  min="0"
                  value={currentReading}
                  onChange={(e) =>
                    setCurrentReading(
                      e.target.value
                    )
                  }
                  placeholder="Current Reading"
                  style={input(theme)}
                />

              </div>

            </div>

            {/* EMPLOYEE */}

            <div className="modal-field">

              <label style={filterLabel(theme)}>

                <User
                  size={15}
                />

                Employee Name

              </label>

              <div className="input-with-icon">

                <User
                  size={18}
                  strokeWidth={2}
                  style={inputIcon}
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

              </div>

            </div>

            <div style={modalActions}>

              <button
                onClick={saveReading}
                style={saveBtn}
              >

                <Save
                  size={17}
                  strokeWidth={2.2}
                />

                Save Changes

              </button>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                style={cancelBtn}
              >

                <X
                  size={17}
                  strokeWidth={2.2}
                />

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      {successModal && (

        <div style={overlay}>

          <div style={modalBox(theme)}>

            <div className="success-icon">

              <CheckCircle2
                size={42}
                strokeWidth={1.8}
              />

            </div>

            <h2 style={successTitle}>

              <CheckCircle2
                size={21}
                strokeWidth={2.2}
              />

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

              <CheckCircle2
                size={17}
                strokeWidth={2.2}
              />

              OK

            </button>

          </div>

        </div>

      )}

      {/* =====================================================
          RESPONSIVE STYLES
      ===================================================== */}

      <style>
        {`

          @keyframes meterReadingsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .meter-readings-page {
            width: 100%;
          }

          .meter-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 22px;
          }

          .meter-header-left {
            display: flex;
            align-items: center;
            gap: 13px;
            min-width: 0;
          }

          .meter-header-icon {
            width: 52px;
            height: 52px;
            border-radius: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .reading-summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 22px;
          }

          .summary-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .summary-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .records-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 4px;
          }

          .record-count {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .table-heading {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .table-heading.center {
            justify-content: center;
            width: 100%;
          }

          .table-cell-with-icon {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .meter-number-badge,
          .usage-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 6px 9px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
          }

          .employee-cell {
            display: flex;
            align-items: center;
            gap: 9px;
            min-width: 0;
          }

          .employee-avatar {
            width: 35px;
            height: 35px;
            min-width: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
          }

          .action-buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            flex-wrap: wrap;
          }

          .mobile-readings-list {
            display: none;
          }

          .mobile-reading-card {
            width: 100%;
            box-sizing: border-box;
            border-radius: 13px;
            padding: 15px;
          }

          .mobile-reading-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .mobile-reading-title {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .mobile-reading-title > div:last-child {
            display: flex;
            flex-direction: column;
            gap: 3px;
            min-width: 0;
          }

          .mobile-reading-title strong {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .mobile-reading-title span {
            font-size: 12px;
          }

          .mobile-reading-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .mobile-date-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 6px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            flex-shrink: 0;
          }

          .mobile-reading-details {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 8px;
            margin-top: 14px;
            padding: 13px 0;
          }

          .mobile-detail {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 0;
          }

          .mobile-detail span {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .mobile-employee {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-top: 13px;
          }

          .mobile-employee > div:last-child {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .mobile-reading-actions {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 9px;
            margin-top: 13px;
          }

          .desktop-empty {
            display: block;
          }

          .modal-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
          }

          .modal-close {
            width: 38px;
            height: 38px;
            border: none;
            background: transparent;
            border-radius: 9px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .modal-warning-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #dc2626;
            background: rgba(220, 38, 38, 0.12);
          }

          .success-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #16a34a;
            background: rgba(22, 163, 74, 0.12);
          }

          .modal-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .modal-field label {
            display: flex !important;
            align-items: center;
            gap: 5px;
          }

          .input-with-icon {
            position: relative;
            width: 100%;
          }

          .input-with-icon input {
            padding-left: 42px !important;
          }

          .input-icon {
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
            pointer-events: none;
            z-index: 1;
          }

          .empty-table-cell {
            border-bottom: none !important;
          }

          @media (max-width: 1050px) {

            .reading-summary-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .reading-summary-grid > :last-child {
              grid-column: 1 / -1;
            }

          }

          @media (max-width: 767px) {

            .meter-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 14px;
            }

            .meter-header-left {
              width: 100%;
              align-items: flex-start;
            }

            .meter-header-icon {
              width: 44px;
              height: 44px;
              border-radius: 11px;
            }

            .meter-header button {
              width: 100%;
              max-width: none;
            }

            .reading-summary-grid {
              grid-template-columns: 1fr;
              gap: 11px;
            }

            .reading-summary-grid > :last-child {
              grid-column: auto;
            }

            .records-heading {
              align-items: flex-start;
              flex-direction: column;
              gap: 8px;
            }

            .desktop-readings-table {
              display: none;
            }

            .mobile-readings-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-top: 14px;
            }

            .desktop-empty {
              display: none;
            }

            .modalBox {
              max-height: calc(100vh - 24px);
              overflow-y: auto;
            }

            .modal-actions {
              flex-direction: column !important;
            }

            .modal-actions button {
              width: 100%;
            }

          }

          @media (max-width: 480px) {

            .mobile-reading-header {
              align-items: flex-start;
            }

            .mobile-reading-title {
              min-width: 0;
            }

            .mobile-date-badge {
              font-size: 10px;
              padding: 5px 6px;
            }

            .mobile-reading-details {
              gap: 6px;
            }

            .mobile-detail strong {
              font-size: 15px !important;
            }

            .employee-avatar {
              width: 33px;
              height: 33px;
              min-width: 33px;
            }

          }

          @media print {

            .meter-header button,
            .mobile-readings-list,
            .action-buttons {
              display: none !important;
            }

            .desktop-readings-table {
              display: block !important;
            }

            .meter-header {
              margin-bottom: 10px;
            }

            .reading-summary-grid {
              grid-template-columns:
                repeat(3, 1fr);
            }

          }

        `}
      </style>
    </>
  );
};

/* =========================================================
   STYLES
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "0 15px 35px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});

const heading = (theme) => ({
  margin: 0,
  color: theme.primary,
  fontSize: "clamp(22px, 5vw, 30px)",
  fontWeight: 700,
  lineHeight: 1.2,
});

const subtitle = (theme) => ({
  margin: "5px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 14,
  lineHeight: 1.5,
});

const summaryCard = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 19,
  borderRadius: 14,
  border: `1px solid ${theme.border}`,
  boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  boxSizing: "border-box",
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
});

const summaryLabel = (theme) => ({
  margin: "0 0 6px",
  color: theme.textSecondary || theme.text,
  fontSize: 13,
  fontWeight: 600,
});

const summaryValue = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: "clamp(23px, 4vw, 29px)",
  fontWeight: 700,
  lineHeight: 1.2,
});

const recordsCard = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  border: `1px solid ${theme.border}`,
  boxSizing: "border-box",
  width: "100%",
});

const sectionTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  fontSize: 19,
  display: "flex",
  alignItems: "center",
  gap: 8,
});

const sectionSubtitle = (theme) => ({
  margin: "5px 0 0",
  color: theme.textSecondary || theme.text,
  fontSize: 13,
});

const printBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "11px 17px",
  borderRadius: 10,
  cursor: "pointer",
  minHeight: 46,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  whiteSpace: "nowrap",
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  borderRadius: 10,
  marginTop: 14,
};

const table = {
  width: "100%",
  minWidth: 850,
  borderCollapse: "collapse",
};

const thead = (theme) => ({
  background: theme.primary,
  color: "#fff",
});

const th = {
  padding: "13px 12px",
  textAlign: "left",
  whiteSpace: "nowrap",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
};

const td = (theme) => ({
  padding: "13px 12px",
  borderBottom: `1px solid ${theme.border}`,
  color: theme.text,
  whiteSpace: "nowrap",
  fontSize: 14,
  verticalAlign: "middle",
});

const row = (theme) => ({
  background: theme.card,
});

const editBtn = {
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  padding: "9px 12px",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 40,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
};

const deleteBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "9px 12px",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 40,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flex: 1,
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
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
  padding: 22,
  borderRadius: 16,
  width: "100%",
  maxWidth: 440,
  boxSizing: "border-box",
  boxShadow: "0 12px 35px rgba(0,0,0,0.28)",
  border: `1px solid ${theme.border}`,
  display: "flex",
  flexDirection: "column",
  gap: 13,
});

const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 19,
});

const modalSubtitle = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: "5px 0 0",
  fontSize: 13,
  lineHeight: 1.5,
});

const deleteTitle = {
  color: "#dc2626",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 19,
};

const successTitle = {
  color: "#16a34a",
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 19,
};

const modalText = (theme) => ({
  color: theme.textSecondary || theme.text,
  margin: 0,
  lineHeight: 1.5,
});

const filterLabel = (theme) => ({
  color: theme.textSecondary || theme.text,
  fontSize: 13,
  fontWeight: 600,
});

const input = (theme) => ({
  width: "100%",
  minHeight: 46,
  padding: "11px 12px",
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  fontSize: 15,
  boxSizing: "border-box",
  background: theme.input || theme.card,
  color: theme.text,
  outline: "none",
});

const inputIcon = {
  position: "absolute",
  left: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#6b7280",
  pointerEvents: "none",
};

const modalActions = {
  marginTop: 7,
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
  borderRadius: 9,
  cursor: "pointer",
  flex: 1,
  minHeight: 44,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const cancelBtn = {
  background: "#6b7280",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 9,
  cursor: "pointer",
  flex: 1,
  minHeight: 44,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const deleteConfirmBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 9,
  cursor: "pointer",
  flex: 1,
  minHeight: 44,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const successBtn = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 9,
  cursor: "pointer",
  minHeight: 44,
  fontWeight: 600,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const emptyState = (theme) => ({
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: theme.textSecondary || theme.text,
  textAlign: "center",
  padding: 20,
});

const mobileEmpty = (theme) => ({
  minHeight: 180,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  color: theme.textSecondary || theme.text,
  textAlign: "center",
  border: `1px dashed ${theme.border}`,
  borderRadius: 12,
  padding: 20,
  boxSizing: "border-box",
});

const emptyTableCell = (theme) => ({
  borderBottom: "none",
  padding: 0,
  color: theme.text,
});

const mobileLabel = (theme) => ({
  color: theme.textSecondary || theme.text,
  fontSize: 12,
  fontWeight: 600,
});

const mobileValue = (theme) => ({
  color: theme.text,
  fontSize: 16,
  fontWeight: 700,
});

const center = (theme) => ({
  minHeight: "60vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 9,
  color: theme.text,
  fontSize: 16,
  fontWeight: 600,
});

export default AdminMeterReadings;