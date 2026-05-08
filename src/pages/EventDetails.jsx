import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError("");

    API.get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.data || res.data);
      })
      .catch(() => {
        setError("Unable to load event details.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <p className="p-6 ems-text-secondary">Loading event...</p>;

  if (error) return <p className="p-6 text-red-600 dark:text-red-300">{error}</p>;

  if (!event) return <p className="p-6 ems-text-secondary">Event not found.</p>;

  return (
    <div className="ems-card p-7">
      <h1 className="mb-2 text-3xl font-bold ems-text-primary">{event.title}</h1>
      <p className="mb-6 ems-text-secondary">{event.description}</p>

      <div className="grid gap-3 text-sm ems-text-secondary sm:grid-cols-2">
        <p>📍 Location: {event.location}</p>
        <p>📅 Date: {event.event_date}</p>
        <p>🕓 Time: {event.event_time || "Not specified"}</p>
        <p>🎟 Seats: {event.total_seats}</p>
      </div>
    </div>
  );
}