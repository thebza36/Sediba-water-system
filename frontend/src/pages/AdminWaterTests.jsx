import React, { useEffect, useMemo, useState } from "react";

import {
  FlaskConical,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Thermometer,
  Droplets,
  TestTube2,
  Activity,
  ClipboardCheck,
  X,
  CircleAlert,
  CircleCheck,
  Info,
  Users,
  RefreshCw,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const AdminWaterTests = () => {
  /* =====================================================
     STATE
  ===================================================== */

  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [editingTestId, setEditingTestId] = useState(null);

  /* =====================================================
     FORM STATE
  ===================================================== */

  const [testDate, setTestDate] = useState("");

  const [ph, setPh] = useState("");

  const [chlorine, setChlorine] = useState("");

  const [temperature, setTemperature] = useState("");

  const [turbidity, setTurbidity] = useState("");

  const [tds, setTds] = useState("");

  const [status, setStatus] = useState("PASS");

  const [notes, setNotes] = useState("");

  /* =====================================================
     MODAL STATE
  ===================================================== */

  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    action: null,
    testId: null,
  });

  /* =====================================================
     LOAD TESTS
  ===================================================== */

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API}/water-tests/admin/all`,
        {
          method: "GET",
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
            "Failed to load water tests."
        );
      }

      if (Array.isArray(data)) {
        setTests(data);
      } else if (Array.isArray(data?.tests)) {
        setTests(data.tests);
      } else {
        setTests([]);
      }
    } catch (error) {
      console.error(
        "Load admin water tests error:",
        error
      );

      showModal(
        "error",
        "Loading Failed",
        error.message ||
          "Unable to load water tests."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tests.filter((test) => {
      const employeeName = String(
        test.employeeName ||
          test.employee?.name ||
          test.employee?.fullName ||
          "Unknown Employee"
      ).toLowerCase();

      const testStatus = String(
        test.status || ""
      ).toLowerCase();

      const notesValue = String(
        test.notes || ""
      ).toLowerCase();

      const dateValue = test.testDate
        ? new Date(test.testDate)
            .toLocaleDateString("en-ZA")
            .toLowerCase()
        : "";

      const matchesSearch =
        !query ||
        employeeName.includes(query) ||
        testStatus.includes(query) ||
        notesValue.includes(query) ||
        dateValue.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        testStatus ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    tests,
    search,
    statusFilter,
  ]);

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

  const uniqueEmployees =
    new Set(
      tests.map((test) =>
        String(
          test.employeeName ||
            test.employee?.name ||
            test.employee?.fullName ||
            "Unknown Employee"
        )
      )
    ).size;

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
     START EDIT
  ===================================================== */

  const startEdit = (test) => {
    setEditingTestId(test._id);

    let formattedDate = "";

    if (test.testDate) {
      const date =
        new Date(test.testDate);

      if (!Number.isNaN(date.getTime())) {
        formattedDate =
          date.toISOString().split("T")[0];
      }
    }

    setTestDate(formattedDate);

    setPh(
      test.ph !== undefined &&
        test.ph !== null
        ? String(test.ph)
        : ""
    );

    setChlorine(
      test.chlorine !== undefined &&
        test.chlorine !== null
        ? String(test.chlorine)
        : ""
    );

    setTemperature(
      test.temperature !== undefined &&
        test.temperature !== null
        ? String(test.temperature)
        : ""
    );

    setTurbidity(
      test.turbidity !== undefined &&
        test.turbidity !== null
        ? String(test.turbidity)
        : ""
    );

    setTds(
      test.tds !== undefined &&
        test.tds !== null
        ? String(test.tds)
        : ""
    );

    const testStatus =
      String(
        test.status || "PASS"
      ).toUpperCase();

    setStatus(
      testStatus === "FAIL"
        ? "FAIL"
        : "PASS"
    );

    setNotes(
      test.notes || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     CANCEL EDIT
  ===================================================== */

  const cancelEdit = () => {
    setEditingTestId(null);

    clearForm();
  };

  /* =====================================================
     VALIDATE FORM
  ===================================================== */

  const validateForm = () => {
    if (!testDate) {
      showModal(
        "warning",
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
      showModal(
        "warning",
        "Missing Measurements",
        "Please enter all water quality measurements."
      );

      return false;
    }

    const numbers = [
      ph,
      chlorine,
      temperature,
      turbidity,
      tds,
    ];

    const hasInvalidNumber =
      numbers.some(
        (value) =>
          value === "" ||
          Number.isNaN(Number(value))
      );

    if (hasInvalidNumber) {
      showModal(
        "warning",
        "Invalid Measurements",
        "Please enter valid numbers for all measurements."
      );

      return false;
    }

    if (
      Number(ph) < 0 ||
      Number(ph) > 14
    ) {
      showModal(
        "warning",
        "Invalid pH",
        "pH must be between 0 and 14."
      );

      return false;
    }

    if (Number(chlorine) < 0) {
      showModal(
        "warning",
        "Invalid Chlorine",
        "Chlorine cannot be negative."
      );

      return false;
    }

    if (Number(turbidity) < 0) {
      showModal(
        "warning",
        "Invalid Turbidity",
        "Turbidity cannot be negative."
      );

      return false;
    }

    if (Number(tds) < 0) {
      showModal(
        "warning",
        "Invalid TDS",
        "TDS cannot be negative."
      );

      return false;
    }

    if (
      status !== "PASS" &&
      status !== "FAIL"
    ) {
      showModal(
        "warning",
        "Invalid Status",
        "Please select PASS or FAIL."
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

      status: String(
        status
      ).toUpperCase(),

      notes: notes.trim(),
    };
  };

  /* =====================================================
     UPDATE WATER TEST
  ===================================================== */

  const updateWaterTest = () => {
    if (!editingTestId) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setModal({
      open: true,
      type: "info",
      title: "Update Water Test?",
      message:
        "Are you sure you want to update this water test record?",
      action: "update",
      testId: editingTestId,
    });
  };

  /* =====================================================
     CONFIRM UPDATE
  ===================================================== */

  const confirmUpdate = async () => {
    try {
      setSubmitting(true);

      closeModal();

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API}/water-tests/admin/${editingTestId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            getFormData()
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update water test."
        );
      }

      setEditingTestId(null);

      clearForm();

      await loadTests();

      showModal(
        "success",
        "Water Test Updated",
        "The water test was updated successfully."
      );
    } catch (error) {
      console.error(
        "Update admin water test error:",
        error
      );

      showModal(
        "error",
        "Update Failed",
        error.message ||
          "Failed to update water test."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     DELETE WATER TEST
  ===================================================== */

  const deleteTest = (test) => {
    setModal({
      open: true,
      type: "error",
      title: "Delete Water Test?",
      message:
        "This water test record will be permanently deleted. This action cannot be undone.",
      action: "delete",
      testId: test._id,
    });
  };

  /* =====================================================
     CONFIRM DELETE
  ===================================================== */

  const confirmDelete = async () => {
    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `${API}/water-tests/admin/${modal.testId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to delete water test."
        );
      }

      if (
        editingTestId ===
        modal.testId
      ) {
        setEditingTestId(null);

        clearForm();
      }

      closeModal();

      await loadTests();

      showModal(
        "success",
        "Water Test Deleted",
        "The water test was deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete admin water test error:",
        error
      );

      showModal(
        "error",
        "Delete Failed",
        error.message ||
          "Failed to delete water test."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     MODAL HELPERS
  ===================================================== */

  const showModal = (
    type,
    title,
    message
  ) => {
    setModal({
      open: true,
      type,
      title,
      message,
      action: null,
      testId: null,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: "info",
      title: "",
      message: "",
      action: null,
      testId: null,
    });
  };

  const handleModalAction = () => {
    if (
      modal.action === "update"
    ) {
      confirmUpdate();

      return;
    }

    if (
      modal.action === "delete"
    ) {
      confirmDelete();

      return;
    }

    closeModal();
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-ZA",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     EMPLOYEE NAME
  ===================================================== */

  const getEmployeeName = (test) => {
    return (
      test.employeeName ||
      test.employee?.name ||
      test.employee?.fullName ||
      "Unknown Employee"
    );
  };

  /* =====================================================
     STATUS
  ===================================================== */

  const getStatus = (test) => {
    return String(
      test.status || ""
    ).toUpperCase();
  };

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  const StatusBadge = ({ test }) => {
    const currentStatus =
      getStatus(test);

    if (
      currentStatus === "PASS"
    ) {
      return (
        <span
          className="water-status-badge water-status-pass"
        >
          <CheckCircle2
            size={15}
          />
          PASS
        </span>
      );
    }

    return (
      <span
        className="water-status-badge water-status-fail"
      >
        <XCircle
          size={15}
        />
        FAIL
      </span>
    );
  };

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  const EmptyState = () => {
    return (
      <div className="water-empty-state">
        <div className="water-empty-icon">
          <FlaskConical
            size={38}
          />
        </div>

        <h3>
          No Water Tests Found
        </h3>

        <p>
          There are no water test
          records matching your
          current search or filter.
        </p>

        {(search ||
          statusFilter !==
            "all") && (
          <button
            type="button"
            className="water-clear-filter-btn"
            onClick={() => {
              setSearch("");

              setStatusFilter(
                "all"
              );
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <div className="admin-water-tests-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="water-page-header">

          <div className="water-page-heading">

            <div className="water-page-icon">
              <FlaskConical
                size={30}
              />
            </div>

            <div>
              <h1>
                Water Tests
              </h1>

              <p>
                Monitor and manage
                employee water quality
                tests.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="water-refresh-button"
            onClick={loadTests}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "water-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* =================================================
            EDIT BANNER
        ================================================= */}

        {editingTestId && (
          <div className="water-edit-banner">

            <div className="water-edit-banner-left">

              <Edit3
                size={20}
              />

              <div>
                <strong>
                  Editing Water Test
                </strong>

                <span>
                  Make your changes
                  below and click
                  Update Water Test.
                </span>
              </div>

            </div>

            <button
              type="button"
              onClick={cancelEdit}
              className="water-cancel-edit-button"
            >
              <X size={17} />

              Cancel Edit
            </button>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="water-summary-grid">

          {/* TOTAL */}

          <div className="water-summary-card">

            <div className="water-summary-icon water-blue">
              <FlaskConical
                size={23}
              />
            </div>

            <div>
              <span>
                Total Tests
              </span>

              <strong>
                {totalTests}
              </strong>
            </div>

          </div>

          {/* PASSED */}

          <div className="water-summary-card">

            <div className="water-summary-icon water-green">
              <CheckCircle2
                size={23}
              />
            </div>

            <div>
              <span>
                Passed
              </span>

              <strong>
                {passedTests}
              </strong>
            </div>

          </div>

          {/* FAILED */}

          <div className="water-summary-card">

            <div className="water-summary-icon water-red">
              <XCircle
                size={23}
              />
            </div>

            <div>
              <span>
                Failed
              </span>

              <strong>
                {failedTests}
              </strong>
            </div>

          </div>

          {/* EMPLOYEES */}

          <div className="water-summary-card">

            <div className="water-summary-icon water-purple">
              <Users
                size={23}
              />
            </div>

            <div>
              <span>
                Employees Tested
              </span>

              <strong>
                {uniqueEmployees}
              </strong>
            </div>

          </div>

        </div>

        {/* =================================================
            EDIT FORM
        ================================================= */}

        {editingTestId && (
          <div className="water-form-card">

            <div className="water-card-heading">

              <div className="water-card-heading-icon">
                <Edit3
                  size={20}
                />
              </div>

              <div>
                <h2>
                  Edit Water Test
                </h2>

                <p>
                  Update the selected
                  employee water quality
                  record.
                </p>
              </div>

            </div>

            <div className="water-form-grid">

              {/* DATE */}

              <div className="water-field">

                <label>
                  Test Date
                </label>

                <div className="water-input-wrapper">

                  <Calendar
                    size={18}
                  />

                  <input
                    type="date"
                    value={
                      testDate
                    }
                    onChange={(e) =>
                      setTestDate(
                        e.target
                          .value
                      )
                    }
                  />

                </div>

              </div>

              {/* PH */}

              <div className="water-field">

                <label>
                  pH
                </label>

                <div className="water-input-wrapper">

                  <Activity
                    size={18}
                  />

                  <input
                    type="number"
                    min="0"
                    max="14"
                    step="0.01"
                    value={ph}
                    onChange={(e) =>
                      setPh(
                        e.target
                          .value
                      )
                    }
                    placeholder="0 - 14"
                  />

                </div>

              </div>

              {/* CHLORINE */}

              <div className="water-field">

                <label>
                  Chlorine
                </label>

                <div className="water-input-wrapper">

                  <Droplets
                    size={18}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      chlorine
                    }
                    onChange={(e) =>
                      setChlorine(
                        e.target
                          .value
                      )
                    }
                    placeholder="Chlorine"
                  />

                </div>

              </div>

              {/* TEMPERATURE */}

              <div className="water-field">

                <label>
                  Temperature
                </label>

                <div className="water-input-wrapper">

                  <Thermometer
                    size={18}
                  />

                  <input
                    type="number"
                    step="0.01"
                    value={
                      temperature
                    }
                    onChange={(e) =>
                      setTemperature(
                        e.target
                          .value
                      )
                    }
                    placeholder="Temperature"
                  />

                </div>

              </div>

              {/* TURBIDITY */}

              <div className="water-field">

                <label>
                  Turbidity
                </label>

                <div className="water-input-wrapper">

                  <TestTube2
                    size={18}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      turbidity
                    }
                    onChange={(e) =>
                      setTurbidity(
                        e.target
                          .value
                      )
                    }
                    placeholder="Turbidity"
                  />

                </div>

              </div>

              {/* TDS */}

              <div className="water-field">

                <label>
                  TDS
                </label>

                <div className="water-input-wrapper">

                  <Droplets
                    size={18}
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tds}
                    onChange={(e) =>
                      setTds(
                        e.target
                          .value
                      )
                    }
                    placeholder="TDS"
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="water-field">

                <label>
                  Status
                </label>

                <div className="water-input-wrapper">

                  {status ===
                  "PASS" ? (
                    <CheckCircle2
                      size={18}
                    />
                  ) : (
                    <XCircle
                      size={18}
                    />
                  )}

                  <select
                    value={
                      status
                    }
                    onChange={(e) =>
                      setStatus(
                        e.target
                          .value
                      )
                    }
                  >
                    <option value="PASS">
                      PASS
                    </option>

                    <option value="FAIL">
                      FAIL
                    </option>
                  </select>

                </div>

              </div>

            </div>

            {/* NOTES */}

            <div className="water-field water-notes-field">

              <label>
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target
                      .value
                  )
                }
                placeholder="Enter any additional notes..."
                rows={4}
              />

            </div>

            {/* FORM ACTIONS */}

            <div className="water-form-actions">

              <button
                type="button"
                className="water-secondary-button"
                onClick={
                  cancelEdit
                }
                disabled={
                  submitting
                }
              >
                <X size={18} />

                Cancel
              </button>

              <button
                type="button"
                className="water-primary-button"
                onClick={
                  updateWaterTest
                }
                disabled={
                  submitting
                }
              >
                <ClipboardCheck
                  size={18}
                />

                {submitting
                  ? "Updating..."
                  : "Update Water Test"}
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="water-search-card">

          <div className="water-search-wrapper">

            <Search
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search employee, date, status or notes..."
            />

            {search && (
              <button
                type="button"
                className="water-clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                <X size={17} />
              </button>
            )}

          </div>

          <div className="water-filter-wrapper">

            <label>
              Status
            </label>

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Statuses
              </option>

              <option value="pass">
                PASS
              </option>

              <option value="fail">
                FAIL
              </option>
            </select>

          </div>

        </div>

        {/* =================================================
            RESULTS INFORMATION
        ================================================= */}

        <div className="water-results-info">

          <div>
            Showing{" "}
            <strong>
              {filteredTests.length}
            </strong>{" "}
            of{" "}
            <strong>
              {tests.length}
            </strong>{" "}
            water tests
          </div>

          {(search ||
            statusFilter !==
              "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");

                setStatusFilter(
                  "all"
                );
              }}
            >
              Clear filters
            </button>
          )}

        </div>

        {/* =================================================
            WATER TEST HISTORY
        ================================================= */}

        <div className="water-history-card">

          <div className="water-history-header">

            <div className="water-card-heading">

              <div className="water-card-heading-icon">
                <ClipboardCheck
                  size={20}
                />
              </div>

              <div>
                <h2>
                  Water Test History
                </h2>

                <p>
                  All water quality
                  tests recorded by
                  employees.
                </p>
              </div>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="water-loading">

              <div className="water-loading-spinner">
                <RefreshCw
                  size={30}
                  className="water-spin"
                />
              </div>

              <p>
                Loading water tests...
              </p>

            </div>
          ) : filteredTests.length ===
            0 ? (
            <EmptyState />
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="water-desktop-table">

                <div className="water-table-scroll">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Employee
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          pH
                        </th>

                        <th>
                          Chlorine
                        </th>

                        <th>
                          Temperature
                        </th>

                        <th>
                          Turbidity
                        </th>

                        <th>
                          TDS
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Notes
                        </th>

                        <th>
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredTests.map(
                        (test) => (
                          <tr
                            key={
                              test._id
                            }
                          >

                            <td>

                              <div className="water-employee-cell">

                                <div className="water-employee-avatar">
                                  <Users
                                    size={16}
                                  />
                                </div>

                                <span>
                                  {getEmployeeName(
                                    test
                                  )}
                                </span>

                              </div>

                            </td>

                            <td>
                              <div className="water-date-cell">

                                <Calendar
                                  size={15}
                                />

                                {formatDate(
                                  test.testDate
                                )}

                              </div>
                            </td>

                            <td>
                              <strong>
                                {test.ph ??
                                  "—"}
                              </strong>
                            </td>

                            <td>
                              {test.chlorine ??
                                "—"}
                            </td>

                            <td>
                              {test.temperature ??
                                "—"}
                            </td>

                            <td>
                              {test.turbidity ??
                                "—"}
                            </td>

                            <td>
                              {test.tds ??
                                "—"}
                            </td>

                            <td>
                              <StatusBadge
                                test={
                                  test
                                }
                              />
                            </td>

                            <td>

                              <span className="water-notes-cell">
                                {test.notes ||
                                  "—"}
                              </span>

                            </td>

                            <td>

                              <div className="water-table-actions">

                                <button
                                  type="button"
                                  className="water-edit-button"
                                  onClick={() =>
                                    startEdit(
                                      test
                                    )
                                  }
                                  title="Edit water test"
                                >
                                  <Edit3
                                    size={16}
                                  />

                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="water-delete-button"
                                  onClick={() =>
                                    deleteTest(
                                      test
                                    )
                                  }
                                  title="Delete water test"
                                >
                                  <Trash2
                                    size={16}
                                  />

                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="water-mobile-list">

                {filteredTests.map(
                  (test) => (
                    <div
                      className="water-mobile-test-card"
                      key={
                        test._id
                      }
                    >

                      {/* MOBILE HEADER */}

                      <div className="water-mobile-card-header">

                        <div className="water-mobile-employee">

                          <div className="water-employee-avatar">
                            <Users
                              size={17}
                            />
                          </div>

                          <div>

                            <strong>
                              {getEmployeeName(
                                test
                              )}
                            </strong>

                            <span>
                              {formatDate(
                                test.testDate
                              )}
                            </span>

                          </div>

                        </div>

                        <StatusBadge
                          test={
                            test
                          }
                        />

                      </div>

                      {/* MEASUREMENTS */}

                      <div className="water-mobile-measurements">

                        <div className="water-mobile-measurement">

                          <span>
                            pH
                          </span>

                          <strong>
                            {test.ph ??
                              "—"}
                          </strong>

                        </div>

                        <div className="water-mobile-measurement">

                          <span>
                            Chlorine
                          </span>

                          <strong>
                            {test.chlorine ??
                              "—"}
                          </strong>

                        </div>

                        <div className="water-mobile-measurement">

                          <span>
                            Temperature
                          </span>

                          <strong>
                            {test.temperature ??
                              "—"}
                          </strong>

                        </div>

                        <div className="water-mobile-measurement">

                          <span>
                            Turbidity
                          </span>

                          <strong>
                            {test.turbidity ??
                              "—"}
                          </strong>

                        </div>

                        <div className="water-mobile-measurement">

                          <span>
                            TDS
                          </span>

                          <strong>
                            {test.tds ??
                              "—"}
                          </strong>

                        </div>

                      </div>

                      {/* NOTES */}

                      {test.notes && (
                        <div className="water-mobile-notes">

                          <span>
                            Notes
                          </span>

                          <p>
                            {test.notes}
                          </p>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="water-mobile-actions">

                        <button
                          type="button"
                          className="water-edit-button"
                          onClick={() =>
                            startEdit(
                              test
                            )
                          }
                        >
                          <Edit3
                            size={17}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          className="water-delete-button"
                          onClick={() =>
                            deleteTest(
                              test
                            )
                          }
                        >
                          <Trash2
                            size={17}
                          />

                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            </>
          )}

        </div>

      </div>

      {/* =====================================================
          CONFIRMATION / INFORMATION MODAL
      ===================================================== */}

      {modal.open && (
        <div
          className="water-modal-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget &&
              !submitting
            ) {
              closeModal();
            }
          }}
        >

          <div className="water-modal">

            {/* MODAL ICON */}

            <div
              className={`water-modal-icon ${
                modal.type ===
                "success"
                  ? "water-modal-success"
                  : modal.type ===
                    "error"
                  ? "water-modal-error"
                  : modal.type ===
                    "warning"
                  ? "water-modal-warning"
                  : "water-modal-info"
              }`}
            >

              {modal.type ===
              "success" ? (
                <CircleCheck
                  size={24}
                />
              ) : modal.type ===
                "error" ? (
                <CircleAlert
                  size={24}
                />
              ) : modal.type ===
                "warning" ? (
                <CircleAlert
                  size={24}
                />
              ) : (
                <Info
                  size={24}
                />
              )}

            </div>

            {/* MODAL TITLE */}

            <h2>
              {modal.title}
            </h2>

            {/* MODAL MESSAGE */}

            <p>
              {modal.message}
            </p>

            {/* MODAL ACTIONS */}

            <div className="water-modal-actions">

              {modal.action && (
                <button
                  type="button"
                  className={
                    modal.action ===
                    "delete"
                      ? "water-modal-danger-button"
                      : "water-modal-primary-button"
                  }
                  onClick={
                    handleModalAction
                  }
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Please wait..."
                    : modal.action ===
                      "delete"
                    ? "Delete"
                    : "Update"}
                </button>
              )}

              <button
                type="button"
                className={
                  modal.action
                    ? "water-modal-secondary-button"
                    : "water-modal-primary-button"
                }
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
              >
                {modal.action
                  ? "Cancel"
                  : "OK"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-water-tests-page {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          color: #172033;
        }

        /* =================================================
           PAGE HEADER
        ================================================= */

        .water-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .water-page-heading {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .water-page-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #e0f2fe;
          color: #0284c7;
        }

        .water-page-heading h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 800;
          color: #172033;
        }

        .water-page-heading p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .water-refresh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #d7dee8;
          background: #ffffff;
          color: #334155;
          border-radius: 10px;
          padding: 10px 15px;
          min-height: 42px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
          white-space: nowrap;
        }

        .water-refresh-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .water-refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .water-spin {
          animation: waterSpin 0.9s linear infinite;
        }

        @keyframes waterSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* =================================================
           EDIT BANNER
        ================================================= */

        .water-edit-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 15px 17px;
          margin-bottom: 20px;
          border: 1px solid #bfdbfe;
          border-radius: 13px;
          background: #eff6ff;
          color: #1e40af;
        }

        .water-edit-banner-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .water-edit-banner-left > svg {
          flex: 0 0 auto;
        }

        .water-edit-banner-left div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .water-edit-banner-left strong {
          font-size: 14px;
        }

        .water-edit-banner-left span {
          font-size: 13px;
          color: #475569;
        }

        .water-cancel-edit-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          background: transparent;
          color: #1d4ed8;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        /* =================================================
           SUMMARY
        ================================================= */

        .water-summary-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .water-summary-card {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
          box-shadow:
            0 2px 8px
              rgba(15, 23, 42, 0.04);
        }

        .water-summary-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .water-blue {
          background: #dbeafe;
          color: #2563eb;
        }

        .water-green {
          background: #dcfce7;
          color: #16a34a;
        }

        .water-red {
          background: #fee2e2;
          color: #dc2626;
        }

        .water-purple {
          background: #f3e8ff;
          color: #9333ea;
        }

        .water-summary-card > div:last-child {
          min-width: 0;
        }

        .water-summary-card span {
          display: block;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .water-summary-card strong {
          display: block;
          color: #172033;
          font-size: 23px;
          line-height: 1.1;
        }

        /* =================================================
           FORM
        ================================================= */

        .water-form-card {
          margin-bottom: 22px;
          padding: 22px;
          border: 1px solid #bfdbfe;
          border-radius: 15px;
          background: #ffffff;
          box-shadow:
            0 3px 12px
              rgba(15, 23, 42, 0.05);
        }

        .water-card-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .water-card-heading-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #e0f2fe;
          color: #0284c7;
        }

        .water-card-heading h2 {
          margin: 0;
          font-size: 18px;
          color: #172033;
        }

        .water-card-heading p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .water-form-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .water-field {
          min-width: 0;
        }

        .water-field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .water-input-wrapper {
          min-width: 0;
          height: 46px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #d8dee8;
          border-radius: 10px;
          background: #ffffff;
          color: #64748b;
          transition: 0.2s ease;
        }

        .water-input-wrapper:focus-within {
          border-color: #38bdf8;
          box-shadow:
            0 0 0 3px
              rgba(56, 189, 248, 0.12);
        }

        .water-input-wrapper input,
        .water-input-wrapper select {
          width: 100%;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #172033;
          font-size: 14px;
        }

        .water-input-wrapper select {
          cursor: pointer;
        }

        .water-notes-field {
          margin-top: 16px;
        }

        .water-notes-field textarea {
          width: 100%;
          resize: vertical;
          min-height: 95px;
          padding: 12px;
          border: 1px solid #d8dee8;
          border-radius: 10px;
          outline: none;
          color: #172033;
          background: #ffffff;
          font-family: inherit;
          font-size: 14px;
        }

        .water-notes-field textarea:focus {
          border-color: #38bdf8;
          box-shadow:
            0 0 0 3px
              rgba(56, 189, 248, 0.12);
        }

        .water-form-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .water-primary-button,
        .water-secondary-button {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 17px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .water-primary-button {
          border: 1px solid #0284c7;
          background: #0284c7;
          color: #ffffff;
        }

        .water-primary-button:hover {
          background: #0369a1;
        }

        .water-secondary-button {
          border: 1px solid #d8dee8;
          background: #ffffff;
          color: #334155;
        }

        .water-secondary-button:hover {
          background: #f8fafc;
        }

        .water-primary-button:disabled,
        .water-secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =================================================
           SEARCH
        ================================================= */

        .water-search-card {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
        }

        .water-search-wrapper {
          flex: 1;
          min-width: 0;
          height: 44px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #d8dee8;
          border-radius: 10px;
          color: #64748b;
        }

        .water-search-wrapper:focus-within {
          border-color: #38bdf8;
          box-shadow:
            0 0 0 3px
              rgba(56, 189, 248, 0.12);
        }

        .water-search-wrapper input {
          width: 100%;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          color: #172033;
          font-size: 14px;
        }

        .water-clear-search {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 7px;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
        }

        .water-filter-wrapper {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 0 0 auto;
        }

        .water-filter-wrapper label {
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .water-filter-wrapper select {
          height: 44px;
          min-width: 150px;
          padding: 0 11px;
          border: 1px solid #d8dee8;
          border-radius: 10px;
          background: #ffffff;
          color: #172033;
          outline: none;
          cursor: pointer;
        }

        /* =================================================
           RESULTS INFO
        ================================================= */

        .water-results-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          padding: 0 3px;
          color: #64748b;
          font-size: 13px;
        }

        .water-results-info strong {
          color: #334155;
        }

        .water-results-info button {
          border: 0;
          background: transparent;
          color: #0284c7;
          font-weight: 700;
          cursor: pointer;
        }

        /* =================================================
           HISTORY
        ================================================= */

        .water-history-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: #ffffff;
          box-shadow:
            0 3px 12px
              rgba(15, 23, 42, 0.04);
        }

        .water-history-header {
          padding: 19px 20px;
          border-bottom: 1px solid #e8edf3;
        }

        .water-desktop-table {
          width: 100%;
        }

        .water-table-scroll {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .water-table-scroll table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        .water-table-scroll th {
          padding: 13px 14px;
          text-align: left;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .water-table-scroll td {
          padding: 14px;
          border-bottom: 1px solid #edf1f5;
          color: #475569;
          font-size: 13px;
          vertical-align: middle;
        }

        .water-table-scroll tbody tr:hover {
          background: #fbfdff;
        }

        .water-table-scroll tbody tr:last-child td {
          border-bottom: 0;
        }

        .water-employee-cell {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 150px;
        }

        .water-employee-avatar {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
        }

        .water-employee-cell span {
          color: #172033;
          font-weight: 700;
        }

        .water-date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .water-status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .water-status-pass {
          background: #dcfce7;
          color: #15803d;
        }

        .water-status-fail {
          background: #fee2e2;
          color: #b91c1c;
        }

        .water-notes-cell {
          display: block;
          max-width: 190px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .water-table-actions {
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }

        .water-edit-button,
        .water-delete-button {
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .water-edit-button {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #2563eb;
        }

        .water-edit-button:hover {
          background: #dbeafe;
        }

        .water-delete-button {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #dc2626;
        }

        .water-delete-button:hover {
          background: #fee2e2;
        }

        /* =================================================
           MOBILE LIST
        ================================================= */

        .water-mobile-list {
          display: none;
        }

        /* =================================================
           LOADING
        ================================================= */

        .water-loading {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #64748b;
        }

        .water-loading-spinner {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
        }

        .water-loading p {
          margin: 0;
          font-size: 14px;
        }

        /* =================================================
           EMPTY STATE
        ================================================= */

        .water-empty-state {
          min-height: 300px;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .water-empty-icon {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          margin-bottom: 14px;
        }

        .water-empty-state h3 {
          margin: 0;
          color: #334155;
          font-size: 18px;
        }

        .water-empty-state p {
          max-width: 450px;
          margin: 7px 0 17px;
          color: #64748b;
          font-size: 14px;
        }

        .water-clear-filter-btn {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          color: #2563eb;
          padding: 9px 14px;
          border-radius: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        /* =================================================
           MODAL
        ================================================= */

        .water-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(
            15,
            23,
            42,
            0.52
          );
        }

        .water-modal {
          width: 100%;
          max-width: 430px;
          padding: 25px;
          border-radius: 16px;
          background: #ffffff;
          box-shadow:
            0 25px 70px
              rgba(15, 23, 42, 0.25);
          text-align: center;
        }

        .water-modal-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .water-modal-success {
          background: #dcfce7;
          color: #16a34a;
        }

        .water-modal-error {
          background: #fee2e2;
          color: #dc2626;
        }

        .water-modal-warning {
          background: #fef3c7;
          color: #d97706;
        }

        .water-modal-info {
          background: #dbeafe;
          color: #2563eb;
        }

        .water-modal h2 {
          margin: 0;
          color: #172033;
          font-size: 20px;
        }

        .water-modal p {
          margin: 10px 0 22px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.55;
        }

        .water-modal-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .water-modal-actions button {
          min-width: 105px;
          min-height: 42px;
          padding: 0 14px;
          border-radius: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .water-modal-primary-button {
          border: 1px solid #0284c7;
          background: #0284c7;
          color: #ffffff;
        }

        .water-modal-danger-button {
          border: 1px solid #dc2626;
          background: #dc2626;
          color: #ffffff;
        }

        .water-modal-secondary-button {
          border: 1px solid #d8dee8;
          background: #ffffff;
          color: #334155;
        }

        .water-modal-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {

          .water-summary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .water-form-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {

          .admin-water-tests-page {
            padding: 14px;
          }

          .water-page-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
          }

          .water-page-heading {
            width: 100%;
          }

          .water-page-icon {
            width: 50px;
            height: 50px;
            flex-basis: 50px;
          }

          .water-page-heading h1 {
            font-size: 25px;
          }

          .water-page-heading p {
            font-size: 13px;
            line-height: 1.4;
          }

          .water-refresh-button {
            width: 100%;
          }

          .water-edit-banner {
            align-items: flex-start;
            flex-direction: column;
          }

          .water-cancel-edit-button {
            width: 100%;
            min-height: 40px;
            border: 1px solid #bfdbfe;
            border-radius: 9px;
            background: #ffffff;
          }

          .water-summary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .water-summary-card {
            padding: 14px;
            gap: 9px;
          }

          .water-summary-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .water-summary-card span {
            font-size: 11px;
          }

          .water-summary-card strong {
            font-size: 20px;
          }

          .water-form-card {
            padding: 16px;
          }

          .water-form-grid {
            grid-template-columns: 1fr;
            gap: 13px;
          }

          .water-form-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .water-primary-button,
          .water-secondary-button {
            width: 100%;
          }

          .water-search-card {
            align-items: stretch;
            flex-direction: column;
            padding: 14px;
          }

          .water-search-wrapper {
            width: 100%;
          }

          .water-filter-wrapper {
            width: 100%;
            align-items: stretch;
            flex-direction: column;
            gap: 6px;
          }

          .water-filter-wrapper select {
            width: 100%;
          }

          .water-results-info {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          .water-desktop-table {
            display: none;
          }

          .water-mobile-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 14px;
          }

          .water-history-header {
            padding: 16px;
          }

          .water-mobile-test-card {
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: #ffffff;
          }

          .water-mobile-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            padding-bottom: 13px;
            border-bottom: 1px solid #edf1f5;
          }

          .water-mobile-employee {
            display: flex;
            align-items: center;
            gap: 9px;
            min-width: 0;
          }

          .water-mobile-employee > div:last-child {
            min-width: 0;
          }

          .water-mobile-employee strong {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #172033;
            font-size: 14px;
          }

          .water-mobile-employee span {
            display: block;
            margin-top: 3px;
            color: #64748b;
            font-size: 12px;
          }

          .water-mobile-measurements {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 9px;
            margin-top: 13px;
          }

          .water-mobile-measurement {
            padding: 10px;
            border-radius: 9px;
            background: #f8fafc;
          }

          .water-mobile-measurement span {
            display: block;
            margin-bottom: 4px;
            color: #64748b;
            font-size: 11px;
          }

          .water-mobile-measurement strong {
            display: block;
            color: #172033;
            font-size: 15px;
          }

          .water-mobile-notes {
            margin-top: 12px;
            padding: 10px;
            border-radius: 9px;
            background: #f8fafc;
          }

          .water-mobile-notes span {
            display: block;
            margin-bottom: 4px;
            color: #64748b;
            font-size: 11px;
            font-weight: 700;
          }

          .water-mobile-notes p {
            margin: 0;
            color: #475569;
            font-size: 12px;
            line-height: 1.5;
            overflow-wrap: anywhere;
          }

          .water-mobile-actions {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 13px;
            padding-top: 13px;
            border-top: 1px solid #edf1f5;
          }

          .water-mobile-actions button {
            width: 100%;
          }

          .water-status-badge {
            flex: 0 0 auto;
          }

        }

        /* =================================================
           SMALL PHONES
        ================================================= */

        @media (max-width: 420px) {

          .admin-water-tests-page {
            padding: 10px;
          }

          .water-summary-grid {
            grid-template-columns: 1fr;
          }

          .water-summary-card {
            padding: 13px;
          }

          .water-page-heading {
            gap: 10px;
          }

          .water-page-icon {
            width: 46px;
            height: 46px;
            flex-basis: 46px;
          }

          .water-page-heading h1 {
            font-size: 23px;
          }

          .water-card-heading h2 {
            font-size: 16px;
          }

          .water-card-heading p {
            font-size: 12px;
          }

          .water-mobile-test-card {
            padding: 13px;
          }

          .water-mobile-card-header {
            gap: 7px;
          }

          .water-mobile-employee strong {
            max-width: 150px;
          }

          .water-mobile-measurements {
            grid-template-columns: 1fr 1fr;
          }

          .water-modal-overlay {
            padding: 12px;
          }

          .water-modal {
            padding: 20px 16px;
          }

          .water-modal-actions {
            flex-direction: column-reverse;
          }

          .water-modal-actions button {
            width: 100%;
          }

        }

      `}</style>
    </>
  );
};

export default AdminWaterTests;