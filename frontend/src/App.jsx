import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

import socket from "./socket";
import SessionTimeout from "./components/SessionTimeout";

/* =========================================================
   PUBLIC
========================================================= */

import Login from "./pages/Login";

/* =========================================================
   ADMIN PAGES
========================================================= */

import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import Meters from "./pages/Meters";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/clientProfile";
import Profile from "./pages/Profile";

import TopEmployees from "./pages/TopEmployees";

import AdminProducts from "./pages/AdminProducts";
import AdminInventory from "./pages/AdminInventory";
import AdminSalesHistory from "./pages/AdminSalesHistory";
import AdminMeterReadings from "./pages/AdminMeterReadings";
import AdminTankRefills from "./pages/AdminTankRefills";
import AdminExpenses from "./pages/AdminExpenses";
import AdminAlerts from "./pages/AdminAlerts";
import AdminSettings from "./pages/AdminSettings";
import AdminWaterTests from "./pages/AdminWaterTests";

/* =========================================================
   EMPLOYEE PAGES
========================================================= */

import EmployeePage from "./pages/EmployeePage";
import RecordSale from "./pages/RecordSale";
import EmployeeMySales from "./pages/EmployeeMySales";
import Books from "./pages/Books";
import Readings from "./pages/Readings";
import Deliveries from "./pages/Deliveries";
import WaterTests from "./pages/WaterTests";

/* =========================================================
   LAYOUTS
========================================================= */

import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

/* =========================================================
   THEME
========================================================= */

import { ThemeProvider } from "./context/ThemeContext";

/* =========================================================
   RESPONSIVE CSS
========================================================= */

import "./styles/responsive.css";

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  /* -------------------------------------------------------
     NO LOGIN TOKEN
  ------------------------------------------------------- */

  if (!token) {
    return <Navigate to="/" replace />;
  }

  /* -------------------------------------------------------
     WRONG USER ROLE
  ------------------------------------------------------- */

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     SOCKET CONNECTION
  ======================================================= */

  useEffect(() => {
    const handleConnect = () => {
      console.log("🔌 Connected:", socket.id);
    };

    const handleNewSale = (data) => {
      console.log("🔔 New Sale Notification:", data);
    };

    socket.on("connect", handleConnect);
    socket.on("newSale", handleNewSale);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("newSale", handleNewSale);
    };
  }, []);

  /* =======================================================
     APPLICATION
  ======================================================= */

  return (
    <ThemeProvider>
      <Router>

        {/* =================================================
            SESSION SECURITY
        ================================================= */}

        <SessionTimeout />

        {/* =================================================
            ALL APPLICATION ROUTES
        ================================================= */}

        <Routes>

          {/* =================================================
              PUBLIC ROUTES
          ================================================= */}

          <Route
            path="/"
            element={<Login />}
          />

          {/* =================================================
              ADMIN ROUTES
          ================================================= */}

          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >

            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            {/* =================================================
                EMPLOYEES
            ================================================= */}

            <Route
              path="employees"
              element={<AdminEmployees />}
            />

            {/* =================================================
                METERS
            ================================================= */}

            <Route
              path="meters"
              element={<Meters />}
            />

            {/* =================================================
                ADMIN WATER TESTS
            ================================================= */}

            <Route
              path="water-tests"
              element={<AdminWaterTests />}
            />

            {/* =================================================
                METER READINGS
            ================================================= */}

            <Route
              path="meter-readings"
              element={<AdminMeterReadings />}
            />

            {/* =================================================
                TANK REFILLS
            ================================================= */}

            <Route
              path="tank-refills"
              element={<AdminTankRefills />}
            />

            {/* =================================================
                REPORTS
            ================================================= */}

            <Route
              path="reports"
              element={<Reports />}
            />

            {/* =================================================
                CLIENTS
            ================================================= */}

            <Route
              path="clients"
              element={<Clients />}
            />

            {/* =================================================
                CLIENT PROFILE
            ================================================= */}

            <Route
              path="clients/:id"
              element={<ClientProfile />}
            />

            {/* =================================================
                TOP EMPLOYEES
            ================================================= */}

            <Route
              path="top-employees"
              element={<TopEmployees />}
            />

            {/* =================================================
                PROFILE
            ================================================= */}

            <Route
              path="profile"
              element={<Profile />}
            />

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <Route
              path="products"
              element={<AdminProducts />}
            />

            {/* =================================================
                INVENTORY
            ================================================= */}

            <Route
              path="inventory"
              element={<AdminInventory />}
            />

            {/* =================================================
                SALES HISTORY
            ================================================= */}

            <Route
              path="sales-history"
              element={<AdminSalesHistory />}
            />

            {/* =================================================
                EXPENSES
            ================================================= */}

            <Route
              path="expenses"
              element={<AdminExpenses />}
            />

            {/* =================================================
                ALERTS
            ================================================= */}

            <Route
              path="alerts"
              element={<AdminAlerts />}
            />

            {/* =================================================
                SETTINGS
            ================================================= */}

            <Route
              path="settings"
              element={<AdminSettings />}
            />

            {/* =================================================
                ADMIN DEFAULT ROUTE
            ================================================= */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

          </Route>

          {/* =================================================
              EMPLOYEE ROUTES
          ================================================= */}

          <Route
            path="/employee"
            element={
              <PrivateRoute role="employee">
                <EmployeeLayout />
              </PrivateRoute>
            }
          >

            {/* =================================================
                EMPLOYEE DASHBOARD
            ================================================= */}

            <Route
              path="dashboard"
              element={<EmployeePage />}
            />

            {/* =================================================
                RECORD SALE
            ================================================= */}

            <Route
              path="record-sale"
              element={<RecordSale />}
            />

            {/* =================================================
                MY SALES
            ================================================= */}

            <Route
              path="my-sales"
              element={<EmployeeMySales />}
            />

            {/* =================================================
                BOOKS
            ================================================= */}

            <Route
              path="books"
              element={<Books />}
            />

            {/* =================================================
                METER READINGS
            ================================================= */}

            <Route
              path="readings"
              element={<Readings />}
            />

            {/* =================================================
                DELIVERIES
            ================================================= */}

            <Route
              path="deliveries"
              element={<Deliveries />}
            />

            {/* =================================================
                EMPLOYEE WATER TESTS
            ================================================= */}

            <Route
              path="water-tests"
              element={<WaterTests />}
            />

            {/* =================================================
                TOP EMPLOYEES
            ================================================= */}

            <Route
              path="top-employees"
              element={<TopEmployees />}
            />

            {/* =================================================
                EMPLOYEE PROFILE
            ================================================= */}

            <Route
              path="profile"
              element={<Profile />}
            />

            {/* =================================================
                EMPLOYEE DEFAULT ROUTE
            ================================================= */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

          </Route>

          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </Router>
    </ThemeProvider>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default App;