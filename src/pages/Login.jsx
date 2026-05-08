import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Welcome back");
      navigate("/events");
    } catch {
      toast.error("Login failed. Please check credentials.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-5 text-center">
          <h1 className="ems-title text-3xl font-bold ems-text-primary">
            Event Management System
          </h1>
        </div>

        <div className="ems-card ems-surface-glow ems-fade-in relative overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl"></div>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              className="ems-input relative"
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="ems-input relative"
            />
          </div>

          <button onClick={handleLogin} className="ems-btn-primary mt-6 w-full !rounded-2xl !py-3.5">
            Login
          </button>

          <p className="mt-6 text-center text-sm ems-text-secondary">
            New User?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}