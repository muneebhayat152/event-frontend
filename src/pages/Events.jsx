// ONLY minimal dark mode additions — nothing removed

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    API.get("/events")
      .then((res) => {
        setEvents(res.data.data.data || []);
      })
      .catch(() => {
        setEvents([]);
        setMsg("Error fetching events");
      });
  }, []);

  const handleSearch = () => {
    API.get(`/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        setEvents(res.data.data || []);
        setMsg("");
      })
      .catch(() => {
        toast.error("Search failed ❌");
      });
  };

  const loadUpcoming = () => {
    API.get("/upcoming")
      .then((res) => {
        setEvents(res.data.data || []);
        setMsg("");
      })
      .catch(() => {
        toast.error("Error loading upcoming events ❌");
      });
  };

  const handleBooking = async (eventId, seatsCount) => {
    try {
      setLoadingId(eventId);

      const token = localStorage.getItem("token");

      await API.post(
        "/book",
        { event_id: eventId, seats: seatsCount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      toast.success("Booking request submitted. Waiting for admin approval ✅");
      window.dispatchEvent(new Event("ems-bookings-changed"));

    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed ❌");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted ✅");
    } catch {
      toast.error("Delete failed ❌");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="ems-card ems-surface-glow ems-fade-in mb-8 p-6">
        <h2 className="ems-title text-3xl font-bold tracking-tight ems-text-primary">
          Event Marketplace
        </h2>
        <p className="mt-2 text-sm ems-text-secondary">
          Discover high-quality events, manage bookings, and track availability.
        </p>
      </div>

      {msg && <p className="mb-4 text-emerald-600 dark:text-emerald-300">{msg}</p>}

      <div className="ems-card mb-8 flex flex-col gap-3 p-5 sm:flex-row">
        <input
          type="text"
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ems-input"
        />
        <button
          onClick={handleSearch}
          className="ems-btn-primary"
        >
          Search
        </button>
        <button onClick={loadUpcoming} className="ems-btn-secondary">
          Upcoming
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="ems-card ems-surface-glow ems-fade-in p-6 hover:border-blue-300/40">
              <h3 className="ems-title mb-3 text-xl font-semibold ems-text-primary">
                {event.title}
              </h3>

              <p className="mb-1 text-sm ems-text-secondary">
                📍 {event.location}
              </p>

              {event.event_date && (
                <p className="mb-2 text-sm ems-text-secondary">
                  📅 {event.event_date}
                </p>
              )}

              <p className="mb-5 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                Seats Available: {event.available_seats ?? event.total_seats}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setSeats(1);
                  }}
                  disabled={loadingId === event.id}
                  className="ems-btn-primary !px-4 !py-2 !text-sm"
                >
                  {loadingId === event.id ? "Booking..." : "Book"}
                </button>

                {(Boolean(user?.is_admin) || user?.role === "admin" || user?.role === "super_admin") && (
                  <>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 dark:border-red-300/30 dark:bg-red-500/20 dark:text-red-100 dark:hover:bg-red-500/30"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => navigate(`/edit/${event.id}`)}
                      className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-200 dark:border-amber-300/30 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/30"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>

              <Link
                to={`/events/${event.id}`}
                className="mt-5 inline-block text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                View Details →
              </Link>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="ems-card w-96 p-6">

            <h3 className="mb-3 text-lg font-semibold ems-text-primary">
              {selectedEvent.title}
            </h3>

            <p className="mb-4 ems-text-secondary">
              Available Seats: {selectedEvent.available_seats ?? selectedEvent.total_seats}
            </p>

            <input
              type="number"
              min="1"
              max={Number(selectedEvent.available_seats ?? selectedEvent.total_seats ?? 9999)}
              value={seats}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setSeats("");
                  return;
                }

                const numberValue = Number(value);

                if (numberValue < 1) {
                  setSeats(1);
                } else {
                  setSeats(numberValue);
                }
              }}
              className="ems-input mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="ems-btn-secondary !px-4 !py-2 !text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (seats < 1 || seats === "") {
                    toast.error("Invalid seat selection ❌");
                    return;
                  }

                  handleBooking(selectedEvent.id, seats);
                  setSelectedEvent(null);
                }}
                className="ems-btn-primary !px-5 !py-2 !text-sm"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

      {events.length === 0 && !msg && (
        <p className="mt-6 text-slate-600 dark:text-slate-400">
          No events found
        </p>
      )}
    </div>
  );
}