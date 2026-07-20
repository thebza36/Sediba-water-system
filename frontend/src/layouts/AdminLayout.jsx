import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AdminLayout = () => {
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

        <h2 style={{ marginBottom: 25 }}>💧 Sediba</h2>

        <Nav to="/admin/dashboard" icon="📊" label="Dashboard" onNavigate={closeMenu} />
        <Nav to="/admin/products" icon="📦" label="Products" onNavigate={closeMenu} />
        <Nav to="/admin/inventory" icon="📦" label="Inventory" onNavigate={closeMenu} />
        <Nav to="/admin/meters" icon="💧" label="Meters" onNavigate={closeMenu} />
        <Nav to="/admin/meter-readings" icon="📋" label="Meter Readings" onNavigate={closeMenu}/>
        <Nav to="/admin/tank-refills" icon="🚰" label="Tank Refills" onNavigate={closeMenu}/>
        <Nav to="/admin/clients" icon="👥" label="Clients" onNavigate={closeMenu} />
        <Nav to="/admin/employees" icon="🛠" label="Employees" onNavigate={closeMenu} />
        <Nav to="/admin/sales-history" icon="📜" label="Sales History" onNavigate={closeMenu} />
        <Nav to="/admin/reports" icon="📄" label="Reports" onNavigate={closeMenu} />
        <Nav to="/admin/expenses" icon="💸" label="Expenses" onNavigate={closeMenu} />
        <Nav to="/admin/alerts" icon="🔔" label="Alerts" onNavigate={closeMenu} />
        <Nav to="/admin/settings" icon="⚙" label="Settings" onNavigate={closeMenu} />
      </div>

      {/* MAIN */}
      <div style={{ ...main, marginLeft: isMobile ? 0 : 250 }}>
        <Header />

        <div style={content}>
          <Outlet />
        </div>

        <Footer />
      </div>
    </div>
  );
};

const Nav = ({ to, label, icon, onNavigate }) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    style={({ isActive }) => ({
      ...nav,
      background: isActive ? "#1e293b" : "transparent",
      fontWeight: isActive ? "600" : "400"
    })}
  >
    <span style={{ marginRight: 10 }}>{icon}</span>
    {label}
  </NavLink>
);

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#f1f5f9",
  overflowX: "hidden"
};

const sidebar = {
  width: 250,
  background: "#0f172a",
  color: "white",
  padding: 25,
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  transition: "transform .3s ease",
  zIndex: 1100,
  overflowY: "auto"
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
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 8,
  textDecoration: "none",
  color: "white",
  transition: "all .2s ease"
};

const menuBtn = {
  position: "fixed",
  top: 15,
  left: 15,
  zIndex: 1200,
  background: "#0f172a",
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

export default AdminLayout;