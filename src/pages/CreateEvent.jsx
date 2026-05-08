import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateEvent() {
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    event_date: "",
    event_time: "",
    total_seats: "",
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (id) {
      API.get(`/events/${id}`)
        .then((res) => {
          const data = res.data.data || res.data;

          setForm({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "",
            location: data.location || "",
            event_date: data.event_date || "",
            event_time: data.event_time || "",
            total_seats: data.total_seats || "",
          });
        })
        .catch(() => {});
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (id) {
        formData.append("_method", "PUT");

        await API.post(`/events/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setMsg("Event updated successfully ✅");
        toast.success("Event updated successfully ✅");
      } else {
        await API.post("/events", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setMsg("Event created successfully ✅");
        toast.success("Event created successfully ✅");
      }

    } catch (err) {
      console.log(err);
      setMsg("Error saving event ❌");
      toast.error("Error saving event ❌");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">

      <h2 className="mb-8 text-3xl font-bold ems-text-primary">
        {id ? "Edit Event" : "Create Event"}
      </h2>

      {msg && <p className="mb-4 text-emerald-600 dark:text-emerald-300">{msg}</p>}

      <form
        onSubmit={handleSubmit}
        className="ems-card space-y-5 p-6"
      >

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="ems-input"
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="ems-input"
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="ems-input"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="ems-input"
        />

        <input
          type="date"
          name="event_date"
          value={form.event_date}
          onChange={handleChange}
          className="ems-input"
        />

        <input
          type="time"
          name="event_time"
          value={form.event_time}
          onChange={handleChange}
          className="ems-input"
        />

        <input
          type="number"
          name="total_seats"
          placeholder="Total Seats"
          value={form.total_seats}
          onChange={handleChange}
          className="ems-input"
        />

        <button
          type="submit"
          className="ems-btn-primary w-full"
        >
          {id ? "Update Event" : "Create Event"}
        </button>

      </form>
    </div>
  );
}