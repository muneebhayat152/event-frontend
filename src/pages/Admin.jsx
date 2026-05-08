import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [bookingQuery, setBookingQuery] = useState("");
  const [eventQuery, setEventQuery] = useState("");

  const token = localStorage.getItem("token");
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const hasFetched = useRef(false);

  const fetchAdminData = async (showToast = false) => {
    setLoading(true);
    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };

    const requests = await Promise.allSettled([
      API.get("/admin/users", requestConfig),
      API.get("/admin/bookings", requestConfig),
      API.get("/admin/events", requestConfig),
      API.get("/admin/audit-logs", requestConfig),
    ]);

    const [usersRes, bookingsRes, eventsRes, logsRes] = requests;
    let failedCount = 0;

    if (usersRes.status === "fulfilled") {
      setUsers(usersRes.value.data.data || []);
    } else {
      failedCount += 1;
      setUsers([]);
    }

    if (bookingsRes.status === "fulfilled") {
      setBookings(bookingsRes.value.data.data || []);
    } else {
      failedCount += 1;
      setBookings([]);
    }

    if (eventsRes.status === "fulfilled") {
      setEvents(eventsRes.value.data.data || []);
    } else {
      failedCount += 1;
      setEvents([]);
    }

    if (logsRes.status === "fulfilled") {
      setLogs(logsRes.value.data.data || []);
    } else {
      failedCount += 1;
      setLogs([]);
    }

    if (showToast && failedCount > 0) {
      toast.error(
        failedCount === 4
          ? "Failed To Load Admin Data"
          : "Some Admin Data Could Not Be Loaded"
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAdminData(false);
  }, []);

  const chartData = bookings.map((b) => ({
    name: b.event?.title?.slice(0, 12),
    seats: b.seats_booked,
  }));

  const totalSeats = bookings.reduce((sum, b) => sum + b.seats_booked, 0);
  const activeEvents = events.filter((e) => e.status === "approved").length;
  const totalCapacity = events.reduce((sum, e) => sum + Number(e.total_seats || 0), 0);

  const deleteUser = async (id) => {
    try {
      await API.delete(`/admin/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const toggleAdminRole = async (user) => {
    const endpoint = user.is_admin
      ? `/admin/user/${user.id}/demote`
      : `/admin/user/${user.id}/promote`;

    try {
      const res = await API.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...res.data.data } : u))
      );
      toast.success(user.is_admin ? "User demoted" : "User promoted to admin");
      fetchAdminData(false);
    } catch {
      toast.error("Failed to update user role");
    }
  };

  const makeSuperAdmin = async (userId) => {
    try {
      await API.patch(
        `/admin/user/${userId}/make-super-admin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      toast.success("User promoted to super admin");
      fetchAdminData(false);
    } catch {
      toast.error("Failed to promote super admin");
    }
  };

  const deleteBooking = async (id) => {
    try {
      await API.delete(`/admin/booking/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Booking deleted");
    } catch (err) {
      toast.error("Failed to delete booking");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await API.delete(`/admin/event/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const updateEventStatus = async (id, status) => {
    const endpoint =
      status === "approved"
        ? `/admin/event/${id}/approve`
        : `/admin/event/${id}/reject`;

    try {
      const res = await API.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...res.data.data } : e))
      );
      toast.success(`Event ${status}`);
      fetchAdminData(false);
    } catch {
      toast.error("Failed to update event status");
    }
  };

  const updateBookingStatus = async (id, status) => {
    const endpoint =
      status === "approved"
        ? `/admin/booking/${id}/approve`
        : `/admin/booking/${id}/reject`;

    try {
      await API.patch(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      toast.success(
        status === "approved"
          ? "Booking Approved/Forwarded Successfully"
          : "Booking Rejected"
      );
      fetchAdminData(false);
    } catch {
      toast.error("Failed to update booking status");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(q)
    );
  }, [users, userQuery]);

  const filteredBookings = useMemo(() => {
    const q = bookingQuery.toLowerCase().trim();
    if (!q) return bookings;
    return bookings.filter((b) =>
      `${b.event?.title} ${b.user?.name}`.toLowerCase().includes(q)
    );
  }, [bookings, bookingQuery]);

  const filteredEvents = useMemo(() => {
    const q = eventQuery.toLowerCase().trim();
    if (!q) return events;
    return events.filter((e) =>
      `${e.title} ${e.category} ${e.location}`.toLowerCase().includes(q)
    );
  }, [events, eventQuery]);

  const resolvedCurrentUser = useMemo(() => {
    if (!currentUser) return null;
    return (
      users.find((u) => u.id === currentUser.id) ||
      users.find(
        (u) =>
          String(u.email || "").toLowerCase() ===
          String(currentUser.email || "").toLowerCase()
      ) ||
      currentUser
    );
  }, [users, currentUser]);

  const isSuperAdmin = resolvedCurrentUser?.role === "super_admin";
  const canBootstrapSelfSuperAdmin =
    !isSuperAdmin &&
    (resolvedCurrentUser?.role === "admin" || resolvedCurrentUser?.is_admin);

  const statusBadgeClass = (status) => {
    if (status === "approved") return "bg-emerald-100 text-emerald-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const normalizeDescriptionEmails = (description = "") =>
    description.replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      (email) => email.toLowerCase()
    );

  return (
    <div className="mx-auto max-w-6xl ems-fade-in">
      <div className="ems-card ems-surface-glow mb-8 p-6">
        <h2 className="ems-title mb-2 text-3xl font-bold ems-text-primary">
          Executive Admin Console
        </h2>
        <p className="text-sm ems-text-secondary">
          Full project control center: users, events, bookings, and analytics.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => fetchAdminData(true)} className="ems-btn-secondary !px-4 !py-2 !text-sm">
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
          <Link to="/create-event" className="ems-btn-primary !px-4 !py-2 !text-sm">
            Create New Event
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-xl shadow-lg hover:scale-105 transition">
          <p className="text-sm opacity-80">Total Users</p>
          <h3 className="text-3xl font-bold mt-1">{users.length}</h3>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-lg hover:scale-105 transition">
          <p className="text-sm opacity-80">Total Bookings</p>
          <h3 className="text-3xl font-bold mt-1">{bookings.length}</h3>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-5 rounded-xl shadow-lg hover:scale-105 transition">
          <p className="text-sm opacity-80">Total Seats Booked</p>
          <h3 className="text-3xl font-bold mt-1">
            {totalSeats}
          </h3>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-5 rounded-xl shadow-lg hover:scale-105 transition">
          <p className="text-sm opacity-80">Active Events</p>
          <h3 className="text-3xl font-bold mt-1">
            {activeEvents}
          </h3>
        </div>

        <div className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white p-5 rounded-xl shadow-lg hover:scale-105 transition">
          <p className="text-sm opacity-80">Total Event Capacity</p>
          <h3 className="text-3xl font-bold mt-1">
            {totalCapacity}
          </h3>
        </div>

      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {["overview", "users", "bookings", "events", "audit"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {(activeTab === "overview" || activeTab === "bookings") && (
      <div className="ems-card ems-surface-glow mb-10 p-6">
        <h3 className="ems-title mb-4 text-lg font-semibold ems-text-primary">
          Event Popularity (Seats Booked)
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.3)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="seats" radius={[8, 8, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}

      {(activeTab === "overview" || activeTab === "users") && (
      <div className="mb-10">
        <h3 className="ems-title mb-4 text-xl font-semibold ems-text-primary">
          All Users
        </h3>
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="ems-input mb-4"
        />

        <div className="ems-card ems-surface-glow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-500/10 text-sm text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t transition hover:bg-slate-500/10" style={{ borderColor: "var(--ems-border-soft)" }}>
                  <td className="p-3 font-medium ems-text-primary">{u.name}</td>
                  <td
                    className="p-3 text-slate-700 dark:text-slate-300 lowercase normal-case"
                    style={{ textTransform: "lowercase" }}
                  >
                    {u.email || ""}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {u.role || (u.is_admin ? "admin" : "user")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => toggleAdminRole(u)}
                            className={`rounded-lg px-3 py-1 text-sm text-white ${
                              u.is_admin ? "bg-slate-600 hover:bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {u.is_admin ? "Demote" : "Promote"}
                          </button>
                          <button
                            onClick={() => makeSuperAdmin(u.id)}
                            className="rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                          >
                            Super
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="rounded-lg bg-red-500/90 px-3 py-1 text-sm text-white hover:bg-red-500"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {!isSuperAdmin && (
                        <>
                          {canBootstrapSelfSuperAdmin && resolvedCurrentUser?.id === u.id ? (
                            <button
                              onClick={() => makeSuperAdmin(u.id)}
                              className="rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                            >
                              Activate Super Admin
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Super Admin Only
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {(activeTab === "overview" || activeTab === "bookings") && (
      <div className="mb-10">
        <h3 className="ems-title mb-4 text-xl font-semibold ems-text-primary">
          All Bookings
        </h3>
        <input
          type="text"
          value={bookingQuery}
          onChange={(e) => setBookingQuery(e.target.value)}
          placeholder="Search bookings by event or user..."
          className="ems-input mb-4"
        />

        <div className="ems-card ems-surface-glow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-500/10 text-sm text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">User</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="border-t transition hover:bg-slate-500/10" style={{ borderColor: "var(--ems-border-soft)" }}>
                  <td className="p-3 font-medium text-blue-700 dark:text-blue-300">
                    {b.event?.title}
                  </td>
                  <td className="p-3 text-slate-800 dark:text-slate-100">{b.user?.name}</td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    {b.seats_booked}
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(b.status)}`}>
                      {b.status || "pending_admin"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(b.id, "approved")}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b.id, "rejected")}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700"
                      >
                        Reject
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="rounded-lg bg-red-500/90 px-3 py-1 text-sm text-white hover:bg-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {(activeTab === "overview" || activeTab === "events") && (
      <div>
        <h3 className="ems-title mb-4 text-xl font-semibold ems-text-primary">
          Event Management
        </h3>
        <input
          type="text"
          value={eventQuery}
          onChange={(e) => setEventQuery(e.target.value)}
          placeholder="Search events by title, category, or location..."
          className="ems-input mb-4"
        />

        <div className="ems-card ems-surface-glow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-500/10 text-sm ems-text-secondary">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Seats</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e) => (
                <tr key={e.id} className="border-t transition hover:bg-slate-500/10" style={{ borderColor: "var(--ems-border-soft)" }}>
                  <td className="p-3 font-medium ems-text-primary">{e.title}</td>
                  <td className="p-3 ems-text-secondary">{e.category}</td>
                  <td className="p-3 ems-text-secondary">{e.location}</td>
                  <td className="p-3 ems-text-secondary">{e.total_seats}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(e.status)}`}>
                      {e.status || "pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateEventStatus(e.id, "approved")}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateEventStatus(e.id, "rejected")}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700"
                      >
                        Reject
                      </button>
                      <Link
                        to={`/edit/${e.id}`}
                        className="rounded-lg bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteEvent(e.id)}
                        className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                        disabled={!isSuperAdmin}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {(activeTab === "overview" || activeTab === "audit") && (
      <div className="mt-10">
        <h3 className="ems-title mb-4 text-xl font-semibold ems-text-primary">
          Audit Logs
        </h3>
        <div className="ems-card ems-surface-glow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-500/10 text-sm ems-text-secondary">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Admin</th>
                <th className="p-3">Action</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t transition hover:bg-slate-500/10" style={{ borderColor: "var(--ems-border-soft)" }}>
                  <td className="p-3 ems-text-secondary">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3 ems-text-primary">{log.admin?.name || "Admin"}</td>
                  <td className="p-3 ems-text-secondary">{log.action}</td>
                  <td
                    className="p-3 ems-text-secondary normal-case"
                    style={{ textTransform: "none" }}
                  >
                    {normalizeDescriptionEmails(log.description)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

    </div>
  );
}