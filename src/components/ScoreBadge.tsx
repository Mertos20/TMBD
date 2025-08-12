import React from "react";

interface ScoreBadgeProps {
  value: number | null;
  size?: number; // optional, default: 44
}

export default function ScoreBadge({ value, size = 44 }: ScoreBadgeProps) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const pct = value ?? 0;
  const dash = (pct / 100) * circumference;
  const color = pct >= 70 ? "#21d07a" : pct >= 40 ? "#d2d531" : "#db2360";

  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-[#081c22] text-white"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute left-0 top-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#204529"
          strokeWidth={stroke}
          fill="transparent"
        />
        {value !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>

      <span
        className="font-bold leading-none"
        style={{ fontSize: size * 0.3 }}
      >
        {value !== null ? (
          <>
            {pct}
            <sup style={{ fontSize: size * 0.2 }}>%</sup>
          </>
        ) : (
          "NR"
        )}
      </span>
    </div>
  );
}
