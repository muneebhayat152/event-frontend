import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import EmsBrandLogo from "../components/EmsBrandLogo";
import ThemeToggleButton from "../components/ThemeToggleButton";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Registered successfully ✅");

      navigate("/events");
    } catch {
      toast.error("Registration failed ❌");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <ThemeToggleButton variant="auth" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <EmsBrandLogo size={76} showWordmark />
        </div>

        <form
          onSubmit={handleRegister}
          className="ems-card ems-surface-glow ems-fade-in relative w-full space-y-4 overflow-hidden p-8 sm:p-10"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl"></div>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="ems-input relative"
          />

          <input
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="ems-input relative"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="ems-input relative"
          />

          <input
            type="password"
            name="password_confirmation"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="ems-input relative"
          />

          <button
            type="submit"
            className="ems-btn-primary w-full !rounded-2xl !py-3.5"
          >
            Register
          </button>

          <p className="text-center text-sm ems-text-secondary">
            Already Have An Account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
