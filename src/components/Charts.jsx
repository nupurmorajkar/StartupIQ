import { useState } from "react";
import { money } from "../utils/format.js";

export function SparkArea({ series, width = 300, height = 64 }) {
  const [activePoint, setActivePoint] = useState(null);

  if (!series || !series.length) return null;
  const max = Math.max(...series.map((s) => s.value), 1);
  const stepX = width / (series.length - 1 || 1);

  const points = series.map((s, i) => {
    const x = i * stepX;
    const y = height - (s.value / max) * (height - 12) - 6;
    return { x, y, ...s };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-label="Revenue sparkline"
      >
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGradient)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={activePoint === i ? 5 : 2.5}
            fill="#FFFFFF"
            style={{ cursor: "pointer", transition: "r 0.15s ease" }}
            onMouseEnter={() => setActivePoint(i)}
            onMouseLeave={() => setActivePoint(null)}
          />
        ))}
      </svg>
      {activePoint !== null && points[activePoint] && (
        <div
          style={{
            position: "absolute",
            top: 4,
            left: Math.min(Math.max(10, points[activePoint].x - 30), width - 70),
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: "0.75rem",
            fontWeight: 600,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {money(points[activePoint].value)}
        </div>
      )}
    </div>
  );
}

export function BarChart({ series, height = 130 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!series || !series.length) return null;
  const max = Math.max(...series.map((s) => s.value), 1);
  const width = Math.max(series.length * 36, 240);
  const gap = 8;
  const barW = Math.max(14, width / series.length - gap);

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block" }}
        aria-label="Interactive sales bar chart"
      >
        {series.map((s, i) => {
          const h = Math.max((s.value / max) * (height - 20), s.value > 0 ? 6 : 2);
          const x = i * (barW + gap) + gap / 2;
          const y = height - h;
          const isHovered = hoveredIdx === i;
          const isLast = i === series.length - 1;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={5}
                fill={
                  isHovered
                    ? "var(--brand-dark)"
                    : isLast
                    ? "var(--brand)"
                    : "var(--brand-tint-strong)"
                }
                style={{ transition: "fill 0.15s ease, y 0.2s ease, height 0.2s ease" }}
              />
            </g>
          );
        })}
      </svg>
      {hoveredIdx !== null && series[hoveredIdx] && (
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            boxShadow: "var(--shadow-card)",
            color: "var(--ink)",
            padding: "4px 12px",
            borderRadius: 8,
            fontSize: "0.8125rem",
            fontWeight: 600,
            pointerEvents: "none",
            zIndex: 10,
            display: "flex",
            gap: 8,
          }}
        >
          <span style={{ color: "var(--ink-soft)" }}>{series[hoveredIdx].label}:</span>
          <span>{money(series[hoveredIdx].value)}</span>
        </div>
      )}
    </div>
  );
}
