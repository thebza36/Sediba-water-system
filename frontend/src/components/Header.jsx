import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import socket from "../socket"; // 🔥 ADDED

const API = `${import.meta.env.VITE_API_URL}/users`;
const NOTIFY_API = `${import.meta.env.VITE_API_URL}/notifications`;


const Header = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const token = localStorage.getItem("token");

  // 🔹 Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
      } catch {
        console.log("Profile load failed");
      }
    };

    if (token) loadProfile();
  }, [token]);

  // 🔔 Load notifications (initial fetch)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch(NOTIFY_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data);
      } catch {
        console.log("Notifications failed");
      }
    };

    if (token) loadNotifications();
  }, [token]);

// 🔥 REALTIME LISTENER (FIXED)
useEffect(() => {
  if (!token) return;

  socket.on("newSale", (data) => {
    console.log("🔥 Realtime sale received:", data);

    const sale = data.sale;

    const newNotification = {
      _id: sale._id,
      message: `New sale recorded - R${sale.revenue}`,
      createdAt: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
  });

  return () => {
    socket.off("newSale");
  };
}, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goToProfile = () => {
    if (!user?.role) return;
    setOpen(false);
    navigate(`/${user.role}/profile`);
  };

  return (
    <div style={header}>
      <h3>Sediba Still Water System</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>

        {/* 🌙 THEME */}
        <button onClick={toggleTheme} style={themeBtn}>
          {darkMode ? "☀ Light" : "🌙 Dark"}
        </button>

        {/* 🔔 NOTIFICATION BELL */}
<div
  style={bellBox}
  onClick={() => {
    setShowNotifications(!showNotifications);

    // Clear notification counter when opened
    if (!showNotifications) {
      setNotifications([]);
    }
  }}
>
  <span style={{ fontSize: 20 }}>🔔</span>

  {notifications.length > 0 && (
    <span style={badge}>
      {notifications.length}
    </span>
  )}

  {showNotifications && (
    <div style={notificationDropdown}>
      {notifications.length === 0 ? (
        <div style={dropdownItem}>No notifications</div>
      ) : (
        notifications.map((n, index) => (
          <div key={index} style={dropdownItem}>
            {n.message}
          </div>
        ))
      )}
    </div>
  )}
</div>

        {/* USER */}
        <div style={userBox}>
          <div style={avatar} onClick={() => setOpen(!open)}>
            {user?.avatar ? (
              <img
                src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${user.avatar}`}
                alt="avatar"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>

          {open && (
            <div style={dropdown}>
              <div style={dropdownItem}>
                <b>{user?.name || "User"}</b>
                <br />
                <small>{user?.role}</small>
              </div>

              <div style={divider}></div>

              <div style={dropdownItem} onClick={goToProfile}>
                Edit Profile
              </div>

              <div style={logoutBtn} onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

/* STYLES */

const header = {
  background: "white",
  padding: "15px 25px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb"
};

const themeBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  cursor: "pointer",
  background: "#f8fafc"
};

/* 🔔 Bell styles */
const bellBox = {
  position: "relative",
  cursor: "pointer"
};

const notificationDropdown = {
  position: "absolute",
  top: 30,
  right: 0,
  background: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  borderRadius: 8,
  minWidth: 250,
  zIndex: 100,
  maxHeight: 300,
  overflowY: "auto"
};

const badge = {
  position: "absolute",
  top: -6,
  right: -10,
  background: "#dc2626",
  color: "white",
  fontSize: 11,
  minWidth: 18,
  height: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  fontWeight: "bold"
};

const userBox = { position: "relative" };

const avatar = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  background: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  cursor: "pointer",
  overflow: "hidden"
};

const dropdown = {
  position: "absolute",
  top: 50,
  right: 0,
  background: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  borderRadius: 8,
  minWidth: 180,
  zIndex: 50
};

const dropdownItem = {
  padding: 12,
  cursor: "pointer"
};

const divider = { height: 1, background: "#eee" };

const logoutBtn = {
  padding: 12,
  cursor: "pointer",
  color: "#dc2626",
  fontWeight: 500
};

export default Header;