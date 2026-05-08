import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function shortLabel(status) {
  const s = String(status || "pending_admin").toLowerCase();
  if (s === "approved") return { text: "Confirmed", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" };
  if (s === "rejected") return { text: "Declined", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" };
  if (s === "pending_super_admin") return { text: "Pending", cls: "bg-amber-500/15 text-amber-800 dark:text-amber-200" };
  return { text: "Pending", cls: "bg-amber-500/15 text-amber-800 dark:text-amber-200" };
}

export default function BookingProgressBanner() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStaff = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined") return false;
      const u = JSON.parse(raw);
      return (
        Boolean(u?.is_admin) ||
        u?.role === "admin" ||
        u?.role === "super_admin"
      );
    } catch {
      return false;
    }
  };

  const load = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || isStaff()) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    API.get("/my-bookings", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("ems-bookings-changed", onChanged);
    return () => window.removeEventListener("ems-bookings-changed", onChanged);
  }, [load]);

  if (isStaff()) return null;

  if (loading) {
    return (
      <div className="ems-card mb-6 px-4 py-3 text-sm ems-text-secondary">
        Loading…
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="ems-card mb-6 px-4 py-3 text-sm ems-text-secondary">
        <span className="ems-text-primary font-medium">My bookings:</span> none yet.{" "}
        <span className="hidden sm:inline">Pick an event and tap Book.</span>
      </div>
    );
  }

  const recent = [...bookings]
    .sort((a, b) => {
      const tb = new Date(b.updated_at || b.created_at || 0).getTime();
      const ta = new Date(a.updated_at || a.created_at || 0).getTime();
      if (tb !== ta) return tb - ta;
      return (b.id || 0) - (a.id || 0);
    })
    .slice(0, 4);

  return (
    <div className="ems-card mb-6 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--ems-border-soft)" }}>
        <span className="text-sm font-semibold ems-text-primary">My bookings</span>
        <Link
          to="/my-bookings"
          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y" style={{ borderColor: "var(--ems-border-soft)" }}>
        {recent.map((b) => {
          const { text, cls } = shortLabel(b.status);
          const title = b.event?.title || "Event";
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm sm:flex-nowrap sm:justify-between"
            >
              <span className="min-w-0 flex-1 truncate font-medium ems-text-primary" title={title}>
                {title}
              </span>
              <span className="shrink-0 tabular-nums ems-text-secondary">
                {b.seats_booked} seat{b.seats_booked !== 1 ? "s" : ""}
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
                {text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
