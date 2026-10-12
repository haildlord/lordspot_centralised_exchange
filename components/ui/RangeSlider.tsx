"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface RangeSliderProps {
  /** 0–100 */
  value: number;
  onChange: (value: number) => void;
  accent?: "up" | "down" | "gold";
  /** Dots drawn on the rail (the 0 / 25 / 50 / 75 / 100 % stops by default). */
  stops?: readonly number[];
  ariaLabel: string;
  className?: string;
}

/**
 * Native <input type="range"> (keyboard + a11y for free) dressed up with a
 * filled rail and stop dots. All it does is report the percentage — turning
 * that into a quantity is up to you.
 */
export function RangeSlider({
  value,
  onChange,
  accent = "up",
  stops = [0, 25, 50, 75, 100],
  ariaLabel,
  className,
}: RangeSliderProps) {
  return (
    <div
      className={cn("range", className)}
      data-accent={accent}
      style={{ "--pct": value } as CSSProperties}
    >
      <div className="range-rail" />
      <div className="range-fill" />
      {stops.map((stop) => (
        <span
          key={stop}
          className="range-stop"
          data-on={value >= stop}
          style={{ left: `calc(var(--thumb) / 2 + (100% - var(--thumb)) * ${stop} / 100)` }}
        />
      ))}
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        aria-label={ariaLabel}
        aria-valuetext={`${value}%`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
