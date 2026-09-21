import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  UserRound,
  UserCog,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Search,
  X,
  Save,
  BriefcaseBusiness,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = `${import.meta.env.VITE_API_URL}/users`;

export default function AdminEmployees() {
  const { theme } = useContext(ThemeContext);

  /* =====================================================
     STATE
  ===================================================== */

  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const [editingId, setEditingId] = useState(null);

  const [msg, setMsg] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* =====================================================
     THEME HELPERS
  ===================================================== */

  const colors = {
    background: theme?.background || "#f5f7fb",
    card: theme?.card || "#ffffff",
    text: theme?.text || "#172033",
    secondaryText: theme?.secondaryText || "#64748b",
    primary: theme?.primary || "#2563eb",
    border: theme?.border || "#e2e8f0",
    input: theme?.input || "#ffffff",
    tableHeader: theme?.tableHeader || "#f8fafc",
    danger: "#dc2626",
    success: "#16a34a",
  };

  /* =====================================================
     LOAD EMPLOYEES
  ===================================================== */

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load employees");
      }

      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD EMPLOYEES ERROR:", error);

      setMessageType("error");
      setMsg("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* =====================================================
     MESSAGE
  ===================================================== */

  const showMessage = (message, type = "success") => {
    setMsg(message);
    setMessageType(type);

    setTimeout(() => {
      setMsg("");
    }, 4000);
  };

  /* =====================================================
     FILTER EMPLOYEES
  ===================================================== */

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return employees;
    }

    return employees.filter((employee) => {
      const employeeName = String(employee.name || "").toLowerCase();
      const employeeEmail = String(employee.email || "").toLowerCase();

      return (
        employeeName.includes(value) ||
        employeeEmail.includes(value)
      );
    });
  }, [employees, search]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalUsers = employees.length;

  const totalEmployees = employees.filter(
    (employee) => employee.role === "employee"
  ).length;

  const totalAdmins = employees.filter(
    (employee) => employee.role === "admin"
  ).length;

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * perPage;

    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* =====================================================
     FORM RESET
  ===================================================== */

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("employee");
    setEditingId(null);
    setShowPassword(false);
  };

  /* =====================================================
     EDIT EMPLOYEE
  ===================================================== */

  const editEmployee = (employee) => {
    setEditingId(employee._id || employee.id);
    setName(employee.name || "");
    setEmail(employee.email || "");
    setPassword("");
    setRole(employee.role || "employee");
    setShowPassword(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     SAVE EMPLOYEE
  ===================================================== */

  const saveEmployee = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      showMessage("Please enter the employee's full name.", "error");
      return;
    }

    if (!email.trim()) {
      showMessage("Please enter an email address.", "error");
      return;
    }

    if (!editingId && !password.trim()) {
      showMessage("Password is required for a new account.", "error");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const payload = {
        name: name.trim(),
        email: email.trim(),
        role,
      };

      if (password.trim()) {
        payload.password = password;
      }

      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/";
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to save employee."
        );
      }

      showMessage(
        editingId
          ? "Employee account updated successfully."
          : "Employee account created successfully.",
        "success"
      );

      resetForm();

      await loadEmployees();
    } catch (error) {
      console.error("SAVE EMPLOYEE ERROR:", error);

      showMessage(
        error.message || "Failed to save employee.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DISABLE EMPLOYEE
  ===================================================== */

  const deleteEmployee = async (id) => {
    const confirmed = window.confirm(
      "Disable employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/${id}/disable`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/";
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to disable employee."
        );
      }

      showMessage(
        "Employee account disabled successfully.",
        "success"
      );

      if (
        editingId &&
        String(editingId) === String(id)
      ) {
        resetForm();
      }

      await loadEmployees();
    } catch (error) {
      console.error("DISABLE EMPLOYEE ERROR:", error);

      showMessage(
        error.message || "Failed to disable employee.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials = (employeeName) => {
    if (!employeeName) {
      return "U";
    }

    const words = employeeName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  };

  /* =====================================================
     ROLE LABEL
  ===================================================== */

  const getRoleLabel = (employeeRole) => {
    return employeeRole === "admin"
      ? "Administrator"
      : "Employee";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="admin-employees-page"
      style={{
        minHeight: "100%",
        width: "100%",
        background: colors.background,
        color: colors.text,
        boxSizing: "border-box",
      }}
    >
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .admin-employees-page {
            width: 100%;
            overflow-x: hidden;
          }

          .employees-container {
            width: 100%;
            max-width: 1250px;
            margin: 0 auto;
            padding: 24px;
          }

          .employees-title-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }

          .employees-title-icon {
            width: 50px;
            height: 50px;
            min-width: 50px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .employees-title {
            margin: 0;
            font-size: clamp(24px, 3vw, 32px);
            line-height: 1.15;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .employees-subtitle {
            margin: 6px 0 0;
            font-size: 14px;
            line-height: 1.5;
          }

          .message-box {
            width: 100%;
            margin-bottom: 20px;
            padding: 13px 16px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 600;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 22px;
          }

          .stat-card {
            min-width: 0;
            border-radius: 16px;
            padding: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            min-width: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .stat-content {
            min-width: 0;
          }

          .stat-number {
            font-size: 25px;
            line-height: 1;
            font-weight: 800;
            margin-bottom: 6px;
          }

          .stat-label {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.3;
            opacity: 0.9;
          }

          .section-card {
            width: 100%;
            border-radius: 16px;
            border: 1px solid;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
            overflow: hidden;
          }

          .form-card {
            margin-bottom: 22px;
          }

          .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 20px 22px 16px;
          }

          .card-header-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .card-header-content {
            min-width: 0;
            flex: 1;
          }

          .card-title {
            margin: 0;
            font-size: 18px;
            line-height: 1.25;
            font-weight: 800;
          }

          .card-description {
            margin: 4px 0 0;
            font-size: 13px;
            line-height: 1.45;
          }

          .cancel-edit-button {
            flex-shrink: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 9px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
          }

          .form-content {
            padding: 4px 22px 22px;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px 16px;
          }

          .form-field {
            min-width: 0;
          }

          .form-label {
            display: flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.2;
            font-weight: 700;
          }

          .form-control {
            width: 100%;
            min-width: 0;
            height: 46px;
            padding: 0 13px;
            border: 1px solid;
            border-radius: 9px;
            outline: none;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .form-control:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          }

          .password-wrapper {
            position: relative;
            width: 100%;
          }

          .password-wrapper .form-control {
            padding-right: 46px;
          }

          .password-toggle {
            position: absolute;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
            width: 36px;
            height: 36px;
            border: none;
            background: transparent;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .form-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
          }

          .primary-button,
          .secondary-button {
            min-height: 44px;
            border-radius: 9px;
            padding: 0 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: inherit;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.15s, opacity 0.15s;
          }

          .primary-button:hover,
          .secondary-button:hover {
            transform: translateY(-1px);
          }

          .primary-button:disabled,
          .secondary-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .secondary-button {
            border: 1px solid;
            background: transparent;
          }

          .search-section {
            padding: 18px 22px;
            border-bottom: 1px solid;
          }

          .search-wrapper {
            position: relative;
            width: 100%;
          }

          .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
          }

          .search-input {
            width: 100%;
            height: 46px;
            border: 1px solid;
            border-radius: 9px;
            padding: 0 14px 0 42px;
            outline: none;
            font-size: 14px;
            font-family: inherit;
          }

          .search-input:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          }

          .table-container {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .employee-table {
            width: 100%;
            border-collapse: collapse;
          }

          .employee-table th {
            padding: 14px 18px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-weight: 800;
            white-space: nowrap;
          }

          .employee-table td {
            padding: 16px 18px;
            border-top: 1px solid;
            vertical-align: middle;
            font-size: 14px;
          }

          .employee-table th:last-child,
          .employee-table td:last-child {
            text-align: right;
          }

          .employee-info {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 190px;
          }

          .employee-avatar {
            width: 42px;
            height: 42px;
            min-width: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 800;
          }

          .employee-name {
            font-weight: 750;
            line-height: 1.3;
          }

          .employee-email {
            color: ${colors.secondaryText};
            font-size: 12px;
            margin-top: 3px;
            line-height: 1.3;
          }

          .role-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 750;
            white-space: nowrap;
          }

          .action-buttons {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .icon-action {
            min-height: 38px;
            border: 1px solid;
            border-radius: 8px;
            padding: 0 11px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            background: transparent;
          }

          .icon-action:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .mobile-list {
            display: none;
          }

          .employee-mobile-card {
            padding: 16px;
            border-bottom: 1px solid;
          }

          .employee-mobile-card:last-child {
            border-bottom: none;
          }

          .mobile-employee-top {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .mobile-employee-main {
            flex: 1;
            min-width: 0;
          }

          .mobile-employee-name {
            font-size: 15px;
            font-weight: 800;
            line-height: 1.3;
            overflow-wrap: anywhere;
          }

          .mobile-employee-email {
            margin-top: 4px;
            font-size: 12px;
            line-height: 1.4;
            overflow-wrap: anywhere;
          }

          .mobile-role {
            margin-top: 12px;
          }

          .mobile-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-top: 14px;
          }

          .mobile-actions button {
            width: 100%;
          }

          .empty-state {
            padding: 42px 20px;
            text-align: center;
          }

          .empty-icon {
            width: 50px;
            height: 50px;
            margin: 0 auto 12px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .empty-title {
            margin: 0;
            font-size: 15px;
            font-weight: 800;
          }

          .empty-description {
            margin: 6px auto 0;
            max-width: 400px;
            font-size: 13px;
            line-height: 1.5;
          }

          .pagination {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 18px;
            border-top: 1px solid;
            flex-wrap: wrap;
          }

          .pagination-info {
            font-size: 13px;
            line-height: 1.4;
          }

          .pagination-buttons {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
          }

          .page-button {
            min-width: 36px;
            height: 36px;
            padding: 0 9px;
            border-radius: 8px;
            border: 1px solid;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            background: transparent;
          }

          .page-button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          .page-button.active {
            color: white !important;
            border-color: ${colors.primary} !important;
            background: ${colors.primary} !important;
          }

          .loading-state {
            padding: 42px 20px;
            text-align: center;
            font-size: 14px;
          }

          @media (max-width: 900px) {
            .employees-container {
              padding: 20px;
            }

            .stats-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 12px;
            }

            .stat-card {
              padding: 15px;
              gap: 10px;
            }

            .stat-icon {
              width: 42px;
              height: 42px;
              min-width: 42px;
            }

            .stat-number {
              font-size: 22px;
            }

            .stat-label {
              font-size: 12px;
            }
          }

          @media (max-width: 767px) {
            .employees-container {
              padding: 16px 12px 24px;
            }

            .employees-title-row {
              align-items: flex-start;
              gap: 12px;
              margin-bottom: 20px;
            }

            .employees-title-icon {
              width: 44px;
              height: 44px;
              min-width: 44px;
              border-radius: 12px;
            }

            .employees-title {
              font-size: 25px;
            }

            .employees-subtitle {
              font-size: 13px;
              margin-top: 5px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
              gap: 10px;
              margin-bottom: 16px;
            }

            .stat-card {
              min-height: 72px;
              padding: 14px;
            }

            .stat-icon {
              width: 44px;
              height: 44px;
              min-width: 44px;
            }

            .stat-number {
              font-size: 22px;
            }

            .stat-label {
              font-size: 12px;
            }

            .section-card {
              border-radius: 13px;
            }

            .card-header {
              padding: 16px 15px 13px;
              align-items: flex-start;
            }

            .card-header-icon {
              width: 38px;
              height: 38px;
              min-width: 38px;
            }

            .card-title {
              font-size: 16px;
            }

            .card-description {
              font-size: 12px;
            }

            .cancel-edit-button {
              padding: 7px 8px;
              font-size: 12px;
            }

            .cancel-edit-button span {
              display: none;
            }

            .form-content {
              padding: 3px 15px 16px;
            }

            .form-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }

            .form-control {
              height: 46px;
            }

            .form-actions {
              display: grid;
              grid-template-columns: 1fr;
              gap: 9px;
              margin-top: 17px;
            }

            .primary-button,
            .secondary-button {
              width: 100%;
              min-height: 46px;
            }

            .search-section {
              padding: 14px 15px;
            }

            .table-container {
              display: none;
            }

            .mobile-list {
              display: block;
            }

            .pagination {
              padding: 13px 15px;
              justify-content: center;
            }

            .pagination-info {
              width: 100%;
              text-align: center;
            }

            .pagination-buttons {
              justify-content: center;
              width: 100%;
            }

            .page-button {
              min-width: 38px;
              height: 38px;
            }
          }

          @media (min-width: 768px) {
            .desktop-only {
              display: block;
            }

            .mobile-only {
              display: none;
            }
          }

          @media (max-width: 767px) {
            .desktop-only {
              display: none;
            }

            .mobile-only {
              display: block;
            }
          }

          @media (max-width: 420px) {
            .employees-title {
              font-size: 22px;
            }

            .employees-title-row {
              gap: 10px;
            }

            .employees-title-icon {
              width: 40px;
              height: 40px;
              min-width: 40px;
            }

            .mobile-actions {
              grid-template-columns: 1fr;
            }

            .action-buttons {
              width: 100%;
            }

            .icon-action {
              flex: 1;
            }

            .pagination-buttons {
              gap: 4px;
            }

            .page-button {
              min-width: 34px;
              padding: 0 7px;
            }
          }
        `}
      </style>

      <div className="employees-container">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="employees-title-row">
          <div
            className="employees-title-icon"
            style={{
              background: `${colors.primary}18`,
              color: colors.primary,
            }}
          >
            <Users size={27} />
          </div>

          <div>
            <h1
              className="employees-title"
              style={{ color: colors.primary }}
            >
              Employee Management
            </h1>

            <p
              className="employees-subtitle"
              style={{
                color: colors.secondaryText,
              }}
            >
              Manage employees, administrators, and
              account access.
            </p>
          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {msg && (
          <div
            className="message-box"
            style={{
              background:
                messageType === "error"
                  ? "#fee2e2"
                  : "#dcfce7",
              color:
                messageType === "error"
                  ? "#991b1b"
                  : "#166534",
              border:
                messageType === "error"
                  ? "1px solid #fecaca"
                  : "1px solid #bbf7d0",
            }}
          >
            {messageType === "error" ? (
              <XCircleIcon />
            ) : (
              <UserCheck size={18} />
            )}

            <span>{msg}</span>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="stats-grid">
          {/* TOTAL USERS */}
          <div
            className="stat-card"
            style={{
              background: colors.primary,
              color: "#ffffff",
            }}
          >
            <div
              className="stat-icon"
              style={{
                background: "rgba(255,255,255,0.16)",
              }}
            >
              <Users size={23} />
            </div>

            <div className="stat-content">
              <div className="stat-number">
                {totalUsers}
              </div>

              <div className="stat-label">
                Total Users
              </div>
            </div>
          </div>

          {/* EMPLOYEES */}
          <div
            className="stat-card"
            style={{
              background: colors.primary,
              color: "#ffffff",
            }}
          >
            <div
              className="stat-icon"
              style={{
                background: "rgba(255,255,255,0.16)",
              }}
            >
              <UserCog size={23} />
            </div>

            <div className="stat-content">
              <div className="stat-number">
                {totalEmployees}
              </div>

              <div className="stat-label">
                Employees
              </div>
            </div>
          </div>

          {/* ADMINS */}
          <div
            className="stat-card"
            style={{
              background: colors.primary,
              color: "#ffffff",
            }}
          >
            <div
              className="stat-icon"
              style={{
                background: "rgba(255,255,255,0.16)",
              }}
            >
              <ShieldCheck size={23} />
            </div>

            <div className="stat-content">
              <div className="stat-number">
                {totalAdmins}
              </div>

              <div className="stat-label">
                Administrators
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            CREATE / EDIT FORM
        ================================================= */}

        <div
          className="section-card form-card"
          style={{
            background: colors.card,
            borderColor: colors.border,
          }}
        >
          <div className="card-header">
            <div
              className="card-header-icon"
              style={{
                background: `${colors.primary}15`,
                color: colors.primary,
              }}
            >
              {editingId ? (
                <Edit3 size={21} />
              ) : (
                <UserPlus size={21} />
              )}
            </div>

            <div className="card-header-content">
              <h2
                className="card-title"
                style={{ color: colors.text }}
              >
                {editingId
                  ? "Edit Employee"
                  : "Create Employee"}
              </h2>

              <p
                className="card-description"
                style={{
                  color: colors.secondaryText,
                }}
              >
                {editingId
                  ? "Update the employee account details below."
                  : "Add a new employee or administrator account."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={resetForm}
                style={{
                  color: colors.secondaryText,
                }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form
            onSubmit={saveEmployee}
            className="form-content"
          >
            <div className="form-grid">
              {/* NAME */}
              <div className="form-field">
                <label
                  className="form-label"
                  style={{ color: colors.text }}
                >
                  <UserRound size={15} />
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter full name"
                  className="form-control"
                  style={{
                    background: colors.input,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                />
              </div>

              {/* EMAIL */}
              <div className="form-field">
                <label
                  className="form-label"
                  style={{ color: colors.text }}
                >
                  <Mail size={15} />
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter email address"
                  className="form-control"
                  style={{
                    background: colors.input,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                />
              </div>

              {/* PASSWORD */}
              <div className="form-field">
                <label
                  className="form-label"
                  style={{ color: colors.text }}
                >
                  <Lock size={15} />
                  Password
                </label>

                <div className="password-wrapper">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder={
                      editingId
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    className="form-control"
                    style={{
                      background: colors.input,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      color: colors.secondaryText,
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* ROLE */}
              <div className="form-field">
                <label
                  className="form-label"
                  style={{ color: colors.text }}
                >
                  <BriefcaseBusiness size={15} />
                  Account Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="form-control"
                  style={{
                    background: colors.input,
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                >
                  <option value="employee">
                    Employee
                  </option>

                  <option value="admin">
                    Administrator
                  </option>
                </select>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="form-actions">
              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                  style={{
                    color: colors.text,
                    borderColor: colors.border,
                  }}
                >
                  <X size={17} />
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
                style={{
                  background: colors.primary,
                  color: "#ffffff",
                  border: `1px solid ${colors.primary}`,
                }}
              >
                {saving ? (
                  <>
                    <Save size={17} />
                    Saving...
                  </>
                ) : editingId ? (
                  <>
                    <Save size={17} />
                    Update Employee
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create Employee
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* =================================================
            EMPLOYEE LIST
        ================================================= */}

        <div
          className="section-card"
          style={{
            background: colors.card,
            borderColor: colors.border,
          }}
        >
          {/* SEARCH */}
          <div
            className="search-section"
            style={{
              borderColor: colors.border,
            }}
          >
            <div className="search-wrapper">
              <Search
                size={18}
                className="search-icon"
                style={{
                  color: colors.secondaryText,
                }}
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name or email..."
                className="search-input"
                style={{
                  background: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                }}
              />
            </div>
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="desktop-only table-container">
            {loading ? (
              <div
                className="loading-state"
                style={{
                  color: colors.secondaryText,
                }}
              >
                Loading employees...
              </div>
            ) : paginatedEmployees.length === 0 ? (
              <div className="empty-state">
                <div
                  className="empty-icon"
                  style={{
                    background: `${colors.primary}12`,
                    color: colors.primary,
                  }}
                >
                  <Users size={24} />
                </div>

                <h3
                  className="empty-title"
                  style={{ color: colors.text }}
                >
                  No employees found
                </h3>

                <p
                  className="empty-description"
                  style={{
                    color: colors.secondaryText,
                  }}
                >
                  {search
                    ? "No accounts match your search."
                    : "There are currently no user accounts to display."}
                </p>
              </div>
            ) : (
              <table className="employee-table">
                <thead>
                  <tr
                    style={{
                      background: colors.tableHeader,
                      color: colors.secondaryText,
                    }}
                  >
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.map((employee) => {
                    const employeeId =
                      employee._id || employee.id;

                    return (
                      <tr key={employeeId}>
                        {/* NAME */}
                        <td
                          style={{
                            borderColor: colors.border,
                          }}
                        >
                          <div className="employee-info">
                            <div
                              className="employee-avatar"
                              style={{
                                background: `${colors.primary}15`,
                                color: colors.primary,
                              }}
                            >
                              {getInitials(employee.name)}
                            </div>

                            <div>
                              <div
                                className="employee-name"
                                style={{
                                  color: colors.text,
                                }}
                              >
                                {employee.name ||
                                  "Unnamed User"}
                              </div>

                              <div
                                className="employee-email"
                              >
                                Account
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td
                          style={{
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                        >
                          {employee.email || "—"}
                        </td>

                        {/* ROLE */}
                        <td
                          style={{
                            borderColor: colors.border,
                          }}
                        >
                          <span
                            className="role-badge"
                            style={{
                              background:
                                employee.role ===
                                "admin"
                                  ? "#ede9fe"
                                  : `${colors.primary}12`,
                              color:
                                employee.role ===
                                "admin"
                                  ? "#6d28d9"
                                  : colors.primary,
                            }}
                          >
                            {employee.role ===
                            "admin" ? (
                              <ShieldCheck size={14} />
                            ) : (
                              <UserCog size={14} />
                            )}

                            {getRoleLabel(
                              employee.role
                            )}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td
                          style={{
                            borderColor: colors.border,
                          }}
                        >
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="icon-action"
                              onClick={() =>
                                editEmployee(employee)
                              }
                              style={{
                                color: colors.primary,
                                borderColor: `${colors.primary}55`,
                                background: `${colors.primary}08`,
                              }}
                            >
                              <Edit3 size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="icon-action"
                              onClick={() =>
                                deleteEmployee(
                                  employeeId
                                )
                              }
                              disabled={
                                deletingId ===
                                employeeId
                              }
                              style={{
                                color: colors.danger,
                                borderColor: "#fecaca",
                                background: "#fef2f2",
                              }}
                            >
                              <Trash2 size={15} />

                              {deletingId ===
                              employeeId
                                ? "Disabling..."
                                : "Disable"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="mobile-only mobile-list">
            {loading ? (
              <div
                className="loading-state"
                style={{
                  color: colors.secondaryText,
                }}
              >
                Loading employees...
              </div>
            ) : paginatedEmployees.length === 0 ? (
              <div className="empty-state">
                <div
                  className="empty-icon"
                  style={{
                    background: `${colors.primary}12`,
                    color: colors.primary,
                  }}
                >
                  <Users size={24} />
                </div>

                <h3
                  className="empty-title"
                  style={{ color: colors.text }}
                >
                  No employees found
                </h3>

                <p
                  className="empty-description"
                  style={{
                    color: colors.secondaryText,
                  }}
                >
                  {search
                    ? "No accounts match your search."
                    : "There are currently no user accounts to display."}
                </p>
              </div>
            ) : (
              paginatedEmployees.map((employee) => {
                const employeeId =
                  employee._id || employee.id;

                return (
                  <div
                    className="employee-mobile-card"
                    key={employeeId}
                    style={{
                      borderColor: colors.border,
                    }}
                  >
                    <div className="mobile-employee-top">
                      <div
                        className="employee-avatar"
                        style={{
                          background: `${colors.primary}15`,
                          color: colors.primary,
                        }}
                      >
                        {getInitials(employee.name)}
                      </div>

                      <div className="mobile-employee-main">
                        <div
                          className="mobile-employee-name"
                          style={{
                            color: colors.text,
                          }}
                        >
                          {employee.name ||
                            "Unnamed User"}
                        </div>

                        <div
                          className="mobile-employee-email"
                          style={{
                            color: colors.secondaryText,
                          }}
                        >
                          {employee.email || "No email"}
                        </div>
                      </div>
                    </div>

                    <div className="mobile-role">
                      <span
                        className="role-badge"
                        style={{
                          background:
                            employee.role ===
                            "admin"
                              ? "#ede9fe"
                              : `${colors.primary}12`,
                          color:
                            employee.role ===
                            "admin"
                              ? "#6d28d9"
                              : colors.primary,
                        }}
                      >
                        {employee.role ===
                        "admin" ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <UserCog size={14} />
                        )}

                        {getRoleLabel(
                          employee.role
                        )}
                      </span>
                    </div>

                    <div className="mobile-actions">
                      <button
                        type="button"
                        className="icon-action"
                        onClick={() =>
                          editEmployee(employee)
                        }
                        style={{
                          color: colors.primary,
                          borderColor: `${colors.primary}55`,
                          background: `${colors.primary}08`,
                        }}
                      >
                        <Edit3 size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="icon-action"
                        onClick={() =>
                          deleteEmployee(employeeId)
                        }
                        disabled={
                          deletingId === employeeId
                        }
                        style={{
                          color: colors.danger,
                          borderColor: "#fecaca",
                          background: "#fef2f2",
                        }}
                      >
                        <Trash2 size={15} />

                        {deletingId === employeeId
                          ? "Disabling..."
                          : "Disable"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading && filtered.length > 0 && (
            <div
              className="pagination"
              style={{
                borderColor: colors.border,
              }}
            >
              <div
                className="pagination-info"
                style={{
                  color: colors.secondaryText,
                }}
              >
                Showing{" "}
                <strong style={{ color: colors.text }}>
                  {(currentPage - 1) * perPage + 1}
                </strong>{" "}
                -{" "}
                <strong style={{ color: colors.text }}>
                  {Math.min(
                    currentPage * perPage,
                    filtered.length
                  )}
                </strong>{" "}
                of{" "}
                <strong style={{ color: colors.text }}>
                  {filtered.length}
                </strong>
              </div>

              <div className="pagination-buttons">
                <button
                  type="button"
                  className="page-button"
                  onClick={() =>
                    setPage((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  disabled={currentPage === 1}
                  style={{
                    color: colors.text,
                    borderColor: colors.border,
                    background: colors.input,
                  }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    className={`page-button ${
                      pageNumber === currentPage
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setPage(pageNumber)
                    }
                    style={
                      pageNumber === currentPage
                        ? undefined
                        : {
                            color: colors.text,
                            borderColor:
                              colors.border,
                            background:
                              colors.input,
                          }
                    }
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  className="page-button"
                  onClick={() =>
                    setPage((value) =>
                      Math.min(
                        totalPages,
                        value + 1
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  style={{
                    color: colors.text,
                    borderColor: colors.border,
                    background: colors.input,
                  }}
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL ERROR ICON
========================================================= */

function XCircleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}