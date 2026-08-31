import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Menu,
  X,
  Droplets,
  LayoutDashboard,
  Package,
  Boxes,
  Gauge,
  ClipboardList,
  Users,
  UserCog,
  FileText,
  DollarSign,
  Bell,
  Settings,
  ScrollText,
  Truck,
  LogOut
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";


const AdminLayout = () => {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );


  /* =====================================================
     MOBILE SCREEN DETECTION
  ===================================================== */

  useEffect(() => {

    const resize = () => {

      setIsMobile(window.innerWidth < 768);

      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }

    };


    window.addEventListener(
      "resize",
      resize
    );


    return () => {

      window.removeEventListener(
        "resize",
        resize
      );

    };

  }, []);


  /* =====================================================
     CLOSE MOBILE MENU
  ===================================================== */

  const closeMenu = () => {

    if (isMobile) {
      setMenuOpen(false);
    }

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    localStorage.removeItem("user");

    navigate("/");

  };


  return (

    <div style={layout}>


      {/* =================================================
          MOBILE MENU BUTTON
      ================================================= */}

      {isMobile && !menuOpen && (

        <button
          style={menuBtn}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >

          <Menu size={24} />

        </button>

      )}


      {/* =================================================
          DARK OVERLAY
      ================================================= */}

      {isMobile && menuOpen && (

        <div
          style={overlay}
          onClick={closeMenu}
        />

      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

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

          <span>
            Sediba
          </span>

        </h2>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <Nav
          to="/admin/dashboard"
          icon={
            <LayoutDashboard size={20} />
          }
          label="Dashboard"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/products"
          icon={
            <Package size={20} />
          }
          label="Products"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/inventory"
          icon={
            <Boxes size={20} />
          }
          label="Inventory"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/meters"
          icon={
            <Gauge size={20} />
          }
          label="Meters"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/meter-readings"
          icon={
            <ClipboardList size={20} />
          }
          label="Meter Readings"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/tank-refills"
          icon={
            <Truck size={20} />
          }
          label="Tank Refills"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/clients"
          icon={
            <Users size={20} />
          }
          label="Clients"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/employees"
          icon={
            <UserCog size={20} />
          }
          label="Employees"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/sales-history"
          icon={
            <ScrollText size={20} />
          }
          label="Sales History"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/reports"
          icon={
            <FileText size={20} />
          }
          label="Reports"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/expenses"
          icon={
            <DollarSign size={20} />
          }
          label="Expenses"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/alerts"
          icon={
            <Bell size={20} />
          }
          label="Alerts"
          onNavigate={closeMenu}
        />


        <Nav
          to="/admin/settings"
          icon={
            <Settings size={20} />
          }
          label="Settings"
          onNavigate={closeMenu}
        />


        {/* =================================================
            LOGOUT BUTTON
        ================================================= */}

        <button
          onClick={handleLogout}
          style={logoutBtn}
        >

          <LogOut size={19} />

          <span>
            Logout
          </span>

        </button>


      </div>


      {/* =================================================
          MAIN
      ================================================= */}

      <div
        style={{
          ...main,

          marginLeft: isMobile
            ? 0
            : 250
        }}
      >

        <Header />


        {/* =================================================
            CONTENT
        ================================================= */}

        <div style={content}>

          <Outlet />

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <Footer />

      </div>


    </div>

  );

};


/* =========================================================
   NAVIGATION COMPONENT
========================================================= */

const Nav = ({
  to,
  label,
  icon,
  onNavigate
}) => (

  <NavLink
    to={to}
    onClick={onNavigate}

    style={({ isActive }) => ({

      ...nav,

      background: isActive
        ? "#1e293b"
        : "transparent",

      fontWeight: isActive
        ? "600"
        : "500"

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

  overflowX: "hidden"

};


/* =========================================================
   MOBILE OVERLAY
========================================================= */

const overlay = {

  position: "fixed",

  inset: 0,

  background: "rgba(0,0,0,.45)",

  zIndex: 1090

};


/* =========================================================
   SIDEBAR
========================================================= */

const sidebar = {

  width: 250,

  background: "#0f172a",

  color: "#fff",

  position: "fixed",

  top: 0,

  left: 0,

  bottom: 0,

  padding: 22,

  overflowY: "auto",

  transition: ".3s",

  zIndex: 1100,

  boxShadow:
    "0 12px 30px rgba(0,0,0,.35)"

};


/* =========================================================
   LOGO
========================================================= */

const logo = {

  marginBottom: 30,

  textAlign: "center",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: 8

};


/* =========================================================
   MAIN CONTENT
========================================================= */

const main = {

  flex: 1,

  display: "flex",

  flexDirection: "column",

  width: "100%"

};


/* =========================================================
   CONTENT
========================================================= */

const content = {

  flex: 1,

  padding: 25

};


/* =========================================================
   NAVIGATION
========================================================= */

const nav = {

  display: "flex",

  alignItems: "center",

  marginBottom: 8,

  padding: "12px 14px",

  borderRadius: 8,

  textDecoration: "none",

  color: "#fff",

  transition: ".2s"

};


/* =========================================================
   NAVIGATION ICON
========================================================= */

const navIcon = {

  width: 24,

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  marginRight: 12

};


/* =========================================================
   LOGOUT BUTTON
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

  gap: 8

};


/* =========================================================
   MOBILE MENU BUTTON
========================================================= */

const menuBtn = {

  position: "fixed",

  top: 16,

  left: 16,

  zIndex: 1200,

  background: "#0f172a",

  color: "#fff",

  border: "none",

  width: 45,

  height: 45,

  borderRadius: 10,

  cursor: "pointer",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  boxShadow:
    "0 4px 12px rgba(0,0,0,.3)"

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

  justifyContent: "center"

};


export default AdminLayout;