import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import socket from "./socket";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeePage from "./pages/EmployeePage";
import AdminEmployees from "./pages/AdminEmployees";
import Meters from "./pages/Meters";
import RecordSale from "./pages/RecordSale";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/clientProfile";
import AdminLayout from "./layouts/AdminLayout";
import Profile from "./pages/Profile";
import EmployeeLayout from "./layouts/EmployeeLayout";
import TopEmployees from "./pages/TopEmployees";
import AdminProducts from "./pages/AdminProducts";
import AdminInventory from "./pages/AdminInventory";
import AdminSalesHistory from "./pages/AdminSalesHistory";
import AdminMeterReadings from "./pages/AdminMeterReadings";
import AdminTankRefills from "./pages/AdminTankRefills";
import AdminExpenses from "./pages/AdminExpenses";
import AdminAlerts from "./pages/AdminAlerts";
import AdminSettings from "./pages/AdminSettings";
import EmployeeMySales from "./pages/EmployeeMySales";
import Books from "./pages/Books";
import Readings from "./pages/Readings";
import Deliveries from "./pages/Deliveries";

import { ThemeProvider } from "./context/ThemeContext";

import "./styles/responsive.css";

/* 🔐 Protected Route */

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return children;
}

function App() {

  /* 🔔 SOCKET CONNECTION */

  useEffect(() => {

    socket.on("connect", () => {
      console.log("🔌 Connected:", socket.id);
    });

    socket.on("newSale", (data) => {
      console.log("🔔 New Sale Notification:", data);
    });

    return () => {
      socket.off("newSale");
    };

  }, []);

  return (

    <ThemeProvider>

      <Router>

        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Login />} />

          {/* ================= ADMIN ROUTES ================= */}

          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >

            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="meters" element={<Meters />} />
            <Route path="meter-readings" element={<AdminMeterReadings />} />
            <Route path="tank-refills" element={<AdminTankRefills />} />
            <Route path="reports" element={<Reports />} />
            <Route path="clients" element={<Clients />} />
            <Route path="top-employees" element={<TopEmployees />} />.
            <Route path="clients/:id" element={<ClientProfile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="sales-history" element={<AdminSalesHistory />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="alerts" element={<AdminAlerts />} />
            <Route path="settings" element={<AdminSettings />} />
            

            <Route index element={<Navigate to="dashboard" replace />} />

          </Route>

          {/* ================= EMPLOYEE ROUTES ================= */}

          <Route
            path="/employee"
            element={
              <PrivateRoute role="employee">
                <EmployeeLayout />
              </PrivateRoute>
            }
          >

            <Route path="dashboard" element={<EmployeePage />} />
            <Route path="record-sale" element={<RecordSale />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-sales" element={<EmployeeMySales />} />

            {/* ✅ NEW ROUTES */}
            <Route path="books" element={<Books />} />
            <Route path="readings" element={<Readings />} />
            <Route path="deliveries" element={<Deliveries />} />

            {/* ✅ EXISTING */}
            <Route path="top-employees" element={<TopEmployees />} />

            <Route index element={<Navigate to="dashboard" replace />} />

          </Route>

        </Routes>

      </Router>

    </ThemeProvider>

  );

}

export default App;