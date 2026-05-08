import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Events from "./pages/Events";
import MyBookings from "./pages/MyBookings";
import CreateEvent from "./pages/CreateEvent";
import Admin from "./pages/Admin";
import EventDetails from "./pages/EventDetails";
import Navbar from "./components/Navbar";

import Register from "./pages/Register";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

// ✅ NEW: ADMIN PROTECTION
function AdminRoute({ children }) {
  let user = null;
  const rawUser = localStorage.getItem("user");
  if (rawUser && rawUser !== "undefined") {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  const isAdminOrSuperAdmin =
    Boolean(user?.is_admin) ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  if (!isAdminOrSuperAdmin) {
  return <Navigate to="/events" />;
}

  return children;
}

function Layout({ children }) {
  return (
    <div className="ems-shell">
      <Navbar />

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="ems-card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="ems-title text-lg font-semibold tracking-wide ems-text-primary sm:text-xl">
            Enterprise Event Management Workspace
          </h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-200">
              Management Dashboard
            </span>
            <p className="text-sm ems-text-secondary">
              Plan events, control bookings, and manage users from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <ToastContainer />

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EventDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <CreateEvent />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <MyBookings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <CreateEvent />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        {/* ✅ FIXED ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Layout>
                  <Admin />
                </Layout>
              </AdminRoute>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;