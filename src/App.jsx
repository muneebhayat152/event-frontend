import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Events from "./pages/Events";
import Navbar from "./components/Navbar";
import BookingProgressBanner from "./components/BookingProgressBanner";

import Register from "./pages/Register";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyBookings = lazy(() => import("./pages/MyBookings"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const Admin = lazy(() => import("./pages/Admin"));
const EventDetails = lazy(() => import("./pages/EventDetails"));

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
        <BookingProgressBanner />
        {children}
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="ems-card p-6 text-center text-sm ems-text-secondary">
      Loading page...
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
                <Suspense fallback={<PageLoader />}>
                  <EventDetails />
                </Suspense>
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
                  <Suspense fallback={<PageLoader />}>
                    <CreateEvent />
                  </Suspense>
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
                <Suspense fallback={<PageLoader />}>
                  <MyBookings />
                </Suspense>
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
                  <Suspense fallback={<PageLoader />}>
                    <CreateEvent />
                  </Suspense>
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
                  <Suspense fallback={<PageLoader />}>
                    <Admin />
                  </Suspense>
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