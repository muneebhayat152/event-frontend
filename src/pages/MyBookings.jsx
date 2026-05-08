import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const normalizeStatus = (status) => {
    const value = String(status || "pending_admin").toLowerCase();
    if (value === "pending_super_admin") {
      return "Pending Super Admin Approval";
    }
    if (value === "approved") {
      return "Approved";
    }
    if (value === "rejected") {
      return "Rejected";
    }
    return "Pending Admin Approval";
  };

  const statusBadgeClass = (status) => {
    const value = String(status || "pending_admin").toLowerCase();
    if (value === "approved") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
    }
    if (value === "rejected") {
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200";
    }
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200";
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await API.delete(`/booking/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setBookings(bookings.filter((b) => b.id !== id));

      toast.success("Booking cancelled ✅");
      window.dispatchEvent(new Event("ems-bookings-changed"));

    } catch (err) {
      console.log("Cancel error:", err);
      toast.error("Cancel failed ❌");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    API.get("/my-bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        setBookings(res.data.data || []);
      })
      .catch((err) => {
        console.log("Booking error:", err);
        setBookings([]);
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-8 text-3xl font-bold tracking-tight ems-text-primary">
        My Bookings
      </h2>

      {bookings.length === 0 && (
        <p className="mt-10 text-center text-slate-600 dark:text-slate-400">
          No bookings found
        </p>
      )}

      <div className="grid gap-8">
        {bookings.map((b) => (
          <div key={b.id} className="ems-card p-6">
            <h3 className="mb-2 text-xl font-semibold text-blue-700 dark:text-blue-300">
              {b.event?.title}
            </h3>

            <p className="text-sm ems-text-secondary">
              📍 {b.event?.location}
            </p>

            <div className="flex justify-between items-center mt-5">
              <div className="flex flex-col">
                <span className="text-sm ems-text-secondary">Seats Booked</span>
                <span className="text-xs ems-text-secondary mt-2">
                  Status:
                  {" "}
                  <span className={`rounded-full px-2 py-1 font-semibold ${statusBadgeClass(b.status)}`}>
                    {normalizeStatus(b.status)}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                  {b.seats_booked}
                </span>

                <button
                  onClick={() => handleCancel(b.id)}
                  className="rounded-xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 dark:border-red-300/30 dark:bg-red-500/20 dark:text-red-100 dark:hover:bg-red-500/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}