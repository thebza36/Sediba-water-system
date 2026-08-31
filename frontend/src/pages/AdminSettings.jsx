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
    darkMode: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  /* MODALS */

  const [showReset, setShowReset] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [error, setError] = useState("");


  /* LOAD SETTINGS */

  useEffect(() => {

    fetch(`${API}/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings");
        setLoading(false);
      });

  }, []);


  /* VALIDATION */

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


  /* SAVE SETTINGS */

  const save = async () => {

    if (!validate()) return;

    try {

      setSaving(true);

      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
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


  /* CONFIRM SAVE */

  const confirmSave = () => {
    setShowSaveConfirm(false);
    save();
  };


  /* RESET */

  const reset = () => {

    setSettings({
      companyName: "Sediba Water",
      currency: "ZAR",
      tax: 0,
      lowStockAlert: 5,
      defaultCategory: "water",
      emailNotifications: true,
      autoBackup: false,
      darkMode: false
    });

    setShowReset(false);

  };


  /* CHANGE PASSWORD */

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

      const res = await fetch(`${API}/users/change-password`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          currentPassword,
          newPassword
        })

      });

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


  /* LOADING */

  if (loading) {
    return (
      <div style={center(theme)}>
        Loading settings...
      </div>
    );
  }


  return (

    <div style={page(theme)}>

      {/* =====================================================
          PAGE TITLE
      ===================================================== */}

      <h1 style={title(theme)}>

        <Settings
          size={30}
          strokeWidth={2.3}
          style={{
            verticalAlign: "middle",
            marginRight: 8
          }}
        />

        System Settings

      </h1>


      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (
        <div style={messageBox(theme)}>

          <CheckCircle2
            size={18}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          {message}

        </div>
      )}


      {/* =====================================================
          BUSINESS
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>

          <Building2
            size={20}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          Business Information

        </h3>


        <div style={grid}>

          <div>

            <label style={label(theme)}>
              Company Name
            </label>

            <input
              style={input(theme)}
              value={settings.companyName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  companyName: e.target.value
                })
              }
            />

          </div>


          <div>

            <label style={label(theme)}>
              Currency
            </label>

            <select
              style={input(theme)}
              value={settings.currency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  currency: e.target.value
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

          </div>

        </div>

      </div>


      {/* =====================================================
          SALES
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>

          <WalletCards
            size={20}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          Sales Settings

        </h3>


        <div style={grid}>

          <div>

            <label style={label(theme)}>
              Tax Percentage
            </label>

            <input
              type="number"
              style={input(theme)}
              value={settings.tax}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  tax: e.target.value
                })
              }
            />

          </div>


          <div>

            <label style={label(theme)}>
              Default Product Category
            </label>

            <select
              style={input(theme)}
              value={settings.defaultCategory}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultCategory: e.target.value
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

          </div>

        </div>

      </div>


      {/* =====================================================
          INVENTORY
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>

          <Package
            size={20}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          Inventory Settings

        </h3>


        <label style={label(theme)}>
          Low Stock Alert Level
        </label>

        <input
          type="number"
          style={input(theme)}
          value={settings.lowStockAlert}
          onChange={(e) =>
            setSettings({
              ...settings,
              lowStockAlert: e.target.value
            })
          }
        />

      </div>


      {/* =====================================================
          SYSTEM
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>

          <SlidersHorizontal
            size={20}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          System Preferences

        </h3>


        <div style={toggleRow(theme)}>

          <label>
            Email Notifications
          </label>

          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) =>
              setSettings({
                ...settings,
                emailNotifications: e.target.checked
              })
            }
          />

        </div>


        <div style={toggleRow(theme)}>

          <label>
            Automatic Database Backup
          </label>

          <input
            type="checkbox"
            checked={settings.autoBackup}
            onChange={(e) =>
              setSettings({
                ...settings,
                autoBackup: e.target.checked
              })
            }
          />

        </div>


        <div style={toggleRow(theme)}>

          <label>
            Dark Mode
          </label>

          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) =>
              setSettings({
                ...settings,
                darkMode: e.target.checked
              })
            }
          />

        </div>

      </div>


      {/* =====================================================
          PASSWORD
      ===================================================== */}

      <div style={card(theme)}>

        <h3 style={sectionTitle(theme)}>

          <LockKeyhole
            size={20}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          Change Password

        </h3>


        <div style={grid}>

          {/* CURRENT PASSWORD */}

          <div>

            <label style={label(theme)}>
              Current Password
            </label>

            <div style={passwordField}>

              <input
                type={showCurrent ? "text" : "password"}
                style={inputPassword(theme)}
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
              />

              <button
                type="button"
                style={eyeBtn(theme)}
                onClick={() =>
                  setShowCurrent(!showCurrent)
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

          </div>


          {/* NEW PASSWORD */}

          <div>

            <label style={label(theme)}>
              New Password
            </label>

            <div style={passwordField}>

              <input
                type={showNew ? "text" : "password"}
                style={inputPassword(theme)}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
              />

              <button
                type="button"
                style={eyeBtn(theme)}
                onClick={() =>
                  setShowNew(!showNew)
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

          </div>

        </div>


        <div style={passwordButtonRow}>

          <button
            style={passwordBtn(theme)}
            onClick={changePassword}
          >

            <KeyRound
              size={17}
              strokeWidth={2.2}
              style={{
                verticalAlign: "middle",
                marginRight: 7
              }}
            />

            Update Password

          </button>

        </div>

      </div>


      {/* =====================================================
          MAIN BUTTONS
      ===================================================== */}

      <div style={buttonRow}>

        <button
          style={saveBtn(theme)}
          onClick={() => setShowSaveConfirm(true)}
          disabled={saving}
        >

          <Save
            size={17}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          {saving ? "Saving..." : "Save Settings"}

        </button>


        <button
          style={resetBtn(theme)}
          onClick={() => setShowReset(true)}
        >

          <RotateCcw
            size={17}
            strokeWidth={2.2}
            style={{
              verticalAlign: "middle",
              marginRight: 7
            }}
          />

          Reset

        </button>

      </div>


      {/* =====================================================
          SAVE CONFIRM MODAL
      ===================================================== */}

      {showSaveConfirm && (

        <div style={modal}>

          <div style={modalBox(theme)}>

            <h3 style={modalTitle(theme)}>

              <Save
                size={20}
                strokeWidth={2.2}
                style={{
                  verticalAlign: "middle",
                  marginRight: 7
                }}
              />

              Save Settings

            </h3>


            <p style={modalText(theme)}>
              Are you sure you want to save these settings?
            </p>


            <div style={modalActions}>

              <button
                style={cancelBtn}
                onClick={() =>
                  setShowSaveConfirm(false)
                }
              >

                <X
                  size={16}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6
                  }}
                />

                Cancel

              </button>


              <button
                style={saveBtn(theme)}
                onClick={confirmSave}
              >

                <CheckCircle2
                  size={16}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6
                  }}
                />

                Yes, Save

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

            <h3 style={modalTitle(theme)}>

              <AlertTriangle
                size={21}
                strokeWidth={2.2}
                style={{
                  verticalAlign: "middle",
                  marginRight: 7,
                  color: "#eab308"
                }}
              />

              Reset Settings

            </h3>


            <p style={modalText(theme)}>
              Are you sure you want to reset all settings?
            </p>


            <div style={modalActions}>

              <button
                style={cancelBtn}
                onClick={() =>
                  setShowReset(false)
                }
              >

                <X
                  size={16}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6
                  }}
                />

                Cancel

              </button>


              <button
                style={deleteBtn}
                onClick={reset}
              >

                <RotateCcw
                  size={16}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6
                  }}
                />

                Reset

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

            <h3 style={modalTitle(theme)}>

              <CheckCircle2
                size={21}
                strokeWidth={2.2}
                style={{
                  verticalAlign: "middle",
                  marginRight: 7,
                  color: "#16a34a"
                }}
              />

              Success

            </h3>


            <p style={modalText(theme)}>
              Settings saved successfully
            </p>


            <div style={modalActions}>

              <button
                style={saveBtn(theme)}
                onClick={() =>
                  setShowSuccess(false)
                }
              >

                <CheckCircle2
                  size={16}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6
                  }}
                />

                OK

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

            <h3 style={modalTitle(theme)}>

              <XCircle
                size={21}
                strokeWidth={2.2}
                style={{
                  verticalAlign: "middle",
                  marginRight: 7,
                  color: "#dc2626"
                }}
              />

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

                <X
                  size={16}
                  strokeWidth={2.2}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 6
                  }}
                />

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


/* =========================================================
   STYLES
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


const title = (theme) => ({
  fontSize: "clamp(24px, 5vw, 32px)",
  fontWeight: 700,
  marginBottom: 20,
  color: theme.primary,
  display: "flex",
  alignItems: "center",
});


const messageBox = (theme) => ({
  background: theme.tableHeader || theme.card,
  color: theme.text,
  padding: 12,
  borderRadius: 10,
  marginBottom: 20,
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
});


const card = (theme) => ({
  background: theme.card,
  color: theme.text,
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 8px 25px rgba(0,0,0,.08)",
  marginBottom: 20,
  borderTop: `4px solid ${theme.primary}`,
  borderLeft: `1px solid ${theme.border}`,
  borderRight: `1px solid ${theme.border}`,
  borderBottom: `1px solid ${theme.border}`,
  width: "100%",
  boxSizing: "border-box",
});


const sectionTitle = (theme) => ({
  marginTop: 0,
  marginBottom: 18,
  fontSize: 18,
  fontWeight: 700,
  color: theme.primary,
  display: "flex",
  alignItems: "center",
});


const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 15,
  width: "100%",
};


const label = (theme) => ({
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
  color: theme.text,
});


const input = (theme) => ({
  width: "100%",
  padding: 12,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  boxSizing: "border-box",
  background: theme.input || theme.card,
  color: theme.text,
  fontSize: 15,
  outline: "none",
});


const passwordField = {
  display: "flex",
  alignItems: "center",
  width: "100%",
};


const inputPassword = (theme) => ({
  flex: 1,
  width: "100%",
  padding: 12,
  border: `1px solid ${theme.border}`,
  borderRight: "none",
  borderRadius: "8px 0 0 8px",
  boxSizing: "border-box",
  background: theme.input || theme.card,
  color: theme.text,
  fontSize: 15,
  outline: "none",
});


const eyeBtn = (theme) => ({
  background: theme.primary,
  color: "white",
  border: `1px solid ${theme.primary}`,
  padding: "12px",
  cursor: "pointer",
  borderRadius: "0 8px 8px 0",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});


const toggleRow = (theme) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  padding: "12px 0",
  color: theme.text,
  borderBottom: `1px solid ${theme.border}`,
});


const buttonRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  width: "100%",
};


const passwordButtonRow = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 20,
  width: "100%",
};


const saveBtn = (theme) => ({
  background: `linear-gradient(135deg, ${theme.primary}, #1d4ed8)`,
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
  maxWidth: 220,
  minHeight: 44,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});


const passwordBtn = (theme) => ({
  background: theme.primary,
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
  maxWidth: 220,
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});


const resetBtn = (theme) => ({
  background: theme.tableHeader || theme.card,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  width: "100%",
  maxWidth: 180,
  minHeight: 44,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});


const deleteBtn = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  minHeight: 42,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};


const cancelBtn = {
  background: "#6b7280",
  color: "white",
  border: "none",
  padding: "10px",
  borderRadius: 8,
  flex: 1,
  cursor: "pointer",
  minHeight: 42,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};


const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
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
  maxWidth: 360,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  boxSizing: "border-box",
  border: `1px solid ${theme.border}`,
});


const modalTitle = (theme) => ({
  margin: 0,
  color: theme.text,
  display: "flex",
  alignItems: "center",
});


const modalText = (theme) => ({
  margin: 0,
  color: theme.textSecondary || theme.text,
  lineHeight: 1.5,
});


const modalActions = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  width: "100%",
};


const center = (theme) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60vh",
  color: theme.text,
  background: "transparent",
});