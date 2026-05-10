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
    <div
      className="relative flex min-h-dvh w-full items-center px-4 py-6 sm:px-5 sm:py-8"
      style={{ justifyContent: "safe center" }}
    >
      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <ThemeToggleButton variant="auth" />
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-5 flex justify-center sm:mb-6">
          <EmsBrandLogo size={72} showWordmark subtitle="Create your account" />
        </div>

        <form
          onSubmit={handleRegister}
          className="ems-card ems-surface-glow ems-fade-in relative overflow-hidden p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl"></div>

          <div className="relative space-y-3 sm:space-y-4">
            {/* Row 1 — full width (same pattern as reference: single field on top) */}
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              autoComplete="name"
              className="ems-input relative w-full"
            />

            {/* Row 2 — two columns: email | password */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                autoComplete="email"
                className="ems-input relative min-w-0"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                autoComplete="new-password"
                className="ems-input relative min-w-0"
              />
            </div>

            {/* Row 3 — confirm password */}
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              onChange={handleChange}
              autoComplete="new-password"
              className="ems-input relative w-full"
            />
          </div>

          <div className="relative mt-5 space-y-3 sm:mt-6">
            <button
              type="submit"
              className="ems-btn-primary w-full !rounded-2xl !py-3.5 text-[0.95rem] font-semibold"
            >
              Create account
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="ems-btn-secondary w-full !rounded-2xl !py-3.5 text-[0.95rem] font-semibold"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
