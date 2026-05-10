import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import { EmsLogoMark } from "../components/EmsBrandLogo";
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
    <div className="relative flex min-h-dvh w-full flex-col bg-transparent">
      <div className="pointer-events-none fixed right-3 top-3 z-20 sm:right-5 sm:top-5">
        <div className="pointer-events-auto">
          <ThemeToggleButton variant="auth" />
        </div>
      </div>

      {/* safe center: stay vertically centered when it fits; align to start when it would overflow (avoids top/bottom clipping) */}
      <div
        className="flex w-full flex-1 flex-col items-center px-3 py-2 sm:px-4 sm:py-3"
        style={{ minHeight: "100dvh", justifyContent: "safe center" }}
      >
        <div className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleRegister}
            className="ems-card ems-surface-glow ems-fade-in relative w-full space-y-2 overflow-hidden px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-4"
          >
            {/* Row layout = less vertical space than stacked logo + title */}
            <div
              className="flex items-center gap-3 border-b pb-3 sm:gap-3.5 sm:pb-3"
              style={{ borderColor: "var(--ems-border-soft)" }}
            >
              <EmsLogoMark size={40} className="shrink-0 drop-shadow-md" />
              <div className="min-w-0 flex-1 text-left">
                <h1 className="ems-title text-[0.95rem] font-bold leading-snug tracking-tight ems-text-primary sm:text-base">
                  Event Management System
                </h1>
                <p className="mt-0.5 text-[11px] leading-tight ems-text-secondary sm:text-xs">
                  Create your account
                </p>
              </div>
            </div>

            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              autoComplete="name"
              className="ems-input relative !py-2 text-sm sm:!py-2"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              autoComplete="email"
              className="ems-input relative !py-2 text-sm sm:!py-2"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              autoComplete="new-password"
              className="ems-input relative !py-2 text-sm sm:!py-2"
            />

            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              onChange={handleChange}
              autoComplete="new-password"
              className="ems-input relative !py-2 text-sm sm:!py-2"
            />

            <button
              type="submit"
              className="ems-btn-primary w-full !rounded-xl !py-2.5 text-sm font-semibold sm:!py-2.5"
            >
              Register
            </button>

            <p className="pt-0.5 text-center text-[11px] leading-tight ems-text-secondary sm:text-xs">
              Already have an account?{" "}
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
    </div>
  );
}
