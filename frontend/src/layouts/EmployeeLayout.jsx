import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function EmployeeLayout() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const closeMenu = () => {
    if (isMobile) setMenuOpen(false);
  };

 const handleLogout = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  navigate("/");

};

  return (
    <div style={layout}>

      {isMobile && (
        <button style={menuBtn} onClick={() => setMenuOpen(true)}>
          ☰
        </button>
      )}

      {/* SIDEBAR */}
      <div
        style={{
          ...sidebar,
          transform: isMobile
            ? menuOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)"
        }}
      >

        {isMobile && (
          <button style={closeBtn} onClick={closeMenu}>
            ✕
          </button>
        )}

        <h2 style={{ marginBottom: 30 }}>💧 Sediba</h2>

        {/* CORE */}
        <Nav to="/employee/dashboard" icon="📊" label="Dashboard" onNavigate={closeMenu} />
        <Nav to="/employee/record-sale" icon="💰" label="Record Sale" onNavigate={closeMenu} />
        <Nav to="/employee/my-sales" icon="📜" label="My Sales" onNavigate={closeMenu} />

        {/* NEW FEATURES */}
        <Nav to="/employee/books" icon="📚" label="Books" onNavigate={closeMenu} />
        <Nav to="/employee/readings" icon="🧾" label="Meter Readings" onNavigate={closeMenu} />
        <Nav to="/employee/deliveries" icon="🚚" label="Deliveries" onNavigate={closeMenu} />

        {/* PERFORMANCE */}
        <Nav to="/employee/top-employees" icon="🏆" label="Top Employees" onNavigate={closeMenu} />

        {/* USER */}
        <Nav to="/employee/profile" icon="👤" label="Profile" onNavigate={closeMenu} />

        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>

      </div>

      {/* MAIN AREA */}
      <div style={{ ...main, marginLeft: isMobile ? 0 : 220 }}>

        <Header />

        <div style={content}>
          <Outlet />
        </div>

        <Footer />

      </div>

    </div>
  );
}

/* NAV ITEM */

const Nav = ({ to, label, icon, onNavigate }) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    style={({ isActive }) => ({
      ...nav,
      background: isActive ? "#334155" : "transparent",
      fontWeight: isActive ? "600" : "400",
      transform: isActive ? "translateX(4px)" : "translateX(0)"
    })}
  >
    <span style={{ marginRight: 10 }}>{icon}</span>
    {label}
  </NavLink>
);

/* STYLES */

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#f4f6f9",
  overflowX: "hidden"
};

const sidebar = {
  width: 220,
  background: "#1e293b",
  color: "white",
  padding: 20,
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  transition: "transform .3s ease",
  zIndex: 1100
};

const main = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%"
};

const content = {
  flex: 1,
  padding: 30
};

const nav = {
  display: "block",
  color: "white",
  marginBottom: 15,
  textDecoration: "none",
  fontSize: 15,
  padding: "10px 12px",
  borderRadius: 6,
  transition: "all .2s"
};

const logoutBtn = {
  marginTop: 30,
  padding: "8px 12px",
  background: "#ef4444",
  border: "none",
  color: "white",
  cursor: "pointer",
  borderRadius: 4
};

const menuBtn = {
  position: "fixed",
  top: 15,
  left: 15,
  zIndex: 1200,
  background: "#1e293b",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 18
};

const closeBtn = {
  position: "absolute",
  top: 15,
  right: 15,
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 20,
  cursor: "pointer"
};

export default EmployeeLayout;