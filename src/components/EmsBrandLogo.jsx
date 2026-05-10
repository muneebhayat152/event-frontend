import { useId } from "react";
import { Link } from "react-router-dom";

/**
 * Premium EMS mark: gradient tile + geometric monogram (events stack + confirmation arc).
 */
export function EmsLogoMark({ size = 56, className = "" }) {
  const rawId = useId();
  const gid = `ems-lg-${rawId.replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gid}
          x1="6"
          y1="4"
          x2="58"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1e3a8a" />
          <stop offset="0.42" stopColor="#6366f1" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="15"
        fill={`url(#${gid})`}
      />
      {/* Monogram: layered “E” + stage curve — reads as events / scheduling */}
      <path
        fill="white"
        fillOpacity="0.95"
        d="M18 22h22v3.5H18V22zm0 9h18v3.5H18V31zm0 9h13v3.5H18V40z"
      />
      <path
        fill="none"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M42 36c3 2 6 2 9 0"
      />
      <circle cx="46" cy="21" r="2.2" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

/**
 * Logo + product name. Use on auth screens and nav.
 */
export default function EmsBrandLogo({
  size = 64,
  showWordmark = true,
  subtitle,
  to,
  className = "",
}) {
  const inner = (
    <div
      className={`flex flex-col items-center gap-3 text-center ${className}`}
    >
      <EmsLogoMark size={size} className="drop-shadow-md" />
      {showWordmark && (
        <div>
          <p className="ems-title text-xl font-bold tracking-tight ems-text-primary sm:text-2xl">
            Event Management System
          </p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex flex-col items-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500">
        {inner}
      </Link>
    );
  }

  return inner;
}
