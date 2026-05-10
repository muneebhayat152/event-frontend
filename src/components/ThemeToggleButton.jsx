import { useTheme } from "../context/ThemeContext";

export default function ThemeToggleButton({
  variant = "auth",
  className = "",
}) {
  const { darkMode, toggleTheme } = useTheme();

  const base =
    variant === "auth"
      ? "rounded-xl border px-3 py-2 text-sm font-medium shadow-sm transition hover:opacity-90 ems-text-primary"
      : "rounded-lg border px-3 py-2 text-sm transition ems-text-primary";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${base} ${className}`}
      style={{
        borderColor: "var(--ems-border-soft)",
        background: "var(--ems-card-bg)",
      }}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? "Light mode" : "Dark mode"}
    </button>
  );
}
