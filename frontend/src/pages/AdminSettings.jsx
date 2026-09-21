import React, { useContext, useEffect, useState } from "react";

import {
  Settings,
  Building2,
  WalletCards,
  Package,
  SlidersHorizontal,
  LockKeyhole,
  Eye,
  EyeOff,
  KeyRound,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Coins,
  Bell,
  DatabaseBackup,
  Moon,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminSettings() {
  const { theme } = useContext(ThemeContext);

  const [settings, setSettings] = useState({
    companyName: "",
    currency: "ZAR",
    tax: 0,
    lowStockAlert: 5,
    defaultCategory: "water",
    emailNotifications: true,
    autoBackup: false,
    darkMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  /* =========================================================
     MODALS
  ========================================================= */

  const [showReset, setShowReset] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD SETTINGS
  ========================================================= */

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings");
        setLoading(false);
      });
  }, []);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validate = () => {
    if (!settings.companyName) {
      setError("Company name is required");
      return false;
    }

    if (Number(settings.tax) < 0) {
      setError("Tax cannot be negative");
      return false;
    }

    if (Number(settings.lowStockAlert) < 0) {
      setError("Low stock cannot be negative");
      return false;
    }

    return true;
  };

  /* =========================================================
     SAVE SETTINGS
  ========================================================= */

  const save = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setShowSuccess(true);
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CONFIRM SAVE
  ========================================================= */

  const confirmSave = () => {
    setShowSaveConfirm(false);
    save();
  };

  /* =========================================================
     RESET
  ========================================================= */

  const reset = () => {
    setSettings({
      companyName: "Sediba Water",
      currency: "ZAR",
      tax: 0,
      lowStockAlert: 5,
      defaultCategory: "water",
      emailNotifications: true,
      autoBackup: false,
      darkMode: false,
    });

    setShowReset(false);
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/users/change-password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to change password"
        );
      }

      setMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err.message || "Failed to change password"
      );
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div style={center(theme)}>
        <div style={loadingBox(theme)}>
          <RefreshCw
            size={28}
            strokeWidth={2.2}
            className="settings-loading"
          />

          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      style={page(theme)}
      className="admin-settings-page"
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div style={header}>
        <div>
          <h1 style={title(theme)}>
            <span style={titleIcon(theme)}>
              <Settings
                size={28}
                strokeWidth={2.3}
              />
            </span>

            <span>System Settings</span>
          </h1>

          <p style={subtitle(theme)}>
            Manage your business, sales, inventory and
            system preferences.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (
        <div style={messageBox(theme)}>
          <CheckCircle2
            size={19}
            strokeWidth={2.2}
          />

          <span>{message}</span>

          <button
            type="button"
            style={messageClose(theme)}
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =====================================================
          BUSINESS INFORMATION
      ===================================================== */}

      <SettingsCard
        theme={theme}
        icon={
          <Building2
            size={21}
            strokeWidth={2.2}
          />
        }
        title="Business Information"
        description="Configure your company details and currency."
      >
        <div style={grid}>
          <Field
            theme={theme}
            label="Company Name"
            icon={<Building2 size={17} />}
          >
            <input
              style={input(theme)}
              value={settings.companyName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  companyName: e.target.value,
                })
              }
              placeholder="Company name"
            />
          </Field>

          <Field
            theme={theme}
            label="Currency"
            icon={<Coins size={17} />}
          >
            <select
              style={input(theme)}
              value={settings.currency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  currency: e.target.value,
                })
              }
            >
              <option value="ZAR">
                ZAR (R)
              </option>

              <option value="USD">
                USD ($)
              </option>

              <option value="EUR">
                EUR (€)
              </option>
            </select>
          </Field>
        </div>
      </SettingsCard>

      {/* =====================================================
          SALES SETTINGS
      ===================================================== */}

      <SettingsCard
        theme={theme}
        icon={
          <WalletCards
            size={21}
            strokeWidth={2.2}
          />
        }
        title="Sales Settings"
        description="Configure tax and your default product category."
      >
        <div style={grid}>
          <Field
            theme={theme}
            label="Tax Percentage"
            icon={<WalletCards size={17} />}
          >
            <input
              type="number"
              min="0"
              style={input(theme)}
              value={settings.tax}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  tax: e.target.value,
                })
              }
            />
          </Field>

          <Field
            theme={theme}
            label="Default Product Category"
            icon={<Package size={17} />}
          >
            <select
              style={input(theme)}
              value={settings.defaultCategory}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultCategory: e.target.value,
                })
              }
            >
              <option value="water">
                Water
              </option>

              <option value="ice">
                Ice
              </option>

              <option value="refill">
                Refill
              </option>
            </select>
          </Field>
        </div>
      </SettingsCard>

      {/* =====================================================
          INVENTORY SETTINGS
      ===================================================== */}

      <SettingsCard
        theme={theme}
        icon={
          <Package
            size={21}
            strokeWidth={2.2}
          />
        }
        title="Inventory Settings"
        description="Control when inventory should trigger a low-stock alert."
      >
        <Field
          theme={theme}
          label="Low Stock Alert Level"
          icon={<Package size={17} />}
        >
          <input
            type="number"
            min="0"
            style={input(theme)}
            value={settings.lowStockAlert}
            onChange={(e) =>
              setSettings({
                ...settings,
                lowStockAlert: e.target.value,
              })
            }
          />
        </Field>
      </SettingsCard>

      {/* =====================================================
          SYSTEM PREFERENCES
      ===================================================== */}

      <SettingsCard
        theme={theme}
        icon={
          <SlidersHorizontal
            size={21}
            strokeWidth={2.2}
          />
        }
        title="System Preferences"
        description="Control notifications, backups and display preferences."
      >
        <div style={toggleList}>
          <ToggleRow
            theme={theme}
            icon={<Bell size={19} />}
            title="Email Notifications"
            description="Receive system notifications by email."
            checked={settings.emailNotifications}
            onChange={(checked) =>
              setSettings({
                ...settings,
                emailNotifications: checked,
              })
            }
          />

          <ToggleRow
            theme={theme}
            icon={<DatabaseBackup size={19} />}
            title="Automatic Database Backup"
            description="Enable automatic database backup."
            checked={settings.autoBackup}
            onChange={(checked) =>
              setSettings({
                ...settings,
                autoBackup: checked,
              })
            }
          />

          <ToggleRow
            theme={theme}
            icon={<Moon size={19} />}
            title="Dark Mode"
            description="Use the dark interface preference."
            checked={settings.darkMode}
            onChange={(checked) =>
              setSettings({
                ...settings,
                darkMode: checked,
              })
            }
          />
        </div>
      </SettingsCard>

      {/* =====================================================
          PASSWORD
      ===================================================== */}

      <SettingsCard
        theme={theme}
        icon={
          <LockKeyhole
            size={21}
            strokeWidth={2.2}
          />
        }
        title="Change Password"
        description="Update your account password securely."
      >
        <div style={grid}>
          {/* CURRENT PASSWORD */}

          <Field
            theme={theme}
            label="Current Password"
            icon={<LockKeyhole size={17} />}
          >
            <div style={passwordField}>
              <input
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }
                style={inputPassword(theme)}
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter current password"
              />

              <button
                type="button"
                style={eyeBtn(theme)}
                onClick={() =>
                  setShowCurrent(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showCurrent
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showCurrent ? (
                  <EyeOff
                    size={19}
                    strokeWidth={2.2}
                  />
                ) : (
                  <Eye
                    size={19}
                    strokeWidth={2.2}
                  />
                )}
              </button>
            </div>
          </Field>

          {/* NEW PASSWORD */}

          <Field
            theme={theme}
            label="New Password"
            icon={<KeyRound size={17} />}
          >
            <div style={passwordField}>
              <input
                type={
                  showNew
                    ? "text"
                    : "password"
                }
                style={inputPassword(theme)}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
              />

              <button
                type="button"
                style={eyeBtn(theme)}
                onClick={() =>
                  setShowNew(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showNew
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNew ? (
                  <EyeOff
                    size={19}
                    strokeWidth={2.2}
                  />
                ) : (
                  <Eye
                    size={19}
                    strokeWidth={2.2}
                  />
                )}
              </button>
            </div>
          </Field>
        </div>

        <div style={passwordButtonRow}>
          <button
            style={passwordBtn(theme)}
            onClick={changePassword}
          >
            <KeyRound
              size={17}
              strokeWidth={2.2}
            />

            <span>Update Password</span>

            <ChevronRight
              size={17}
              strokeWidth={2}
            />
          </button>
        </div>
      </SettingsCard>

      {/* =====================================================
          MAIN BUTTONS
      ===================================================== */}

      <div style={buttonRow}>
        <button
          style={saveBtn(theme)}
          onClick={() =>
            setShowSaveConfirm(true)
          }
          disabled={saving}
        >
          {saving ? (
            <RefreshCw
              size={17}
              className="settings-loading"
            />
          ) : (
            <Save
              size={17}
              strokeWidth={2.2}
            />
          )}

          <span>
            {saving
              ? "Saving..."
              : "Save Settings"}
          </span>
        </button>

        <button
          style={resetBtn(theme)}
          onClick={() =>
            setShowReset(true)
          }
        >
          <RotateCcw
            size={17}
            strokeWidth={2.2}
          />

          <span>Reset</span>
        </button>
      </div>

      {/* =====================================================
          SAVE CONFIRM MODAL
      ===================================================== */}

      {showSaveConfirm && (
        <div style={modal}>
          <div style={modalBox(theme)}>
            <div style={modalIcon(theme)}>
              <Save
                size={25}
                strokeWidth={2.2}
              />
            </div>

            <h3 style={modalTitle(theme)}>
              Save Settings
            </h3>

            <p style={modalText(theme)}>
              Are you sure you want to save
              these settings?
            </p>

            <div style={modalActions}>
              <button
                style={cancelBtn}
                onClick={() =>
                  setShowSaveConfirm(false)
                }
              >
                <X size={16} />

                <span>Cancel</span>
              </button>

              <button
                style={saveBtn(theme)}
                onClick={confirmSave}
              >
                <CheckCircle2 size={16} />

                <span>Yes, Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RESET MODAL
      ===================================================== */}

      {showReset && (
        <div style={modal}>
          <div style={modalBox(theme)}>
            <div
              style={{
                ...modalIcon(theme),
                color: "#eab308",
                background:
                  "rgba(234,179,8,.12)",
              }}
            >
              <AlertTriangle
                size={25}
                strokeWidth={2.2}
              />
            </div>

            <h3 style={modalTitle(theme)}>
              Reset Settings
            </h3>

            <p style={modalText(theme)}>
              Are you sure you want to reset
              all settings?
            </p>

            <div style={modalActions}>
              <button
                style={cancelBtn}
                onClick={() =>
                  setShowReset(false)
                }
              >
                <X size={16} />

                <span>Cancel</span>
              </button>

              <button
                style={deleteBtn}
                onClick={reset}
              >
                <RotateCcw size={16} />

                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      {showSuccess && (
        <div style={modal}>
          <div style={modalBox(theme)}>
            <div
              style={{
                ...modalIcon(theme),
                color: "#16a34a",
                background:
                  "rgba(22,163,74,.12)",
              }}
            >
              <CheckCircle2
                size={25}
                strokeWidth={2.2}
              />
            </div>

            <h3 style={modalTitle(theme)}>
              Settings Saved
            </h3>

            <p style={modalText(theme)}>
              Settings saved successfully.
            </p>

            <div style={modalActions}>
              <button
                style={saveBtn(theme)}
                onClick={() =>
                  setShowSuccess(false)
                }
              >
                <CheckCircle2 size={16} />

                <span>OK</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ERROR MODAL
      ===================================================== */}

      {error && (
        <div style={modal}>
          <div style={modalBox(theme)}>
            <div
              style={{
                ...modalIcon(theme),
                color: "#dc2626",
                background:
                  "rgba(220,38,38,.12)",
              }}
            >
              <XCircle
                size={25}
                strokeWidth={2.2}
              />
            </div>

            <h3 style={modalTitle(theme)}>
              Error
            </h3>

            <p style={modalText(theme)}>
              {error}
            </p>

            <div style={modalActions}>
              <button
                style={cancelBtn}
                onClick={() =>
                  setError("")
                }
              >
                <X size={16} />

                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style>
        {`
          .admin-settings-page {
            overflow-x: hidden;
          }

          .settings-loading {
            animation: settingsSpin 1s linear infinite;
          }

          @keyframes settingsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 700px) {
            .admin-settings-page {
              padding: 10px !important;
            }

            .admin-settings-grid {
              grid-template-columns: 1fr !important;
            }

            .admin-settings-button-row {
              flex-direction: column !important;
            }

            .admin-settings-button-row button {
              width: 100% !important;
              max-width: none !important;
            }

            .admin-settings-password-button {
              width: 100% !important;
              max-width: none !important;
            }
          }

          @media (max-width: 500px) {
            .admin-settings-card {
              padding: 15px !important;
              border-radius: 13px !important;
            }

            .admin-settings-toggle {
              align-items: flex-start !important;
            }

            .admin-settings-modal {
              padding: 12px !important;
            }
          }

          @media (max-width: 380px) {
            .admin-settings-page {
              padding: 7px !important;
            }

            .admin-settings-card {
              padding: 13px !important;
            }
          }
        `}
      </style>
    </div>
  );
}


/* =========================================================
   SETTINGS CARD
========================================================= */

const SettingsCard = ({
  theme,
  icon,
  title,
  description,
  children,
}) => {
  return (
    <div
      style={card(theme)}
      className="admin-settings-card"
    >
      <div style={sectionHeader}>
        <div style={sectionIcon(theme)}>
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <h3 style={sectionTitle(theme)}>
            {title}
          </h3>

          {description && (
            <p style={sectionDescription(theme)}>
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};


/* =========================================================
   FIELD
========================================================= */

const Field = ({
  theme,
  label: fieldLabel,
  icon,
  children,
}) => {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={label(theme)}>
        <span style={labelIcon(theme)}>
          {icon}
        </span>

        <span>{fieldLabel}</span>
      </label>

      {children}
    </div>
  );
};


/* =========================================================
   TOGGLE
========================================================= */

const ToggleRow = ({
  theme,
  icon,
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <div
      style={toggleRow(theme)}
      className="admin-settings-toggle"
    >
      <div style={toggleInfo}>
        <div style={toggleIcon(theme)}>
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={toggleTitle(theme)}>
            {title}
          </div>

          <div style={toggleDescription(theme)}>
            {description}
          </div>
        </div>
      </div>

      <label style={switchLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) =>
            onChange(e.target.checked)
          }
          style={switchInput}
        />

        <span
          style={switchTrack(
            theme,
            checked
          )}
        >
          <span
            style={switchThumb(checked)}
          />
        </span>
      </label>
    </div>
  );
};


/* =========================================================
   PAGE
========================================================= */

const page = (theme) => ({
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
  padding: "15px",
  boxSizing: "border-box",
  background: "transparent",
  color: theme.text,
  overflowX: "hidden",
});


/* =========================================================
   HEADER
========================================================= */

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 25,
};


const title = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  margin: 0,
  color: theme.primary,
});


const titleIcon = (theme) => ({
  width: 46,
  height: 46,
  minWidth: 46,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 13,
  background:
    theme.primaryLight ||
    "rgba(37,99,235,.10)",
  color: theme.primary,
});


const subtitle = (theme) => ({
  margin: "9px 0 0 56px",
  color: theme.textSecondary,
  fontSize: 14,
  lineHeight: 1.5,
});


/* =========================================================
   SUCCESS MESSAGE
========================================================= */

const messageBox = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 9,
  position: "relative",
  background:
    "rgba(22,163,74,.10)",
  color: "#16a34a",
  padding: "12px 42px 12px 14px",
  borderRadius: 10,
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box",
  border:
    "1px solid rgba(22,163,74,.25)",
  fontWeight: 600,
});


const messageClose = (theme) => ({
  position: "absolute",
  right: 7,
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  border: "none",
  borderRadius: 7,
  background: "transparent",
  color: "#16a34a",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


/* =========================================================
   CARD
========================================================= */

const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 16,
  boxShadow:
    theme.shadow ||
    "0 8px 25px rgba(0,0,0,.08)",
  marginBottom: 20,
  borderTop:
    `4px solid ${theme.primary}`,
  borderLeft:
    `1px solid ${theme.border}`,
  borderRight:
    `1px solid ${theme.border}`,
  borderBottom:
    `1px solid ${theme.border}`,
  width: "100%",
  boxSizing: "border-box",
});


/* =========================================================
   SECTION HEADER
========================================================= */

const sectionHeader = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 20,
};


const sectionIcon = (theme) => ({
  width: 42,
  height: 42,
  minWidth: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 11,
  background:
    theme.primaryLight ||
    "rgba(37,99,235,.10)",
  color: theme.primary,
});


const sectionTitle = (theme) => ({
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: theme.primary,
});


const sectionDescription = (theme) => ({
  margin: "4px 0 0",
  fontSize: 13,
  lineHeight: 1.45,
  color: theme.textSecondary,
});


/* =========================================================
   GRID
========================================================= */

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(260px,1fr))",
  gap: 16,
  width: "100%",
};


/* =========================================================
   LABEL
========================================================= */

const label = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 7,
  fontWeight: 600,
  color: theme.text,
  fontSize: 14,
});


const labelIcon = (theme) => ({
  display: "flex",
  alignItems: "center",
  color: theme.primary,
});


/* =========================================================
   INPUT
========================================================= */

const input = (theme) => ({
  width: "100%",
  padding: 12,
  border:
    `1px solid ${theme.border}`,
  borderRadius: 9,
  boxSizing: "border-box",
  background:
    theme.input || theme.card,
  color: theme.text,
  fontSize: 15,
  outline: "none",
  minWidth: 0,
});


/* =========================================================
   PASSWORD FIELD
========================================================= */

const passwordField = {
  position: "relative",
  width: "100%",
  minWidth: 0,
};


const inputPassword = (theme) => ({
  width: "100%",
  padding: 12,
  paddingRight: 55,
  border:
    `1px solid ${theme.border}`,
  borderRadius: 9,
  boxSizing: "border-box",
  background:
    theme.input || theme.card,
  color: theme.text,
  fontSize: 15,
  outline: "none",
  minWidth: 0,
});


const eyeBtn = (theme) => ({
  position: "absolute",
  right: 6,
  top: "50%",
  transform: "translateY(-50%)",
  width: 40,
  height: 40,
  padding: 0,
  margin: 0,
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: theme.primary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  WebkitAppearance: "none",
  appearance: "none",
  WebkitTapHighlightColor:
    "transparent",
  touchAction: "manipulation",
});


/* =========================================================
   TOGGLES
========================================================= */

const toggleList = {
  display: "flex",
  flexDirection: "column",
};


const toggleRow = (theme) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  padding: "14px 0",
  color: theme.text,
  borderBottom:
    `1px solid ${theme.border}`,
});


const toggleInfo = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  minWidth: 0,
  flex: 1,
};


const toggleIcon = (theme) => ({
  width: 38,
  height: 38,
  minWidth: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  background:
    theme.tableHeader ||
    "rgba(0,0,0,.04)",
  color: theme.primary,
});


const toggleTitle = (theme) => ({
  color: theme.text,
  fontWeight: 650,
  fontSize: 14,
});


const toggleDescription = (theme) => ({
  marginTop: 2,
  color: theme.textSecondary,
  fontSize: 12,
  lineHeight: 1.4,
});


const switchLabel = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  flexShrink: 0,
};


const switchInput = {
  position: "absolute",
  opacity: 0,
  width: 0,
  height: 0,
};


const switchTrack = (
  theme,
  checked
) => ({
  width: 48,
  height: 27,
  borderRadius: 30,
  background: checked
    ? theme.primary
    : theme.border,
  display: "flex",
  alignItems: "center",
  padding: 3,
  boxSizing: "border-box",
  transition: "0.2s",
});


const switchThumb = (checked) => ({
  width: 21,
  height: 21,
  borderRadius: "50%",
  background: "white",
  transform: checked
    ? "translateX(21px)"
    : "translateX(0)",
  transition: "0.2s",
  boxShadow:
    "0 1px 4px rgba(0,0,0,.25)",
});


/* =========================================================
   BUTTONS
========================================================= */

const buttonRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  width: "100%",
  marginBottom: 20,
  alignItems: "center",
};


const passwordButtonRow = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 20,
  width: "100%",
};


const saveBtn = (theme) => ({
  background:
    `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
  maxWidth: 220,
  minHeight: 44,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxSizing: "border-box",
});


const passwordBtn = (theme) => ({
  background: theme.primary,
  color: "white",
  border: "none",
  padding: "11px 17px",
  borderRadius: 9,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  maxWidth: 220,
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxSizing: "border-box",
});


const resetBtn = (theme) => ({
  background:
    theme.tableHeader ||
    theme.card,
  color: theme.text,
  border:
    `1px solid ${theme.border}`,
  padding: "12px 20px",
  borderRadius: 9,
  cursor: "pointer",
  width: "100%",
  maxWidth: 180,
  minHeight: 44,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxSizing: "border-box",
});


/* =========================================================
   MODALS
========================================================= */

const modal = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  background:
    "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: 15,
  boxSizing: "border-box",
};


const modalBox = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 25,
  borderRadius: 16,
  width: "100%",
  maxWidth: 380,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow:
    "0 15px 40px rgba(0,0,0,.25)",
  boxSizing: "border-box",
  border:
    `1px solid ${theme.border}`,
  textAlign: "center",
});


const modalIcon = (theme) => ({
  width: 52,
  height: 52,
  margin: "0 auto 3px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  background:
    theme.primaryLight ||
    "rgba(37,99,235,.10)",
  color: theme.primary,
});


const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 19,
  fontWeight: 700,
});


const modalText = (theme) => ({
  margin: 0,
  color:
    theme.textSecondary ||
    theme.text,
  lineHeight: 1.5,
  fontSize: 14,
});


const modalActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  width: "100%",
  marginTop: 6,
};


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  minHeight: 42,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


const cancelBtn = {
  background: "#6b7280",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  minHeight: 42,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};


/* =========================================================
   LOADING
========================================================= */

const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
});


const loadingBox = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  color: theme.text,
  fontSize: 17,
  fontWeight: 600,
});