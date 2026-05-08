import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const shouldDark = saved === "dark";
    document.documentElement.classList.toggle("dark", shouldDark);
    setDarkMode(shouldDark);
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  let user = null;
  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="ems-nav-surface sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
          <h1 className="ems-title text-xl font-bold tracking-wide ems-text-primary">
            Event Management System
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
            <Link to="/events" className="ems-text-secondary transition hover:text-slate-900 dark:hover:text-white">
              Events
            </Link>
            <Link to="/my-bookings" className="ems-text-secondary transition hover:text-slate-900 dark:hover:text-white">
              Bookings
            </Link>
            {(Boolean(user?.is_admin) || user?.role === "admin" || user?.role === "super_admin") && (
              <>
                <Link to="/create-event" className="ems-text-secondary transition hover:text-slate-900 dark:hover:text-white">
                  Create Event
                </Link>
                <Link to="/admin" className="ems-text-secondary transition hover:text-slate-900 dark:hover:text-white">
                  Admin Console
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-lg border px-3 py-2 text-sm transition ems-text-primary"
            style={{ borderColor: "var(--ems-border-soft)", background: "var(--ems-card-bg)" }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {user && (
            <div className="rounded-lg border px-3 py-2 text-sm ems-text-primary" style={{ borderColor: "var(--ems-border-soft)", background: "var(--ems-card-bg)" }}>
              {user.name}
            </div>
          )}

          <button onClick={logout} className="ems-btn-primary !px-4 !py-2 !text-sm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}