import React, { useEffect, useState } from "react";

export default function SautiCheckLogoAnimated({ className = "" }: { className?: string }) {
  const [showTick, setShowTick] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTick((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="80" height="80" rx="20" fill="#2563EB" />
      <g filter="url(#shadow)">
        <circle cx="40" cy="40" r="28" fill="#fff" />
        {/* Speaker body */}
        <rect x="28" y="32" width="12" height="16" rx="3" fill="#2563EB" />
        {/* Speaker cone */}
        <polygon points="40,40 52,32 52,48" fill="#2563EB" />
        {/* Sound waves */}
        <path d="M56 36c2 2 2 6 0 8" stroke="#2563EB" strokeWidth="2" fill="none" />
        <path d="M60 34c3 3 3 10 0 13" stroke="#2563EB" strokeWidth="2" fill="none" />
        {/* Animated Check mark */}
        {showTick && (
          <polyline
            points="33,48 37,54 47,42"
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
      <text
        x="40"
        y="75"
        textAnchor="middle"
        fill="#2563EB"
        fontSize="13"
        fontFamily="Arial"
        fontWeight="bold"
      >
        SautiCheck
      </text>
      <defs>
        <filter id="shadow" x="8" y="8" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>
    </svg>
  );
}
