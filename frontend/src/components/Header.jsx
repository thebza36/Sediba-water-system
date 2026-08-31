import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import socket from "../socket";

const API = `${import.meta.env.VITE_API_URL}/users`;

const NOTIFY_API =
  `${import.meta.env.VITE_API_URL}/notifications`;

const Header = () => {

  const [open, setOpen] = useState(false);

  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 700
  );

  const navigate = useNavigate();

  const {
    darkMode,
    toggleTheme
  } = useContext(ThemeContext);

  const token = localStorage.getItem("token");

  useEffect(() => {

    const handleResize = () => {

      setIsMobile(
        window.innerWidth <= 700
      );

    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

    };

  }, []);

  /*
  =========================================================
  LOAD PROFILE
  =========================================================
  */

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const res = await fetch(
          `${API}/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          throw new Error();
        }

        const data = await res.json();

        console.log(
          "USER DATA:",
          data
        );

        console.log(
          "AVATAR:",
          data.avatar
        );

        setUser(data);

      } catch {

        console.log(
          "Profile load failed"
        );

      }

    };

    if (token) {
      loadProfile();
    }

  }, [token]);

  /*
  =========================================================
  LOAD NOTIFICATIONS
  =========================================================
  */

  useEffect(() => {

    const loadNotifications = async () => {

      try {

        const res = await fetch(
          NOTIFY_API,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          return;
        }

        const data = await res.json();

        setNotifications(data);

      } catch {

        console.log(
          "Notifications failed"
        );

      }

    };

    if (token) {
      loadNotifications();
    }

  }, [token]);

  /*
  =========================================================
  REALTIME NOTIFICATIONS
  =========================================================
  */

  useEffect(() => {

    if (!token) {
      return;
    }

    const handleNewSale = (data) => {

      console.log(
        "Realtime sale received:",
        data
      );

      const sale = data.sale;

      if (!sale) {
        return;
      }

      const newNotification = {

        _id: sale._id,

        message:
          `New sale recorded - R${sale.revenue}`,

        createdAt:
          new Date()

      };

      setNotifications(
        (prev) => [
          newNotification,
          ...prev
        ]
      );

    };

    socket.on(
      "newSale",
      handleNewSale
    );

    return () => {

      socket.off(
        "newSale",
        handleNewSale
      );

    };

  }, [token]);

  /*
  =========================================================
  LOGOUT
  =========================================================
  */

  const handleLogout = () => {

    localStorage.clear();

    navigate("/");

  };

  /*
  =========================================================
  PROFILE
  =========================================================
  */

  const goToProfile = () => {

    if (!user?.role) {
      return;
    }

    setOpen(false);

    navigate(
      `/${user.role}/profile`
    );

  };

  /*
  =========================================================
  TOGGLE NOTIFICATIONS
  =========================================================
  */

  const handleNotifications = () => {

    const willOpen =
      !showNotifications;

    setShowNotifications(
      willOpen
    );

    if (willOpen) {

      setNotifications([]);

    }

  };

  /*
  =========================================================
  AVATAR URL
  =========================================================
  */

  const getAvatarUrl = () => {

    if (!user?.avatar) {
      return "";
    }

    const baseURL =
      import.meta.env.VITE_API_URL
        .replace("/api", "");

    return `${baseURL}${user.avatar}`;

  };

  /*
  =========================================================
  RETURN
  =========================================================
  */

  return (

    <header
      style={header(
        darkMode,
        isMobile
      )}
    >

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div
        style={brandSection}
      >

        <div
          style={logoWrapper(
            darkMode
          )}
        >

          <img
            src="/Logo.png"
            alt="Sediba Still Water"
            style={logo}
            onError={(e) => {

              e.currentTarget.style.display =
                "none";

            }}
          />

        </div>

        <div
          style={brandText}
        >

          <div
            style={systemName(
              darkMode
            )}
          >
            Sediba Still Water
          </div>

          <div
            style={systemSubtitle(
              darkMode
            )}
          >
            Management System
          </div>

        </div>

      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div
        style={rightSection(
          isMobile
        )}
      >

        {/* =================================================
            THEME BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={toggleTheme}
          style={themeBtn(
            darkMode
          )}
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >

          {darkMode ? (

            <svg
              width="17"
              height="17"
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
                r="4"
              />

              <path
                d="M12 2v2"
              />

              <path
                d="M12 20v2"
              />

              <path
                d="m4.93 4.93 1.41 1.41"
              />

              <path
                d="m17.66 17.66 1.41 1.41"
              />

              <path
                d="M2 12h2"
              />

              <path
                d="M20 12h2"
              />

              <path
                d="m6.34 17.66-1.41 1.41"
              />

              <path
                d="m19.07 4.93-1.41 1.41"
              />

            </svg>

          ) : (

            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <path
                d="M21 12.79A9 9 0 1 1 11.21 3
                7 7 0 0 0 21 12.79z"
              />

            </svg>

          )}

          {!isMobile && (

            <span>
              {darkMode
                ? "Light"
                : "Dark"}
            </span>

          )}

        </button>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div
          style={notificationWrapper}
        >

          <button
            type="button"
            onClick={handleNotifications}
            style={notificationButton(
              darkMode
            )}
            title="Notifications"
          >

            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <path
                d="M18 8a6 6 0 0 0-12 0
                c0 7-3 7-3 9h18c0-2-3-2-3-9"
              />

              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
              />

            </svg>

            {notifications.length > 0 && (

              <span
                style={badge}
              >
                {notifications.length > 99
                  ? "99+"
                  : notifications.length}
              </span>

            )}

          </button>

          {showNotifications && (

            <div
              style={notificationDropdown(
                darkMode,
                isMobile
              )}
            >

              <div
                style={notificationHeader(
                  darkMode
                )}
              >

                <div>

                  <strong>
                    Notifications
                  </strong>

                  <span
                    style={notificationCount}
                  >
                    {notifications.length}
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  style={closeButton(
                    darkMode
                  )}
                >

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >

                    <path
                      d="M18 6 6 18"
                    />

                    <path
                      d="m6 6 12 12"
                    />

                  </svg>

                </button>

              </div>

              <div
                style={notificationList}
              >

                {notifications.length === 0 ? (

                  <div
                    style={emptyNotifications(
                      darkMode
                    )}
                  >

                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >

                      <path
                        d="M18 8a6 6 0 0 0-12 0
                        c0 7-3 7-3 9h18c0-2-3-2-3-9"
                      />

                      <path
                        d="M13.73 21a2 2 0 0 1-3.46 0"
                      />

                    </svg>

                    <span>
                      No notifications
                    </span>

                  </div>

                ) : (

                  notifications.map(
                    (n, index) => (

                      <div
                        key={
                          n._id ||
                          index
                        }
                        style={notificationItem(
                          darkMode
                        )}
                      >

                        <div
                          style={
                            notificationIcon
                          }
                        >

                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >

                            <path
                              d="M20 7h-9"
                            />

                            <path
                              d="M14 17H5"
                            />

                            <circle
                              cx="17"
                              cy="17"
                              r="3"
                            />

                            <circle
                              cx="7"
                              cy="7"
                              r="3"
                            />

                          </svg>

                        </div>

                        <div
                          style={
                            notificationMessage
                          }
                        >

                          {n.message}

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          )}

        </div>

        {/* =================================================
            USER PROFILE
        ================================================= */}

        <div
          style={userBox}
        >

          <button
            type="button"
            onClick={() =>
              setOpen(!open)
            }
            style={profileButton(
              darkMode,
              isMobile
            )}
          >

            <div
              style={avatar(
                darkMode
              )}
            >

              {user?.avatar ? (

                <img
                  src={getAvatarUrl()}
                  alt="User avatar"
                  style={avatarImage}
                />

              ) : (

                user?.name?.[0]
                  ?.toUpperCase() || "U"

              )}

            </div>

            {!isMobile && (

              <div
                style={profileInfo}
              >

                <span
                  style={profileName(
                    darkMode
                  )}
                >
                  {user?.name ||
                    "User"}
                </span>

                <span
                  style={profileRole(
                    darkMode
                  )}
                >
                  {user?.role ||
                    "User"}
                </span>

              </div>

            )}

            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >

              <path
                d="m6 9 6 6 6-6"
              />

            </svg>

          </button>

          {open && (

            <div
              style={dropdown(
                darkMode,
                isMobile
              )}
            >

              <div
                style={dropdownProfile(
                  darkMode
                )}
              >

                <div
                  style={dropdownAvatar(
                    darkMode
                  )}
                >

                  {user?.avatar ? (

                    <img
                      src={getAvatarUrl()}
                      alt="User avatar"
                      style={dropdownAvatarImage}
                    />

                  ) : (

                    user?.name?.[0]
                      ?.toUpperCase() || "U"

                  )}

                </div>

                <div>

                  <strong
                    style={dropdownName(
                      darkMode
                    )}
                  >
                    {user?.name ||
                      "User"}
                  </strong>

                  <span
                    style={dropdownRole(
                      darkMode
                    )}
                  >
                    {user?.role ||
                      "User"}
                  </span>

                </div>

              </div>

              <div
                style={divider(
                  darkMode
                )}
              />

              <button
                type="button"
                onClick={goToProfile}
                style={menuButton(
                  darkMode
                )}
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                  />

                  <path
                    d="M4 21a8 8 0 0 1 16 0"
                  />

                </svg>

                <span>
                  Edit Profile
                </span>

              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={logoutButton}
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5
                    a2 2 0 0 1 2-2h4"
                  />

                  <polyline
                    points="16 17 21 12 16 7"
                  />

                  <line
                    x1="21"
                    y1="12"
                    x2="9"
                    y2="12"
                  />

                </svg>

                <span>
                  Logout
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>

  );

};

/* =========================================================
   HEADER STYLES
========================================================= */

const header = (
  darkMode,
  isMobile
) => ({

  width: "100%",

  minHeight: isMobile
    ? "64px"
    : "72px",

  padding: isMobile
    ? "10px 14px"
    : "12px 25px",

  boxSizing: "border-box",

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  gap: "15px",

  background: darkMode
    ? "linear-gradient(135deg,#0f172a,#172554)"
    : "linear-gradient(135deg,#0284c7,#0369a1)",

  borderBottom:
    darkMode
      ? "1px solid rgba(148,163,184,0.15)"
      : "1px solid rgba(255,255,255,0.18)",

  boxShadow:
    darkMode
      ? "0 8px 25px rgba(0,0,0,0.20)"
      : "0 8px 25px rgba(3,105,161,0.18)",

  position: "relative",

  zIndex: 100

});

/* =========================================================
   BRAND
========================================================= */

const brandSection = {

  display: "flex",

  alignItems: "center",

  gap: "12px",

  minWidth: 0

};

const logoWrapper = (
  darkMode
) => ({

  width: "42px",

  height: "42px",

  minWidth: "42px",

  borderRadius: "11px",

  background: "#ffffff",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  overflow: "hidden",

  border:
    darkMode
      ? "1px solid rgba(255,255,255,0.20)"
      : "1px solid rgba(255,255,255,0.50)",

  boxShadow:
    "0 4px 12px rgba(0,0,0,0.15)"

});

const logo = {

  width: "34px",

  height: "34px",

  objectFit: "contain",

  display: "block"

};

const brandText = {

  display: "flex",

  flexDirection: "column",

  minWidth: 0

};

const systemName = (
  darkMode
) => ({

  color: "#ffffff",

  fontSize: "17px",

  fontWeight: "800",

  lineHeight: "1.2",

  whiteSpace: "nowrap",

  overflow: "hidden",

  textOverflow: "ellipsis",

  letterSpacing: "-0.2px"

});

const systemSubtitle = (
  darkMode
) => ({

  color:
    darkMode
      ? "#93c5fd"
      : "rgba(255,255,255,0.78)",

  fontSize: "10px",

  fontWeight: "600",

  marginTop: "3px",

  letterSpacing: "0.5px",

  textTransform:
    "uppercase"

});

/* =========================================================
   RIGHT SECTION
========================================================= */

const rightSection = (
  isMobile
) => ({

  display: "flex",

  alignItems: "center",

  gap: isMobile
    ? "8px"
    : "12px",

  flexShrink: 0

});

/* =========================================================
   THEME BUTTON
========================================================= */

const themeBtn = (
  darkMode
) => ({

  height: "38px",

  padding: "0 11px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: "7px",

  borderRadius: "9px",

  border:
    "1px solid rgba(255,255,255,0.25)",

  background:
    "rgba(255,255,255,0.10)",

  color: "#ffffff",

  cursor: "pointer",

  fontSize: "12px",

  fontWeight: "700",

  transition:
    "all 0.2s ease"

});

/* =========================================================
   NOTIFICATIONS
========================================================= */

const notificationWrapper = {

  position: "relative",

  flexShrink: 0

};

const notificationButton = (
  darkMode
) => ({

  position: "relative",

  width: "38px",

  height: "38px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  borderRadius: "9px",

  border:
    "1px solid rgba(255,255,255,0.25)",

  background:
    "rgba(255,255,255,0.10)",

  color: "#ffffff",

  cursor: "pointer",

  transition:
    "all 0.2s ease"

});

const badge = {

  position: "absolute",

  top: "-5px",

  right: "-5px",

  minWidth: "18px",

  height: "18px",

  padding: "0 4px",

  boxSizing: "border-box",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  borderRadius: "20px",

  background: "#ef4444",

  color: "#ffffff",

  fontSize: "9px",

  fontWeight: "800",

  border:
    "2px solid #0284c7"

};

const notificationDropdown = (
  darkMode,
  isMobile
) => ({

  position: "absolute",

  top: "48px",

  right: isMobile
    ? "-65px"
    : "0",

  width: isMobile
    ? "calc(100vw - 28px)"
    : "340px",

  maxWidth: "340px",

  background:
    darkMode
      ? "#111827"
      : "#ffffff",

  border:
    darkMode
      ? "1px solid #263244"
      : "1px solid #e5e7eb",

  borderRadius: "14px",

  boxShadow:
    "0 18px 45px rgba(0,0,0,0.25)",

  overflow: "hidden",

  zIndex: 200

});

const notificationHeader = (
  darkMode
) => ({

  padding: "14px 16px",

  display: "flex",

  alignItems: "center",

  justifyContent:
    "space-between",

  borderBottom:
    darkMode
      ? "1px solid #263244"
      : "1px solid #e5e7eb",

  color:
    darkMode
      ? "#f8fafc"
      : "#111827",

  fontSize: "14px"

});

const notificationCount = {

  marginLeft: "7px",

  padding: "2px 7px",

  borderRadius: "20px",

  background: "#0284c7",

  color: "#ffffff",

  fontSize: "10px",

  fontWeight: "800"

};

const closeButton = (
  darkMode
) => ({

  width: "28px",

  height: "28px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  border: "none",

  background: "transparent",

  color:
    darkMode
      ? "#94a3b8"
      : "#64748b",

  cursor: "pointer",

  borderRadius: "7px"

});

const notificationList = {

  maxHeight: "300px",

  overflowY: "auto"

};

const emptyNotifications = (
  darkMode
) => ({

  minHeight: "150px",

  display: "flex",

  flexDirection: "column",

  alignItems: "center",

  justifyContent: "center",

  gap: "9px",

  color:
    darkMode
      ? "#64748b"
      : "#94a3b8",

  fontSize: "12px"

});

const notificationItem = (
  darkMode
) => ({

  padding: "13px 15px",

  display: "flex",

  alignItems: "flex-start",

  gap: "10px",

  borderBottom:
    darkMode
      ? "1px solid #1f2937"
      : "1px solid #f1f5f9",

  background:
    darkMode
      ? "#111827"
      : "#ffffff"

});

const notificationIcon = {

  width: "30px",

  height: "30px",

  minWidth: "30px",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  borderRadius: "8px",

  background: "#e0f2fe",

  color: "#0284c7"

};

const notificationMessage = {

  flex: 1,

  fontSize: "12px",

  lineHeight: "1.5",

  color: "inherit"

};

/* =========================================================
   USER
========================================================= */

const userBox = {

  position: "relative",

  flexShrink: 0

};

const profileButton = (
  darkMode,
  isMobile
) => ({

  height: "44px",

  padding: isMobile
    ? "3px"
    : "3px 9px 3px 3px",

  display: "flex",

  alignItems: "center",

  gap: "8px",

  borderRadius: "12px",

  border:
    "1px solid rgba(255,255,255,0.25)",

  background:
    "rgba(255,255,255,0.10)",

  color: "#ffffff",

  cursor: "pointer"

});

const avatar = (
  darkMode
) => ({

  width: "36px",

  height: "36px",

  minWidth: "36px",

  borderRadius: "50%",

  background:
    darkMode
      ? "#2563eb"
      : "#ffffff",

  color:
    darkMode
      ? "#ffffff"
      : "#0284c7",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  fontWeight: "800",

  fontSize: "14px",

  overflow: "hidden",

  border:
    "2px solid rgba(255,255,255,0.35)"

});

const avatarImage = {

  display: "block",

  width: "100%",

  height: "100%",

  borderRadius: "50%",

  objectFit: "cover"

};

const profileInfo = {

  display: "flex",

  flexDirection: "column",

  alignItems: "flex-start",

  minWidth: "70px",

  maxWidth: "130px"

};

const profileName = (
  darkMode
) => ({

  color: "#ffffff",

  fontSize: "12px",

  fontWeight: "800",

  whiteSpace: "nowrap",

  overflow: "hidden",

  textOverflow: "ellipsis",

  maxWidth: "130px"

});

const profileRole = (
  darkMode
) => ({

  color:
    darkMode
      ? "#93c5fd"
      : "rgba(255,255,255,0.75)",

  fontSize: "9px",

  fontWeight: "600",

  marginTop: "2px",

  textTransform:
    "capitalize"

});

/* =========================================================
   USER DROPDOWN
========================================================= */

const dropdown = (
  darkMode,
  isMobile
) => ({

  position: "absolute",

  top: "53px",

  right: "0",

  width: isMobile
    ? "220px"
    : "245px",

  background:
    darkMode
      ? "#111827"
      : "#ffffff",

  border:
    darkMode
      ? "1px solid #263244"
      : "1px solid #e5e7eb",

  borderRadius: "14px",

  boxShadow:
    "0 18px 45px rgba(0,0,0,0.25)",

  overflow: "hidden",

  zIndex: 250

});

const dropdownProfile = (
  darkMode
) => ({

  padding: "15px",

  display: "flex",

  alignItems: "center",

  gap: "11px"

});

const dropdownAvatar = (
  darkMode
) => ({

  width: "40px",

  height: "40px",

  minWidth: "40px",

  borderRadius: "50%",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  background:
    darkMode
      ? "#2563eb"
      : "#e0f2fe",

  color:
    darkMode
      ? "#ffffff"
      : "#0284c7",

  fontWeight: "800",

  overflow: "hidden"

});

const dropdownAvatarImage = {

  width: "100%",

  height: "100%",

  objectFit: "cover",

  borderRadius: "50%",

  display: "block"

};

const dropdownName = (
  darkMode
) => ({

  display: "block",

  color:
    darkMode
      ? "#f8fafc"
      : "#111827",

  fontSize: "13px",

  fontWeight: "800"

});

const dropdownRole = (
  darkMode
) => ({

  display: "block",

  marginTop: "3px",

  color:
    darkMode
      ? "#94a3b8"
      : "#64748b",

  fontSize: "10px",

  textTransform:
    "capitalize"

});

const divider = (
  darkMode
) => ({

  height: "1px",

  background:
    darkMode
      ? "#263244"
      : "#e5e7eb"

});

const menuButton = (
  darkMode
) => ({

  width: "100%",

  padding: "12px 15px",

  display: "flex",

  alignItems: "center",

  gap: "10px",

  border: "none",

  background: "transparent",

  color:
    darkMode
      ? "#e2e8f0"
      : "#334155",

  cursor: "pointer",

  textAlign: "left",

  fontSize: "12px",

  fontWeight: "600"

});

const logoutButton = {

  width: "100%",

  padding: "12px 15px",

  display: "flex",

  alignItems: "center",

  gap: "10px",

  border: "none",

  background: "transparent",

  color: "#ef4444",

  cursor: "pointer",

  textAlign: "left",

  fontSize: "12px",

  fontWeight: "700",

  borderTop:
    "1px solid rgba(148,163,184,0.10)"

};

export default Header;