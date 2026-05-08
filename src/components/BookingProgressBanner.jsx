import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function plainMessage(status) {
  const s = String(status || "pending_admin").toLowerCase();
  if (s === "approved") {
    return {
      title: "Confirmed",
      detail:
        "Your seats are booked. The event page shows the latest number of seats left for everyone.",
      tone: "ok",
    };
  }
  if (s === "rejected") {
    return {
      title: "Not approved",
      detail:
        "This request was not accepted. If seats had already been counted for you, they are returned to the event.",
      tone: "bad",
    };
  }
  if (s === "pending_super_admin") {
    return {
      title: "Waiting for final check",
      detail:
        "Your request is with a senior approver. You do not need to do anything. Please check back later.",
      tone: "wait",
    };
  }
  return {
    title: "Waiting for admin",
    detail:
      "We received your request. An admin will review it. Seats are not taken from the event until your request is approved.",
    tone: "wait",
  };
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
      .then((res) => {
        setBookings(res.data.data || []);
      })
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
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-sm ems-text-secondary dark:border-slate-700 dark:bg-slate-900/40">
        Loading your booking updates…
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="mb-6 rounded-2xl border border-blue-200/60 bg-blue-50/90 px-4 py-4 dark:border-blue-500/25 dark:bg-blue-950/30">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Your booking requests
        </p>
        <p className="mt-1 text-sm text-blue-800/90 dark:text-blue-200/90">
          You have no booking requests yet. Pick an event below and tap{" "}
          <span className="font-semibold">Book</span>. After you send a request,
          its status will show here so you always know what is happening.
        </p>
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
    .slice(0, 5);

  return (
    <div className="mb-6 space-y-3">
      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/90 px-4 py-3 dark:border-emerald-500/25 dark:bg-emerald-950/25">
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          Your booking requests — simple status
        </p>
        <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/85">
          Read the colored box for each event. You do not need to open extra
          pages to see if you are still waiting or already confirmed.
        </p>
      </div>

      {recent.map((b) => {
        const { title, detail, tone } = plainMessage(b.status);
        const border =
          tone === "ok"
            ? "border-emerald-300/60 bg-emerald-50/95 dark:border-emerald-500/30 dark:bg-emerald-950/35"
            : tone === "bad"
              ? "border-rose-300/60 bg-rose-50/95 dark:border-rose-500/30 dark:bg-rose-950/35"
              : "border-amber-300/60 bg-amber-50/95 dark:border-amber-500/30 dark:bg-amber-950/35";

        return (
          <div
            key={b.id}
            className={`rounded-2xl border px-4 py-3 ${border}`}
          >
            <p className="text-sm font-semibold ems-text-primary">
              {b.event?.title || "Event"}
            </p>
            <p className="mt-0.5 text-xs ems-text-secondary">
              Seats you asked for:{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {b.seats_booked}
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold ems-text-primary">
              {title}
            </p>
            <p className="mt-1 text-xs leading-relaxed ems-text-secondary">
              {detail}
            </p>
          </div>
        );
      })}

      {bookings.length > 5 && (
        <p className="text-center text-xs ems-text-secondary">
          Showing your 5 most recent requests.{" "}
          <Link
            to="/my-bookings"
            className="font-semibold text-blue-600 underline dark:text-blue-300"
          >
            See all bookings
          </Link>
        </p>
      )}

      {bookings.length <= 5 && bookings.length > 0 && (
        <p className="text-center text-xs ems-text-secondary">
          <Link
            to="/my-bookings"
            className="font-semibold text-blue-600 underline dark:text-blue-300"
          >
            Open full list of bookings
          </Link>
        </p>
      )}
    </div>
  );
}
