import type { Trend } from "@/lib/types";

const COLOR: Record<Trend, string> = {
  up: "var(--color-up)",
  down: "var(--color-down)",
  flat: "var(--color-fg-3)",
};

/** Tiny area sparkline. Pure SVG, renders on the server. */
export function Sparkline({
  points,
  trend,
  width = 96,
  height = 32,
  className,
}: {
  points: readonly number[];
  trend: Trend;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const line = points
    .map((p, i) => {
      const x = (i * step).toFixed(1);
      const y = (2 + (1 - (p - min) / span) * (height - 4)).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
  const gradientId = `spark-${trend}`;
  const color = COLOR[trend];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${gradientId})`} />
      <path d={line} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
