import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Footer = () => {

  const [role, setRole] = useState("");

  const { darkMode } = useContext(
    ThemeContext
  );

  useEffect(() => {

    const userRole =
      localStorage.getItem("role");

    setRole(
      userRole || ""
    );

  }, []);

  return (

    <footer
      style={footer(
        darkMode
      )}
    >

      <div
        style={footerContent}
      >

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          style={divider(
            darkMode
          )}
        />

        {/* =================================================
            FOOTER INFORMATION
        ================================================= */}

        <div
          style={informationRow}
        >

          <div
            style={copyright(
              darkMode
            )}
          >

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path
                d="M15 9.5a3 3 0 1 0 0 5"
              />

            </svg>

            <span>

              © {new Date().getFullYear()}
              {" "}
              Sediba Waters Business Workspace

            </span>

          </div>

          {role && (

            <div
              style={roleBadge(
                darkMode
              )}
            >

              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <circle
                  cx="12"
                  cy="7"
                  r="4"
                />

                <path
                  d="M5.5 21a6.5 6.5 0 0 1 13 0"
                />

              </svg>

              <span>

                {role}

              </span>

            </div>

          )}

          <div
            style={secureBadge(
              darkMode
            )}
          >

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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

            <span>
              Secure & Protected
            </span>

          </div>

        </div>

        {/* =================================================
            CREDIT
        ================================================= */}

        <div
          style={creditSection}
        >

          <span
            style={creditText(
              darkMode
            )}
          >
            Coded by
          </span>

          <strong
            style={creditName}
          >
            Thebeko Stibywada Maboee
          </strong>

        </div>

      </div>

    </footer>

  );

};

/* =========================================================
   FOOTER
========================================================= */

const footer = (
  darkMode
) => ({

  width: "100%",
  marginTop: "auto",
  boxSizing: "border-box",
  background: darkMode
    ? "linear-gradient(135deg,#0f172a,#172554)"
    : "linear-gradient(135deg,#0369a1,#0284c7)",
  borderTop:
    darkMode
      ? "1px solid rgba(148,163,184,0.15)"
      : "1px solid rgba(255,255,255,0.20)",
  padding: "18px 25px",
  color: "#ffffff"
});

/* =========================================================
   CONTENT
========================================================= */

const footerContent = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center"

};

/* =========================================================
   DIVIDER
========================================================= */

const divider = (
  darkMode
) => ({

  width: "100%",
  maxWidth: "900px",
  height: "1px",
  margin:
    "0 0 15px",
  background:
    darkMode
      ? "rgba(148,163,184,0.15)"
      : "rgba(255,255,255,0.20)"

});

/* =========================================================
   INFORMATION
========================================================= */

const informationRow = {

  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "18px"
};

const copyright = (
  darkMode
) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color:
    darkMode
      ? "#cbd5e1"
      : "rgba(255,255,255,0.85)",
  fontSize: "11px"
});

const roleBadge = (
  darkMode
) => ({

  display: "flex",

  alignItems: "center",
  gap: "6px",
  padding:
    "5px 9px",
  borderRadius: "20px",
  background:
    darkMode
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.12)",
  border:
    "1px solid rgba(255,255,255,0.16)",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "700",
  textTransform:
    "capitalize"
});

const secureBadge = (
  darkMode
) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color:
    darkMode
      ? "#93c5fd"
      : "rgba(255,255,255,0.78)",
  fontSize: "10px",
  fontWeight: "600"
});

/* =========================================================
   CREDIT
========================================================= */

const creditSection = {
  marginTop: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px"
};

const creditText = (
  darkMode
) => ({
  color:
    darkMode
      ? "#64748b"
      : "rgba(255,255,255,0.60)",
  fontSize: "10px"
});

const creditName = {
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "700"
};

export default Footer;
