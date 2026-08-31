import { useEffect, useState } from "react";
import {
  Camera,
  User,
  Shield,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/users`;

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ===============================
     PASSWORD STRENGTH
  =============================== */

  const getStrength = (password) => {
    if (password.length < 6) {
      return {
        label: "Weak",
        color: "#dc2626",
      };
    }

    if (password.length < 10) {
      return {
        label: "Medium",
        color: "#d97706",
      };
    }

    return {
      label: "Strong",
      color: "#16a34a",
    };
  };

  /* ===============================
     LOAD PROFILE
  =============================== */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setName(data.name || "");
        setEmail(data.email || "");

        if (data.avatar) {
          setPreview(
            `${import.meta.env.VITE_API_URL.replace(
              "/api",
              ""
            )}${data.avatar}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (token) {
      load();
    }
  }, [token]);

  /* ===============================
     UPDATE PROFILE
  =============================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const form = new FormData();

      form.append("name", name);

      if (avatar) {
        form.append("avatar", avatar);
      }

      const res = await fetch(`${API}/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Profile update failed"
        );
      }

      if (data.user?.avatar) {
        setPreview(
          `${import.meta.env.VITE_API_URL.replace(
            "/api",
            ""
          )}${data.user.avatar}?t=${Date.now()}`
        );
      }

      if (data.user?.name) {
        setName(data.user.name);
      }

      setMessage("success:Profile updated successfully");

    } catch (err) {
      console.error(err);

      setMessage(
        `error:${err.message || "Update failed"}`
      );

    } finally {
      setLoading(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  /* ===============================
     CHANGE PASSWORD
  =============================== */

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      setMessage(
        "error:Please enter your current password"
      );
      return;
    }

    if (!newPassword) {
      setMessage(
        "error:Please enter a new password"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        "error:Passwords do not match"
      );
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "error:Password must be at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/change-password`,
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
          data.message || "Password update failed"
        );
      }

      setMessage(
        "success:Password updated successfully"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      console.error(err);

      setMessage(
        `error:${
          err.message || "Password update failed"
        }`
      );

    } finally {
      setLoading(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  /* ===============================
     AVATAR
  =============================== */

  const handleAvatarChange = (file) => {
    if (!file) return;

    setAvatar(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  /* ===============================
     INITIALS FALLBACK
  =============================== */

  const getInitials = () => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  /* ===============================
     MESSAGE TYPE
  =============================== */

  const messageType = message.startsWith("success:")
    ? "success"
    : "error";

  const messageText = message.replace(
    /^(success:|error:)/,
    ""
  );

  return (
    <div style={container}>

      {/* ===============================
          PROFILE CARD
      =============================== */}

      <div style={profileCard}>

        {/* ===============================
            HEADER
        =============================== */}

        <div style={header}>

          <div style={avatarWrapper}>

            <input
              type="file"
              id="avatarUpload"
              hidden
              accept="image/*"
              onChange={(e) =>
                handleAvatarChange(
                  e.target.files[0]
                )
              }
            />

            {preview ? (
              <img
                src={preview}
                alt="Profile avatar"
                style={avatar}
              />
            ) : (
              <div style={avatarFallback}>
                {getInitials()}
              </div>
            )}

            <div
              style={overlay}
              onClick={() =>
                document
                  .getElementById("avatarUpload")
                  .click()
              }
            >
              <Camera
                size={14}
                strokeWidth={2.5}
              />

              Change
            </div>

          </div>

          <h1 style={profileName}>
            {name || "User"}
          </h1>

          <p style={profileEmail}>
            {email || "No email available"}
          </p>

        </div>

        {/* ===============================
            PROFILE FORM
        =============================== */}

        <form
          onSubmit={handleSubmit}
          style={form}
        >

          <h2 style={sectionTitle}>
            <User
              size={21}
              strokeWidth={2.3}
            />

            Profile Information
          </h2>

          <label style={label}>
            Full Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Full Name"
            style={input}
          />

          <label style={label}>
            Email Address
          </label>

          <input
            value={email}
            disabled
            style={inputDisabled}
          />

          <button
            type="submit"
            style={{
              ...btn,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            <Save
              size={17}
              strokeWidth={2.5}
            />

            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>

        </form>

        {/* ===============================
            SECURITY
        =============================== */}

        <div style={section}>

          <h2 style={sectionTitle}>
            <Shield
              size={21}
              strokeWidth={2.3}
            />

            Security
          </h2>

          <p style={securityText}>
            Change your account password
            regularly to keep your account
            secure.
          </p>

          <form
            onSubmit={handlePasswordChange}
          >

            <label style={label}>
              Current Password
            </label>

            <div style={passwordWrapper}>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                style={passwordInput}
              />

              <button
                type="button"
                style={passwordToggle}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            <label style={label}>
              New Password
            </label>

            <div style={passwordWrapper}>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="New Password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                style={passwordInput}
              />

              <button
                type="button"
                style={passwordToggle}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* PASSWORD STRENGTH */}

            {newPassword && (
              <div
                style={{
                  marginTop: -5,
                  marginBottom: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    getStrength(
                      newPassword
                    ).color,
                }}
              >
                Password strength:{" "}
                {getStrength(
                  newPassword
                ).label}
              </div>
            )}

            <label style={label}>
              Confirm New Password
            </label>

            <div style={passwordWrapper}>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                style={passwordInput}
              />

              <button
                type="button"
                style={passwordToggle}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            <label style={checkbox}>

              <input
                type="checkbox"
                checked={showPassword}
                onChange={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              />

              <span>
                Show Passwords
              </span>

            </label>

            <button
              type="submit"
              style={{
                ...btn,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
            >
              <KeyRound
                size={17}
                strokeWidth={2.5}
              />

              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

          </form>

        </div>

        {/* ===============================
            MESSAGE
        =============================== */}

        {message && (
          <div
            style={{
              ...messageBox,
              background:
                messageType === "success"
                  ? "#ecfdf5"
                  : "#fef2f2",
              color:
                messageType === "success"
                  ? "#166534"
                  : "#b91c1c",
              border:
                messageType === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
            }}
          >

            {messageType === "success" ? (
              <CheckCircle
                size={18}
                strokeWidth={2.3}
              />
            ) : (
              <XCircle
                size={18}
                strokeWidth={2.3}
              />
            )}

            <span>
              {messageText}
            </span>

          </div>
        )}

      </div>

    </div>
  );
};

/* ===============================
   STYLES
=============================== */

const container = {
  minHeight: "100vh",
  width: "100%",
  padding:
    "clamp(15px,4vw,35px)",
  background: "#f1f5f9",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  boxSizing: "border-box",
};

/* ===============================
   PROFILE CARD
=============================== */

const profileCard = {
  width: "100%",
  maxWidth: "520px",
  background: "#ffffff",
  borderRadius: "22px",
  overflow: "hidden",
  boxShadow:
    "0 15px 40px rgba(15,23,42,0.12)",
  boxSizing: "border-box",
};

/* ===============================
   HEADER
=============================== */

const header = {
  background:
    "linear-gradient(135deg,#0f172a,#2563eb)",
  color: "#ffffff",
  padding:
    "clamp(25px,6vw,40px) 20px",
  textAlign: "center",
};

const avatarWrapper = {
  position: "relative",
  width: "120px",
  height: "120px",
  margin: "0 auto 15px",
};

const avatar = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  border: "4px solid #ffffff",
  objectFit: "cover",
  display: "block",
};

const avatarFallback = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  border: "4px solid #ffffff",
  background:
    "linear-gradient(135deg,#2563eb,#1e3a8a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "800",
  margin: "0 auto",
  boxSizing: "border-box",
};

const overlay = {
  position: "absolute",
  bottom: "2px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(0,0,0,0.65)",
  color: "#ffffff",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
};

const profileName = {
  margin: "5px 0",
  fontSize:
    "clamp(22px,5vw,28px)",
  fontWeight: "800",
  wordBreak: "break-word",
};

const profileEmail = {
  margin: 0,
  opacity: 0.85,
  fontSize:
    "clamp(13px,3vw,15px)",
  wordBreak: "break-word",
};

/* ===============================
   FORMS
=============================== */

const form = {
  padding:
    "clamp(20px,5vw,30px)",
};

const section = {
  padding:
    "0 clamp(20px,5vw,30px) 30px",
};

const sectionTitle = {
  margin:
    "0 0 15px",
  color: "#0f172a",
  fontSize:
    "clamp(19px,4vw,22px)",
  fontWeight: "800",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const securityText = {
  marginTop: -5,
  marginBottom: 18,
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const label = {
  display: "block",
  marginBottom: 6,
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};

const input = {
  width: "100%",
  padding: "13px 14px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  fontSize: "15px",
};

const inputDisabled = {
  ...input,
  background: "#f1f5f9",
  color: "#64748b",
  cursor: "not-allowed",
};

const passwordWrapper = {
  position: "relative",
  width: "100%",
};

const passwordInput = {
  ...input,
  paddingRight: 48,
};

const passwordToggle = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  width: 34,
  height: 34,
  border: "none",
  background: "transparent",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
};

const btn = {
  width: "100%",
  padding: "13px 16px",
  marginTop: "5px",
  background:
    "linear-gradient(135deg,#2563eb,#1e3a8a)",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
  boxShadow:
    "0 6px 15px rgba(37,99,235,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const checkbox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 15,
  color: "#475569",
  fontSize: 13,
  cursor: "pointer",
};

const messageBox = {
  margin:
    "0 clamp(20px,5vw,30px) 25px",
  padding: "12px 15px",
  borderRadius: "10px",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "14px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

export default Profile;