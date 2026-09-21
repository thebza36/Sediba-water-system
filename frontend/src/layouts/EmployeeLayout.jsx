import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Menu,
  X,
  Droplets,
  LayoutDashboard,
  DollarSign,
  ScrollText,
  BookOpen,
  ClipboardList,
  Truck,
  Trophy,
  User,
  LogOut,
  FlaskConical,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

function EmployeeLayout() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* =========================================================
     RESPONSIVE MOBILE MENU
  ========================================================= */

  useEffect(() => {
    const resize = () => {
      setIsMobile(window.innerWidth < 768);

      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  /* =========================================================
     CLOSE MOBILE MENU
  ========================================================= */

  const closeMenu = () => {
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div style={layout}>

      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      {isMobile && !menuOpen && (
        <button
          style={menuBtn}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isMobile && menuOpen && (
        <div
          style={overlay}
          onClick={closeMenu}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div
        style={{
          ...sidebar,
          transform: isMobile
            ? menuOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
        }}
      >

        {/* =================================================
            MOBILE CLOSE BUTTON
        ================================================= */}

        {isMobile && (
          <button
            style={closeBtn}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}

        {/* =================================================
            LOGO
        ================================================= */}

        <h2 style={logo}>
          <Droplets size={27} />
          <span>Sediba</span>
        </h2>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <Nav
          to="/employee/dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/record-sale"
          icon={<DollarSign size={20} />}
          label="Record Sale"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/my-sales"
          icon={<ScrollText size={20} />}
          label="My Sales"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/books"
          icon={<BookOpen size={20} />}
          label="Books"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/readings"
          icon={<ClipboardList size={20} />}
          label="Meter Readings"
          onNavigate={closeMenu}
        />

        {/* =================================================
            WATER TESTS
        ================================================= */}

        <Nav
          to="/employee/water-tests"
          icon={<FlaskConical size={20} />}
          label="Water Tests"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/deliveries"
          icon={<Truck size={20} />}
          label="Deliveries"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/top-employees"
          icon={<Trophy size={20} />}
          label="Top Employees"
          onNavigate={closeMenu}
        />

        <Nav
          to="/employee/profile"
          icon={<User size={20} />}
          label="Profile"
          onNavigate={closeMenu}
        />

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          onClick={handleLogout}
          style={logoutBtn}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        style={{
          ...main,
          marginLeft: isMobile ? 0 : 240,
        }}
      >

        {/* HEADER */}

        <Header />

        {/* CONTENT */}

        <div style={content}>
          <Outlet />
        </div>

        {/* FOOTER */}

        <Footer />

      </div>

    </div>
  );
}

/* =========================================================
   NAVIGATION COMPONENT
========================================================= */

const Nav = ({
  to,
  icon,
  label,
  onNavigate,
}) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    style={({ isActive }) => ({
      ...nav,
      background: isActive
        ? "#334155"
        : "transparent",
      fontWeight: isActive
        ? "600"
        : "500",
    })}
  >

    <span style={navIcon}>
      {icon}
    </span>

    <span>
      {label}
    </span>

  </NavLink>
);

/* =========================================================
   MAIN LAYOUT
========================================================= */

const layout = {
  display: "flex",
  minHeight: "100vh",
  background: "#f5f7fb",
  overflowX: "hidden",
};

/* =========================================================
   MOBILE OVERLAY
========================================================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.45)",
  zIndex: 1090,
};

/* =========================================================
   SIDEBAR
========================================================= */

const sidebar = {
  width: 240,
  background: "#1e293b",
  color: "#fff",
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  padding: 20,
  transition: ".3s",
  zIndex: 1100,
  boxShadow: "0 10px 30px rgba(0,0,0,.35)",
  overflowY: "auto",
  boxSizing: "border-box",
};

/* =========================================================
   LOGO
========================================================= */

const logo = {
  marginBottom: 35,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

/* =========================================================
   MAIN
========================================================= */

const main = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

/* =========================================================
   CONTENT
========================================================= */

const content = {
  flex: 1,
  padding: 25,
  boxSizing: "border-box",
};

/* =========================================================
   NAVIGATION
========================================================= */

const nav = {
  display: "flex",
  alignItems: "center",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 14px",
  marginBottom: 8,
  borderRadius: 8,
  transition: ".2s",
  width: "100%",
  boxSizing: "border-box",
};

/* =========================================================
   NAV ICON
========================================================= */

const navIcon = {
  width: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
  flexShrink: 0,
};

/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn = {
  marginTop: 35,
  width: "100%",
  padding: 12,
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

/* =========================================================
   MOBILE MENU BUTTON
========================================================= */

const menuBtn = {
  position: "fixed",
  top: 16,
  left: 16,
  zIndex: 1200,
  background: "#1e293b",
  color: "#fff",
  border: "none",
  width: 45,
  height: 45,
  borderRadius: 10,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,.3)",
};

/* =========================================================
   MOBILE CLOSE BUTTON
========================================================= */

const closeBtn = {
  position: "absolute",
  top: 15,
  right: 15,
  background: "transparent",
  border: "none",
  color: "#fff",
  width: 40,
  height: 40,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default EmployeeLayout;