import React, { useEffect, useMemo, useState } from "react";

import {
  FlaskConical,
  Droplets,
  Thermometer,
  TestTube2,
  ClipboardCheck,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Activity,
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  HelpCircle,
  Info,
  X,
  Edit3,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function WaterTests() {
  /* =====================================================
     STATES
  ===================================================== */

  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  /* FORM */

  const [testDate, setTestDate] = useState("");
  const [ph, setPh] = useState("");
  const [chlorine, setChlorine] = useState("");
  const [temperature, setTemperature] = useState("");
  const [turbidity, setTurbidity] = useState("");
  const [tds, setTds] = useState("");
  const [status, setStatus] = useState("PASS");
  const [notes, setNotes] = useState("");

  /* EDIT */

  const [editingTestId, setEditingTestId] = useState(null);

  /* MODAL */

  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    onConfirm: null,
  });

  /* =====================================================
     TOKEN
  ===================================================== */

  const token = localStorage.getItem("token");

  /* =====================================================
     MODAL FUNCTIONS
  ===================================================== */

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const showSuccess = (title, message) => {
    setModal({
      open: true,
      type: "success",
      title,
      message,
      confirmText: "OK",
      cancelText: "",
      onConfirm: null,
    });
  };

  const showError = (title, message) => {
    setModal({
      open: true,
      type: "error",
      title,
      message,
      confirmText: "OK",
      cancelText: "",
      onConfirm: null,
    });
  };

  const showConfirm = (
    title,
    message,
    onConfirm,
    confirmText = "Confirm"
  ) => {
    setModal({
      open: true,
      type: "warning",
      title,
      message,
      confirmText,
      cancelText: "Cancel",
      onConfirm,
    });
  };

  const handleModalConfirm = async () => {
    const action = modal.onConfirm;

    closeModal();

    if (action) {
      await action();
    }
  };

  /* =====================================================
     LOAD TESTS
  ===================================================== */

  const loadTests = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/water-tests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load water tests"
        );
      }

      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD WATER TESTS ERROR:", error);

      showError(
        "Loading Failed",
        error.message || "Failed to load water tests"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadTests();
  }, []);

  /* =====================================================
     SEARCH
  ===================================================== */

  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      setFilteredTests(tests);
      return;
    }

    const filtered = tests.filter((test) => {
      const date = test.testDate
        ? new Date(test.testDate)
            .toLocaleDateString("en-ZA")
            .toLowerCase()
        : "";

      const employee =
        test.employeeName?.toLowerCase() ||
        test.employee?.name?.toLowerCase() ||
        "";

      const testStatus = String(
        test.status || ""
      ).toLowerCase();

      const testNotes = String(
        test.notes || ""
      ).toLowerCase();

      return (
        date.includes(searchValue) ||
        employee.includes(searchValue) ||
        testStatus.includes(searchValue) ||
        testNotes.includes(searchValue)
      );
    });

    setFilteredTests(filtered);
  }, [search, tests]);

  /* =====================================================
     CLEAR FORM
  ===================================================== */

  const clearForm = () => {
    setTestDate("");
    setPh("");
    setChlorine("");
    setTemperature("");
    setTurbidity("");
    setTds("");
    setStatus("PASS");
    setNotes("");
  };

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const cancelEdit = () => {
    setEditingTestId(null);
    clearForm();
  };

  /* =====================================================
     START EDIT
  ===================================================== */

  const startEdit = (test) => {
    setEditingTestId(test._id);

    let formattedDate = "";

    if (test.testDate) {
      const dateObject = new Date(test.testDate);

      if (!Number.isNaN(dateObject.getTime())) {
        const year = dateObject.getFullYear();

        const month = String(
          dateObject.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          dateObject.getDate()
        ).padStart(2, "0");

        formattedDate = `${year}-${month}-${day}`;
      }
    }

    setTestDate(formattedDate);

    setPh(test.ph ?? "");
    setChlorine(test.chlorine ?? "");
    setTemperature(test.temperature ?? "");
    setTurbidity(test.turbidity ?? "");
    setTds(test.tds ?? "");

    const currentStatus = String(
      test.status || "PASS"
    ).toUpperCase();

    setStatus(
      currentStatus === "FAIL"
        ? "FAIL"
        : "PASS"
    );

    setNotes(test.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     VALIDATE FORM
  ===================================================== */

  const validateForm = () => {
    if (!testDate) {
      showError(
        "Missing Date",
        "Please select the water test date."
      );

      return false;
    }

    if (
      ph === "" ||
      chlorine === "" ||
      temperature === "" ||
      turbidity === "" ||
      tds === ""
    ) {
      showError(
        "Missing Information",
        "Please complete all water quality measurements."
      );

      return false;
    }

    const values = [
      Number(ph),
      Number(chlorine),
      Number(temperature),
      Number(turbidity),
      Number(tds),
    ];

    if (
      values.some(
        (value) => !Number.isFinite(value)
      )
    ) {
      showError(
        "Invalid Values",
        "Please enter valid numbers for all water quality measurements."
      );

      return false;
    }

    if (Number(ph) < 0 || Number(ph) > 14) {
      showError(
        "Invalid pH",
        "pH must be between 0 and 14."
      );

      return false;
    }

    if (Number(chlorine) < 0) {
      showError(
        "Invalid Chlorine",
        "Chlorine cannot be negative."
      );

      return false;
    }

    if (Number(turbidity) < 0) {
      showError(
        "Invalid Turbidity",
        "Turbidity cannot be negative."
      );

      return false;
    }

    if (Number(tds) < 0) {
      showError(
        "Invalid TDS",
        "TDS cannot be negative."
      );

      return false;
    }

    return true;
  };

  /* =====================================================
     FORM DATA
  ===================================================== */

  const getFormData = () => {
    return {
      testDate,

      ph: Number(ph),

      chlorine: Number(chlorine),

      temperature: Number(temperature),

      turbidity: Number(turbidity),

      tds: Number(tds),

      /* Always send uppercase */

      status: String(status).toUpperCase(),

      notes: notes.trim(),
    };
  };

  /* =====================================================
     CREATE WATER TEST
  ===================================================== */

  const createWaterTest = async () => {
    if (!validateForm()) {
      return;
    }

    showConfirm(
      "Save Water Test?",
      "Are you sure you want to save this water quality test?",
      async () => {
        try {
          setSubmitting(true);

          const response = await fetch(
            `${API}/water-tests`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify(
                getFormData()
              ),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                "Failed to create water test"
            );
          }

          clearForm();

          await loadTests();

          showSuccess(
            "Water Test Saved",
            "The water quality test has been saved successfully."
          );
        } catch (error) {
          console.error(
            "CREATE WATER TEST ERROR:",
            error
          );

          showError(
            "Save Failed",
            error.message ||
              "Failed to save water test"
          );
        } finally {
          setSubmitting(false);
        }
      },
      "Save"
    );
  };

  /* =====================================================
     UPDATE WATER TEST
  ===================================================== */

  const updateWaterTest = async () => {
    if (!editingTestId) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    showConfirm(
      "Update Water Test?",
      "Are you sure you want to update this water quality test?",
      async () => {
        try {
          setSubmitting(true);

          const response = await fetch(
            `${API}/water-tests/${editingTestId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify(
                getFormData()
              ),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                "Failed to update water test"
            );
          }

          setEditingTestId(null);

          clearForm();

          await loadTests();

          showSuccess(
            "Water Test Updated",
            "The water quality test has been updated successfully."
          );
        } catch (error) {
          console.error(
            "UPDATE WATER TEST ERROR:",
            error
          );

          showError(
            "Update Failed",
            error.message ||
              "Failed to update water test"
          );
        } finally {
          setSubmitting(false);
        }
      },
      "Update"
    );
  };

  /* =====================================================
     DELETE WATER TEST
  ===================================================== */

  const deleteTest = (test) => {
    showConfirm(
      "Delete Water Test?",
      "This water test will be permanently deleted. This action cannot be undone.",
      async () => {
        try {
          setSubmitting(true);

          const response = await fetch(
            `${API}/water-tests/${test._id}`,
            {
              method: "DELETE",

              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                "Failed to delete water test"
            );
          }

          if (
            editingTestId === test._id
          ) {
            setEditingTestId(null);
            clearForm();
          }

          await loadTests();

          showSuccess(
            "Water Test Deleted",
            "The water quality test has been deleted successfully."
          );
        } catch (error) {
          console.error(
            "DELETE WATER TEST ERROR:",
            error
          );

          showError(
            "Delete Failed",
            error.message ||
              "Failed to delete water test"
          );
        } finally {
          setSubmitting(false);
        }
      },
      "Delete"
    );
  };

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalTests = tests.length;

  const passedTests = tests.filter(
    (test) =>
      String(test.status || "")
        .toUpperCase() === "PASS"
  ).length;

  const failedTests = tests.filter(
    (test) =>
      String(test.status || "")
        .toUpperCase() === "FAIL"
  ).length;

  const latestTest = useMemo(() => {
    if (!tests.length) {
      return null;
    }

    return [...tests].sort(
      (a, b) =>
        new Date(b.testDate) -
        new Date(a.testDate)
    )[0];
  }, [tests]);

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     MODAL ICON
  ===================================================== */

  const getModalIcon = () => {
    if (modal.type === "success") {
      return (
        <CircleCheck
          size={25}
          strokeWidth={2.5}
        />
      );
    }

    if (modal.type === "error") {
      return (
        <CircleAlert
          size={25}
          strokeWidth={2.5}
        />
      );
    }

    if (modal.type === "warning") {
      return (
        <AlertTriangle
          size={25}
          strokeWidth={2.5}
        />
      );
    }

    return (
      <Info
        size={25}
        strokeWidth={2.5}
      />
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="water-test-page" style={page}>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        className="water-test-page-header"
        style={pageHeader}
      >
        <div
          className="water-test-header-icon"
          style={headerIcon}
        >
          <FlaskConical size={28} />
        </div>

        <div>
          <h1
            className="water-test-page-title"
            style={pageTitle}
          >
            Water Tests
          </h1>

          <p
            className="water-test-page-subtitle"
            style={pageSubtitle}
          >
            Record and monitor daily water quality tests.
          </p>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div
        className="water-test-summary"
        style={summaryGrid}
      >
        {/* TOTAL */}

        <div style={summaryCard}>
          <div
            style={{
              ...summaryIcon,
              background: "#dbeafe",
              color: "#2563eb",
            }}
          >
            <FlaskConical size={21} />
          </div>

          <div style={summaryContent}>
            <p style={summaryLabel}>
              Total Tests
            </p>

            <h2 style={summaryValue}>
              {totalTests}
            </h2>
          </div>
        </div>

        {/* PASSED */}

        <div style={summaryCard}>
          <div
            style={{
              ...summaryIcon,
              background: "#dcfce7",
              color: "#16a34a",
            }}
          >
            <CheckCircle2 size={21} />
          </div>

          <div style={summaryContent}>
            <p style={summaryLabel}>
              Passed
            </p>

            <h2 style={summaryValue}>
              {passedTests}
            </h2>
          </div>
        </div>

        {/* FAILED */}

        <div style={summaryCard}>
          <div
            style={{
              ...summaryIcon,
              background: "#fee2e2",
              color: "#dc2626",
            }}
          >
            <XCircle size={21} />
          </div>

          <div style={summaryContent}>
            <p style={summaryLabel}>
              Failed
            </p>

            <h2 style={summaryValue}>
              {failedTests}
            </h2>
          </div>
        </div>

        {/* LATEST */}

        <div style={summaryCard}>
          <div
            style={{
              ...summaryIcon,
              background: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <Calendar size={21} />
          </div>

          <div
            style={{
              ...summaryContent,
              minWidth: 0,
            }}
          >
            <p style={summaryLabel}>
              Latest Test
            </p>

            <h2
              style={{
                ...summaryValue,
                fontSize: 16,
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {latestTest
                ? formatDate(
                    latestTest.testDate
                  )
                : "-"}
            </h2>
          </div>
        </div>
      </div>

      {/* =================================================
          FORM CARD
      ================================================= */}

      <div
        className="water-test-card"
        style={card}
      >
        <div style={cardHeader}>
          <div style={sectionIcon}>
            <ClipboardCheck size={21} />
          </div>

          <div style={{ minWidth: 0 }}>
            <h2
              className="water-test-card-title"
              style={cardTitle}
            >
              {editingTestId
                ? "Edit Water Test"
                : "Record Water Test"}
            </h2>

            <p style={cardSubtitle}>
              {editingTestId
                ? "Update the existing water quality record."
                : "Enter today's water quality measurements."}
            </p>
          </div>
        </div>

        {/* =================================================
            EDIT BANNER
        ================================================= */}

        {editingTestId && (
          <div
            className="water-test-edit-banner"
            style={editBanner}
          >
            <div
              className="water-test-edit-banner-icon"
              style={editBannerIcon}
            >
              <Edit3 size={20} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={editBannerTitle}>
                Editing Water Test
              </div>

              <div style={editBannerText}>
                Make your changes and click
                "Update Water Test" when finished.
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            FORM GRID
        ================================================= */}

        <div
          className="water-test-form-grid"
          style={formGrid}
        >
          {/* DATE */}

          <div style={field}>
            <label style={label}>
              <Calendar size={15} />
              <span>Test Date</span>
            </label>

            <input
              className="water-test-input"
              type="date"
              value={testDate}
              onChange={(e) =>
                setTestDate(e.target.value)
              }
              style={input}
            />
          </div>

          {/* PH */}

          <div style={field}>
            <label style={label}>
              <Droplets size={15} />
              <span>pH</span>
            </label>

            <input
              className="water-test-input"
              type="number"
              step="0.1"
              min="0"
              max="14"
              placeholder="e.g. 7.2"
              value={ph}
              onChange={(e) =>
                setPh(e.target.value)
              }
              style={input}
            />

            <span style={fieldHint}>
              Recommended scale: 0 – 14
            </span>
          </div>

          {/* CHLORINE */}

          <div style={field}>
            <label style={label}>
              <TestTube2 size={15} />
              <span>Chlorine</span>
            </label>

            <input
              className="water-test-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 1"
              value={chlorine}
              onChange={(e) =>
                setChlorine(e.target.value)
              }
              style={input}
            />

            <span style={fieldHint}>
              Enter chlorine measurement
            </span>
          </div>

          {/* TEMPERATURE */}

          <div style={field}>
            <label style={label}>
              <Thermometer size={15} />
              <span>Temperature</span>
            </label>

            <input
              className="water-test-input"
              type="number"
              step="0.1"
              placeholder="e.g. 20.5"
              value={temperature}
              onChange={(e) =>
                setTemperature(e.target.value)
              }
              style={input}
            />

            <span style={fieldHint}>
              Enter water temperature
            </span>
          </div>

          {/* TURBIDITY */}

          <div style={field}>
            <label style={label}>
              <Activity size={15} />
              <span>Turbidity</span>
            </label>

            <input
              className="water-test-input"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 2"
              value={turbidity}
              onChange={(e) =>
                setTurbidity(e.target.value)
              }
              style={input}
            />

            <span style={fieldHint}>
              Enter turbidity measurement
            </span>
          </div>

          {/* TDS */}

          <div style={field}>
            <label style={label}>
              <Droplets size={15} />
              <span>TDS</span>
            </label>

            <input
              className="water-test-input"
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 90"
              value={tds}
              onChange={(e) =>
                setTds(e.target.value)
              }
              style={input}
            />

            <span style={fieldHint}>
              Total dissolved solids
            </span>
          </div>

          {/* STATUS */}

          <div style={field}>
            <label style={label}>
              <ClipboardCheck size={15} />
              <span>Test Status</span>
            </label>

            <select
              className="water-test-input"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              style={input}
            >
              <option value="PASS">
                PASS
              </option>

              <option value="FAIL">
                FAIL
              </option>
            </select>

            <span style={fieldHint}>
              Final quality result
            </span>
          </div>
        </div>

        {/* =================================================
            NOTES
        ================================================= */}

        <div style={fieldFull}>
          <label style={label}>
            <HelpCircle size={15} />
            <span>Observations / Notes</span>
          </label>

          <textarea
            className="water-test-textarea"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Enter observations or additional notes..."
            rows={4}
            style={textarea}
          />
        </div>

        {/* =================================================
            FORM BUTTONS
        ================================================= */}

        <div
          className="water-test-form-actions"
          style={formActions}
        >
          <button
            type="button"
            onClick={
              editingTestId
                ? cancelEdit
                : clearForm
            }
            disabled={submitting}
            style={cancelButton}
          >
            <X size={17} />

            {editingTestId
              ? "Cancel Edit"
              : "Clear"}
          </button>

          <button
            type="button"
            onClick={
              editingTestId
                ? updateWaterTest
                : createWaterTest
            }
            disabled={submitting}
            style={{
              ...primaryButton,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {editingTestId ? (
              <Edit3 size={17} />
            ) : (
              <Plus size={17} />
            )}

            {submitting
              ? editingTestId
                ? "Updating..."
                : "Saving..."
              : editingTestId
              ? "Update Water Test"
              : "Save Water Test"}
          </button>
        </div>
      </div>

      {/* =================================================
          HISTORY HEADER
      ================================================= */}

      <div
        className="water-test-history-header"
        style={historyHeader}
      >
        <div>
          <div style={historyTitleRow}>
            <Search size={20} />

            <h2
              className="water-test-history-title"
              style={historyTitle}
            >
              Water Test History
            </h2>
          </div>

          <p style={historySubtitle}>
            Search previous water quality test records.
          </p>
        </div>

        <div
          className="water-test-search"
          style={searchWrapper}
        >
          <Search
            size={17}
            style={searchIcon}
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by date, status, employee or notes..."
            style={searchInput}
          />
        </div>
      </div>

      {/* =================================================
          HISTORY CARD
      ================================================= */}

      <div
        className="water-test-history-card"
        style={historyCard}
      >
        <div style={historyCardHeader}>
          <div style={{ minWidth: 0 }}>
            <h2 style={historyCardTitle}>
              Previous Water Tests
            </h2>

            <p style={historyCardSubtitle}>
              Review previously recorded water quality
              results.
            </p>
          </div>

          <div style={recordCount}>
            {filteredTests.length}{" "}
            {filteredTests.length === 1
              ? "Record"
              : "Records"}
          </div>
        </div>

        {loading ? (
          <div style={emptyState}>
            <FlaskConical size={35} />

            <h3 style={emptyTitle}>
              Loading water tests...
            </h3>
          </div>
        ) : filteredTests.length === 0 ? (
          <div style={emptyState}>
            <FlaskConical size={40} />

            <h3 style={emptyTitle}>
              No Water Tests Found
            </h3>

            <p style={emptyText}>
              {search
                ? "No records match your search."
                : "No water quality tests have been recorded yet."}
            </p>
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>
                    Date
                  </th>

                  <th style={th}>
                    pH
                  </th>

                  <th style={th}>
                    Chlorine
                  </th>

                  <th style={th}>
                    Temperature
                  </th>

                  <th style={th}>
                    Turbidity
                  </th>

                  <th style={th}>
                    TDS
                  </th>

                  <th style={th}>
                    Status
                  </th>

                  <th style={th}>
                    Notes
                  </th>

                  <th
                    style={{
                      ...th,
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTests.map(
                  (test) => {
                    const testStatus =
                      String(
                        test.status || "PASS"
                      ).toUpperCase();

                    const isPass =
                      testStatus === "PASS";

                    return (
                      <tr key={test._id}>
                        <td style={td}>
                          {formatDate(
                            test.testDate
                          )}
                        </td>

                        <td style={td}>
                          {test.ph ?? "-"}
                        </td>

                        <td style={td}>
                          {test.chlorine ?? "-"}
                        </td>

                        <td style={td}>
                          {test.temperature ?? "-"}
                        </td>

                        <td style={td}>
                          {test.turbidity ?? "-"}
                        </td>

                        <td style={td}>
                          {test.tds ?? "-"}
                        </td>

                        <td style={td}>
                          <span
                            style={
                              isPass
                                ? passBadge
                                : failBadge
                            }
                          >
                            {isPass ? (
                              <CheckCircle2
                                size={13}
                              />
                            ) : (
                              <XCircle
                                size={13}
                              />
                            )}

                            {testStatus}
                          </span>
                        </td>

                        <td
                          style={{
                            ...td,
                            maxWidth: 220,
                            minWidth: 150,
                          }}
                        >
                          <span
                            style={notesText}
                            title={
                              test.notes ||
                              ""
                            }
                          >
                            {test.notes ||
                              "—"}
                          </span>
                        </td>

                        <td
                          style={{
                            ...td,
                            minWidth: 175,
                          }}
                        >
                          <div
                            style={
                              actionButtons
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(
                                  test
                                )
                              }
                              disabled={
                                submitting
                              }
                              style={
                                editButton
                              }
                            >
                              <Edit3
                                size={15}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteTest(
                                  test
                                )
                              }
                              disabled={
                                submitting
                              }
                              style={
                                deleteButton
                              }
                            >
                              <Trash2
                                size={15}
                              />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modal.open && (
        <div style={modalOverlay}>
          <div
            className="water-test-modal"
            style={modalCard}
          >
            <div
              style={{
                ...modalIcon,
                background:
                  modal.type === "success"
                    ? "#dcfce7"
                    : modal.type === "error"
                    ? "#fee2e2"
                    : modal.type === "warning"
                    ? "#fef3c7"
                    : "#dbeafe",

                color:
                  modal.type === "success"
                    ? "#16a34a"
                    : modal.type === "error"
                    ? "#dc2626"
                    : modal.type === "warning"
                    ? "#d97706"
                    : "#2563eb",
              }}
            >
              {getModalIcon()}
            </div>

            <h3 style={modalTitle}>
              {modal.title}
            </h3>

            <p style={modalMessage}>
              {modal.message}
            </p>

            <div
              className="water-test-modal-actions"
              style={modalActions}
            >
              {modal.cancelText && (
                <button
                  type="button"
                  onClick={closeModal}
                  style={modalCancel}
                >
                  {modal.cancelText}
                </button>
              )}

              <button
                type="button"
                onClick={
                  modal.onConfirm
                    ? handleModalConfirm
                    : closeModal
                }
                style={{
                  ...modalConfirm,
                  background:
                    modal.type === "error"
                      ? "#dc2626"
                      : modal.type === "warning"
                      ? "#d97706"
                      : "#2563eb",
                }}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          RESPONSIVE CSS
      ================================================= */}

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          /* ============================================
             TABLET
          ============================================ */

          @media (max-width: 1100px) {
            .water-test-summary {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .water-test-form-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          /* ============================================
             MOBILE
          ============================================ */

          @media (max-width: 768px) {
            .water-test-page {
              padding: 14px !important;
            }

            .water-test-page-header {
              align-items: flex-start !important;
              margin-bottom: 18px !important;
            }

            .water-test-header-icon {
              width: 45px !important;
              height: 45px !important;
              min-width: 45px !important;
              border-radius: 12px !important;
            }

            .water-test-page-title {
              font-size: 23px !important;
              line-height: 1.2 !important;
            }

            .water-test-page-subtitle {
              font-size: 11px !important;
              line-height: 1.45 !important;
              margin-top: 4px !important;
            }

            /* SUMMARY */

            .water-test-summary {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 10px !important;
              margin-bottom: 16px !important;
            }

            .water-test-summary > div {
              min-width: 0 !important;
              padding: 13px !important;
              gap: 9px !important;
              border-radius: 13px !important;
            }

            /* FORM */

            .water-test-card {
              padding: 16px !important;
              border-radius: 14px !important;
            }

            .water-test-form-grid {
              grid-template-columns: 1fr !important;
              gap: 14px !important;
            }

            .water-test-input {
              width: 100% !important;
              min-width: 0 !important;
              height: 44px !important;
              font-size: 13px !important;
            }

            .water-test-textarea {
              width: 100% !important;
              min-width: 0 !important;
              font-size: 13px !important;
            }

            .water-test-form-actions {
              flex-direction: column-reverse !important;
              width: 100% !important;
              gap: 9px !important;
            }

            .water-test-form-actions button {
              width: 100% !important;
              min-height: 44px !important;
            }

            /* EDIT BANNER */

            .water-test-edit-banner {
              padding: 11px !important;
              margin-bottom: 15px !important;
            }

            .water-test-edit-banner-icon {
              width: 36px !important;
              height: 36px !important;
              min-width: 36px !important;
            }

            /* HISTORY HEADER */

            .water-test-history-header {
              padding: 16px !important;
              margin-bottom: 15px !important;
              border-radius: 14px !important;
            }

            .water-test-search {
              max-width: none !important;
              width: 100% !important;
              margin-top: 13px !important;
            }

            /* HISTORY */

            .water-test-history-card {
              border-radius: 14px !important;
            }

            /* MODAL */

            .water-test-modal {
              width: calc(100% - 28px) !important;
              max-width: 400px !important;
              padding: 20px !important;
            }

            .water-test-modal-actions {
              flex-direction: column-reverse !important;
            }

            .water-test-modal-actions button {
              width: 100% !important;
            }
          }

          /* ============================================
             SMALL PHONES
          ============================================ */

          @media (max-width: 480px) {
            .water-test-page {
              padding: 11px !important;
            }

            .water-test-summary {
              grid-template-columns: 1fr 1fr !important;
              gap: 8px !important;
            }

            .water-test-summary > div {
              padding: 11px !important;
              gap: 8px !important;
            }

            .water-test-summary > div > div:first-child {
              width: 37px !important;
              height: 37px !important;
              min-width: 37px !important;
            }

            .water-test-page-title {
              font-size: 21px !important;
            }

            .water-test-page-subtitle {
              font-size: 10.5px !important;
            }

            .water-test-card {
              padding: 14px !important;
            }

            .water-test-card-title {
              font-size: 17px !important;
            }

            .water-test-card p {
              line-height: 1.4 !important;
            }

            .water-test-history-title {
              font-size: 17px !important;
            }

            .water-test-history-header {
              padding: 14px !important;
            }

            .water-test-history-card {
              padding: 0 !important;
            }
          }

          /* ============================================
             VERY SMALL PHONES
          ============================================ */

          @media (max-width: 360px) {
            .water-test-summary {
              grid-template-columns: 1fr !important;
            }

            .water-test-summary > div {
              width: 100% !important;
            }

            .water-test-page-title {
              font-size: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   PAGE STYLES
========================================================= */

const page = {
  width: "100%",
  maxWidth: "100%",
  minHeight: "100%",
  padding: "22px",
  boxSizing: "border-box",
  overflowX: "hidden",
  fontFamily: "Arial, sans-serif",
};

const pageHeader = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginBottom: 22,
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
};

const pageTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 28,
  fontWeight: 800,
};

const pageSubtitle = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: 13,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const summaryCard = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 15,
  padding: 17,
  display: "flex",
  alignItems: "center",
  gap: 13,
  minWidth: 0,
  boxShadow:
    "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const summaryIcon = {
  width: 43,
  height: 43,
  minWidth: 43,
  borderRadius: 11,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryContent = {
  minWidth: 0,
  flex: 1,
};

const summaryLabel = {
  margin: 0,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 600,
};

const summaryValue = {
  margin: "4px 0 0",
  color: "#0f172a",
  fontSize: 22,
  fontWeight: 800,
};

const card = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 21,
  marginBottom: 20,
  boxShadow:
    "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 18,
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
  justifyContent: "center",
};

const cardTitle = {
  margin: 0,
  fontSize: 19,
  color: "#0f172a",
  fontWeight: 800,
};

const cardSubtitle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 12,
};

const editBanner = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  padding: 14,
  borderRadius: 14,
  marginBottom: 18,
  boxSizing: "border-box",
};

const editBannerIcon = {
  width: 40,
  height: 40,
  minWidth: 40,
  borderRadius: 10,
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const editBannerTitle = {
  margin: 0,
  fontSize: 14,
  fontWeight: 800,
  color: "#1e3a8a",
};

const editBannerText = {
  margin: "3px 0 0",
  fontSize: 12,
  lineHeight: 1.5,
  color: "#475569",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: 16,
};

const field = {
  minWidth: 0,
};

const fieldFull = {
  marginTop: 17,
  width: "100%",
};

const label = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 7,
  color: "#334155",
  fontSize: 12,
  fontWeight: 700,
};

const input = {
  width: "100%",
  minWidth: 0,
  height: 43,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "0 12px",
  outline: "none",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13,
  boxSizing: "border-box",
};

const textarea = {
  width: "100%",
  minWidth: 0,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: 12,
  outline: "none",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 13,
  resize: "vertical",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const fieldHint = {
  display: "block",
  marginTop: 5,
  color: "#94a3b8",
  fontSize: 10,
  lineHeight: 1.3,
};

const formActions = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,
  marginTop: 19,
};

const cancelButton = {
  border: "none",
  background: "#e2e8f0",
  color: "#334155",
  padding: "11px 17px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const primaryButton = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "11px 18px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

const historyHeader = {
  background: "#0f172a",
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  color: "#ffffff",
};

const historyTitleRow = {
  display: "flex",
  alignItems: "center",
  gap: 9,
};

const historyTitle = {
  margin: 0,
  fontSize: 19,
  fontWeight: 800,
};

const historySubtitle = {
  margin: "5px 0 0 29px",
  color: "#94a3b8",
  fontSize: 12,
};

const searchWrapper = {
  position: "relative",
  width: "100%",
  maxWidth: 540,
  marginTop: 16,
};

const searchIcon = {
  position: "absolute",
  left: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
  pointerEvents: "none",
};

const searchInput = {
  width: "100%",
  height: 42,
  border: "1px solid #334155",
  borderRadius: 10,
  background: "#1e293b",
  color: "#ffffff",
  padding: "0 12px 0 39px",
  outline: "none",
  boxSizing: "border-box",
  fontSize: 12,
};

const historyCard = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: 20,
  boxShadow:
    "0 2px 8px rgba(15, 23, 42, 0.04)",
};

const historyCardHeader = {
  padding: "18px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 15,
  borderBottom: "1px solid #e2e8f0",
};

const historyCardTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 18,
  fontWeight: 800,
};

const historyCardSubtitle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 12,
};

const recordCount = {
  background: "#eff6ff",
  color: "#2563eb",
  borderRadius: 20,
  padding: "7px 11px",
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
};

const table = {
  width: "100%",
  minWidth: 1050,
  borderCollapse: "collapse",
};

const th = {
  background: "#0f172a",
  color: "#ffffff",
  padding: "12px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const td = {
  padding: "13px 12px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 12,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

const passBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "#dcfce7",
  color: "#15803d",
  borderRadius: 20,
  padding: "5px 9px",
  fontSize: 10,
  fontWeight: 800,
};

const failBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: 20,
  padding: "5px 9px",
  fontSize: 10,
  fontWeight: 800,
};

const notesText = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const actionButtons = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  flexWrap: "wrap",
};

const editButton = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  padding: "8px 11px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 11,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const deleteButton = {
  background: "#dc2626",
  color: "#ffffff",
  border: "none",
  padding: "8px 11px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 11,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const emptyState = {
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 30,
  color: "#64748b",
  textAlign: "center",
};

const emptyTitle = {
  margin: "12px 0 5px",
  color: "#334155",
  fontSize: 16,
};

const emptyText = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 12,
};

/* =========================================================
   MODAL
========================================================= */

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 9999,
  boxSizing: "border-box",
};

const modalCard = {
  width: "100%",
  maxWidth: 390,
  background: "#ffffff",
  borderRadius: 17,
  padding: 23,
  boxShadow:
    "0 20px 60px rgba(15, 23, 42, 0.25)",
};

const modalIcon = {
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
};

const modalTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 18,
  fontWeight: 800,
};

const modalMessage = {
  margin: "8px 0 0",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.55,
  wordBreak: "break-word",
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 9,
  marginTop: 20,
};

const modalCancel = {
  border: "none",
  background: "#e2e8f0",
  color: "#334155",
  padding: "9px 15px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const modalConfirm = {
  border: "none",
  color: "#ffffff",
  padding: "9px 16px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};