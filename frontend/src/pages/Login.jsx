import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD REMEMBERED EMAIL
  ===================================================== */

  useEffect(() => {

    const savedEmail =
      localStorage.getItem("rememberEmail");

    if (savedEmail) {

      setEmail(savedEmail);
      setRemember(true);

    }

    const token =
      localStorage.getItem("token");

    const role =
      localStorage.getItem("role");

    if (token && role) {

      if (role === "admin") {

        navigate("/admin/dashboard");

      }

      if (role === "employee") {

        navigate("/employee/dashboard");

      }

    }

  }, [navigate]);

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const response = await API.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      const token =
        response.data.token;

      const role = (
        response.data.user?.role ||
        response.data.role ||
        ""
      ).toLowerCase();

      const user =
        response.data.user;

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "role",
        role
      );

      /* =================================================
         REMEMBER EMAIL
      ================================================= */

      if (remember) {

        localStorage.setItem(
          "rememberEmail",
          email
        );

      } else {

        localStorage.removeItem(
          "rememberEmail"
        );

      }

      /* =================================================
         REDIRECT
      ================================================= */

      if (role === "admin") {

        navigate("/admin/dashboard");

      } else if (role === "employee") {

        navigate("/employee/dashboard");

      } else {

        setError(
          "Unknown role. Please contact the administrator."
        );

      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Login failed. Please check your details."
      );

    } finally {

      setLoading(false);

    }

  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const handleRefresh = () => {

    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);

  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <div style={container(darkMode)}>

      {/* BACKGROUND CIRCLES */}

      <div style={circleTop(darkMode)}></div>

      <div style={circleBottom(darkMode)}></div>

      {/* LOGIN CARD */}

      <div style={loginCard(darkMode)}>

        {/* TOP BAR */}

        <div style={topBar}>

          <div style={secureBadge(darkMode)}>

            <span style={statusDot}></span>

            Secure System

          </div>

          <button
            type="button"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            style={themeButton(darkMode)}
          >

            <span>
              {darkMode ? "☀" : "☾"}
            </span>

            {darkMode ? "Light" : "Dark"}

          </button>

        </div>

        {/* LOGO */}

        <div style={logoSection}>

          <div style={logoBox(darkMode)}>

            <img
              src="/Logo.png"
              alt="Sediba Still Water"
              style={logo}
            />

          </div>

          <h1 style={title}>
            Sediba Still Water
          </h1>

          <p style={systemTitle(darkMode)}>
            Management System
          </p>

          <p style={subtitle(darkMode)}>
            Sign in to access your account
          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div style={field}>

            <label style={label}>
              Email Address
            </label>

            <div style={inputBox(darkMode)}>

              <span style={inputIcon}>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >

                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <polyline
                    points="3,7 12,13 21,7"
                  />

                </svg>

              </span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                autoComplete="email"
                onChange={(e) => {

                  setEmail(e.target.value);
                  setError("");

                }}
                style={inputStyle(darkMode)}
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div style={field}>

            <label style={label}>
              Password
            </label>

            <div style={inputBox(darkMode)}>

              <span style={inputIcon}>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >

                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                  />

                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                  />

                </svg>

              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                required
                autoComplete="current-password"
                onChange={(e) => {

                  setPassword(e.target.value);
                  setError("");

                }}
                style={passwordInput(darkMode)}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={eyeButton(darkMode)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >

                    <path
                      d="M3 3l18 18"
                    />

                    <path
                      d="M10.6 10.6a2 2 0 1 0 2.8 2.8"
                    />

                    <path
                      d="M9.9 4.2A10.8 10.8 0 0 1 12 4"
                    />

                    <path
                      d="M2 12s3.5-7 10-7"
                    />

                    <path
                      d="M12 19c5 0 8.5-4 10-7"
                    />

                    <path
                      d="M6.6 6.6C4.4 8 3.1 10 2 12"
                    />

                    <path
                      d="M17.4 17.4C15.8 18.4 14 19 12 19"
                    />

                  </svg>

                ) : (

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >

                    <path
                      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />

                  </svg>

                )}

              </button>

            </div>

          </div>

          {/* REMEMBER ME */}

          <div style={rememberRow}>

            <label style={rememberLabel}>

              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(e.target.checked)
                }
                style={checkbox}
              />

              <span>
                Remember me
              </span>

            </label>

            <button
              type="button"
              onClick={handleRefresh}
              style={resetButton(darkMode)}
            >

              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >

                <polyline
                  points="23 4 23 10 17 10"
                />

                <path
                  d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"
                />

              </svg>

              Reset

            </button>

          </div>

          {/* ERROR */}

          {error && (

            <div style={errorBox}>

              <span style={errorIcon}>
                !
              </span>

              <span>
                {error}
              </span>

            </div>

          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={loginButton(loading)}
          >

            {loading ? (

              <>

                <span style={spinner}></span>

                Signing in...

              </>

            ) : (

              <>

                Sign In

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >

                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                  />

                  <polyline
                    points="12 5 19 12 12 19"
                  />

                </svg>

              </>

            )}

          </button>

        </form>

        {/* FOOTER */}

        <div style={footer(darkMode)}>

  <div style={secureLine}>

    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >

      <rect
        x="3"
        y="11"
        width="18"
        height="10"
        rx="2"
      />

      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
      />

    </svg>

    Secure & Protected

  </div>

  <p style={copyright}>

    © {new Date().getFullYear()}
    {" "}
    Sediba Still Water System

  </p>

  <p style={codedBy}>
    Coded by Thebeko Maboee
  </p>

</div>

      </div>

    </div>

  );

}

/* =====================================================
   MAIN CONTAINER
===================================================== */

const container = (dark) => ({

  minHeight: "100vh",

  width: "100%",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  position: "relative",

  overflow: "hidden",

  padding: "20px",

  boxSizing: "border-box",

  background: dark
    ? "linear-gradient(135deg,#020617,#0f172a,#172554)"
    : "linear-gradient(135deg,#0369a1,#0284c7,#38bdf8)",

  transition:
    "background 0.35s ease"

});

/* =====================================================
   BACKGROUND CIRCLES
===================================================== */

const circleTop = (dark) => ({

  position: "absolute",

  width: "420px",

  height: "420px",

  borderRadius: "50%",

  top: "-190px",

  right: "-150px",

  background: dark
    ? "rgba(59,130,246,0.12)"
    : "rgba(255,255,255,0.12)",

  pointerEvents: "none"

});

const circleBottom = (dark) => ({

  position: "absolute",

  width: "360px",

  height: "360px",

  borderRadius: "50%",

  bottom: "-180px",

  left: "-150px",

  background: dark
    ? "rgba(14,116,144,0.12)"
    : "rgba(255,255,255,0.10)",

  pointerEvents: "none"

});

/* =====================================================
   LOGIN CARD
===================================================== */

const loginCard = (dark) => ({

  position: "relative",

  zIndex: 2,

  width: "100%",

  maxWidth: "440px",

  padding:
    "clamp(24px,6vw,42px)",

  boxSizing: "border-box",

  borderRadius: "24px",

  background: dark
    ? "linear-gradient(145deg,#0f172a,#172554)"
    : "linear-gradient(145deg,#075985,#0369a1,#0284c7)",

  border: dark
    ? "1px solid rgba(148,163,184,0.16)"
    : "1px solid rgba(255,255,255,0.30)",

  boxShadow: dark
    ? "0 25px 70px rgba(0,0,0,0.45)"
    : "0 25px 70px rgba(2,54,85,0.40)",

  color: "#ffffff",

  transition:
    "background 0.35s ease,box-shadow 0.35s ease"

});

/* =====================================================
   TOP BAR
===================================================== */

const topBar = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: "10px",

  marginBottom: "22px"

};

const secureBadge = (dark) => ({

  display: "flex",

  alignItems: "center",

  gap: "7px",

  padding: "6px 10px",

  borderRadius: "20px",

  fontSize: "11px",

  fontWeight: "700",

  color: "#ffffff",

  background: dark
    ? "rgba(59,130,246,0.12)"
    : "rgba(255,255,255,0.15)",

  border: dark
    ? "1px solid rgba(59,130,246,0.15)"
    : "1px solid rgba(255,255,255,0.20)"

});

const statusDot = {

  width: "7px",

  height: "7px",

  borderRadius: "50%",

  background: "#22c55e",

  boxShadow:
    "0 0 8px rgba(34,197,94,0.8)"

};

const themeButton = (dark) => ({

  display: "flex",

  alignItems: "center",

  gap: "6px",

  padding: "7px 11px",

  borderRadius: "9px",

  border: dark
    ? "1px solid rgba(148,163,184,0.25)"
    : "1px solid rgba(255,255,255,0.35)",

  background: dark
    ? "rgba(255,255,255,0.05)"
    : "rgba(255,255,255,0.14)",

  color: "#ffffff",

  cursor: "pointer",

  fontSize: "11px",

  fontWeight: "600"

});

/* =====================================================
   LOGO
===================================================== */

const logoSection = {

  textAlign: "center",

  marginBottom: "28px"

};

const logoBox = (dark) => ({

  width: "82px",

  height: "82px",

  margin: "0 auto 14px",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  borderRadius: "22px",

  background: "#ffffff",

  border:
    "1px solid rgba(255,255,255,0.80)",

  overflow: "hidden",

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.18)"

});

const logo = {

  width: "68px",

  height: "68px",

  objectFit: "contain",

  display: "block"

};

const title = {

  margin: 0,

  fontSize:
    "clamp(24px,6vw,30px)",

  lineHeight: "1.15",

  fontWeight: "800",

  letterSpacing: "-0.7px",

  color: "#ffffff"

};

const systemTitle = (dark) => ({

  margin: "6px 0 0",

  fontSize: "15px",

  fontWeight: "700",

  color: dark
    ? "#60a5fa"
    : "#bae6fd"

});

const subtitle = (dark) => ({

  margin: "8px 0 0",

  fontSize: "13px",

  color: dark
    ? "#94a3b8"
    : "rgba(255,255,255,0.78)"

});

/* =====================================================
   FORM
===================================================== */

const field = {

  marginBottom: "17px"

};

const label = {

  display: "block",

  marginBottom: "7px",

  fontSize: "13px",

  fontWeight: "700",

  color: "#ffffff"

};

const inputBox = (dark) => ({

  position: "relative",

  width: "100%"

});

/* =====================================================
   INPUT ICONS
===================================================== */

const inputIcon = {

  position: "absolute",

  left: "14px",

  top: "50%",

  transform: "translateY(-50%)",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  color: "#075985",

  pointerEvents: "none",

  zIndex: 2

};

const inputStyle = (dark) => ({

  width: "100%",

  height: "50px",

  padding:
    "0 14px 0 45px",

  boxSizing: "border-box",

  borderRadius: "11px",

  border: dark
    ? "1px solid #334155"
    : "1px solid rgba(255,255,255,0.30)",

  outline: "none",

  background: dark
    ? "#eaf2ff"
    : "rgba(255,255,255,0.92)",

  color: "#0f172a",

  fontSize: "15px"

});

const passwordInput = (dark) => ({

  ...inputStyle(dark),

  paddingRight: "48px"

});

/* =====================================================
   PASSWORD EYE ICON
===================================================== */

const eyeButton = (dark) => ({

  position: "absolute",

  right: "10px",

  top: "50%",

  transform: "translateY(-50%)",

  width: "34px",

  height: "34px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  border: "none",

  borderRadius: "7px",

  background: "transparent",

  color: "#075985",

  cursor: "pointer",

  padding: 0

});

/* =====================================================
   REMEMBER ROW
===================================================== */

const rememberRow = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  flexWrap: "wrap",

  gap: "10px",

  marginBottom: "18px"

};

const rememberLabel = {

  display: "flex",

  alignItems: "center",

  gap: "8px",

  fontSize: "13px",

  fontWeight: "600",

  color: "#ffffff",

  cursor: "pointer"

};

const checkbox = {

  width: "15px",

  height: "15px",

  cursor: "pointer",

  accentColor: "#ffffff",

  margin: 0

};

const resetButton = (dark) => ({

  display: "flex",

  alignItems: "center",

  gap: "5px",

  padding: "4px",

  border: "none",

  background: "transparent",

  color: dark
    ? "#60a5fa"
    : "#e0f2fe",

  cursor: "pointer",

  fontSize: "12px",

  fontWeight: "700"

});

/* =====================================================
   ERROR
===================================================== */

const errorBox = {

  display: "flex",

  alignItems: "center",

  gap: "9px",

  padding: "11px 12px",

  marginBottom: "15px",

  borderRadius: "10px",

  background:
    "rgba(127,29,29,0.30)",

  border:
    "1px solid rgba(254,202,202,0.35)",

  color: "#ffffff",

  fontSize: "12px",

  fontWeight: "600",

  lineHeight: "1.4"

};

const errorIcon = {

  width: "20px",

  height: "20px",

  minWidth: "20px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  borderRadius: "50%",

  background: "#dc2626",

  color: "#ffffff",

  fontWeight: "800"

};

/* =====================================================
   LOGIN BUTTON
===================================================== */

const loginButton = (loading) => ({

  width: "100%",

  height: "52px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: "9px",

  marginTop: "5px",

  border: "none",

  borderRadius: "11px",

  background: loading
    ? "#64748b"
    : "linear-gradient(135deg,#0c4a6e,#075985)",

  color: "#ffffff",

  fontSize: "15px",

  fontWeight: "800",

  cursor: loading
    ? "not-allowed"
    : "pointer",

  boxShadow: loading
    ? "none"
    : "0 10px 25px rgba(0,0,0,0.20)",

  opacity: loading ? 0.8 : 1

});

const spinner = {

  width: "16px",

  height: "16px",

  border:
    "2px solid rgba(255,255,255,0.35)",

  borderTop:
    "2px solid #ffffff",

  borderRadius: "50%",

  animation:
    "sedibaSpin 0.8s linear infinite"

};

/* =====================================================
   FOOTER
===================================================== */

const footer = (dark) => ({

  marginTop: "27px",

  paddingTop: "18px",

  borderTop: dark
    ? "1px solid rgba(148,163,184,0.12)"
    : "1px solid rgba(255,255,255,0.22)",

  textAlign: "center"

});

const secureLine = {

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  gap: "6px",

  color: "#86efac",

  fontSize: "11px",

  fontWeight: "700"

};

const copyright = {

  margin: "8px 0 0",

  color:
    "rgba(255,255,255,0.60)",

  fontSize: "10px"

};

const codedBy = {

  margin: "5px 0 0",

  color: "rgba(255,255,255,0.45)",

  fontSize: "10px",

  fontWeight: "600",

  letterSpacing: "0.2px"

};

/* =====================================================
   ANIMATION
===================================================== */

if (
  typeof document !== "undefined" &&
  !document.getElementById(
    "sediba-login-animation"
  )
) {

  const style =
    document.createElement("style");

  style.id =
    "sediba-login-animation";

  style.innerHTML = `

    @keyframes sedibaSpin {

      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }

    }

    input::placeholder {

      color: #64748b;

      opacity: 1;

    }

    input:focus {

      border-color:
        #075985 !important;

      box-shadow:
        0 0 0 3px
        rgba(7,89,133,0.15);

    }

    button:focus-visible,
    input:focus-visible {

      outline:
        2px solid #bae6fd;

      outline-offset: 2px;

    }

    @media (max-width: 480px) {

      body {
        overflow-x: hidden;
      }

    }

  `;

  document.head.appendChild(style);

}