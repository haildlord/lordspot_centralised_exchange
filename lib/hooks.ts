import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Client-only hooks. Import these from Client Components only. */

/** Measures an element with ResizeObserver. Returns [ref, { width, height }] (0×0 until mounted). */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}

const pad = (n: number) => String(n).padStart(2, "0");

function subscribeEverySecond(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

function utcNow() {
  const d = new Date();
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

/** "HH:MM:SS" in UTC, ticking every second. Server render + hydration show "--:--:--". */
export function useUtcClock(): string {
  return useSyncExternalStore(subscribeEverySecond, utcNow, () => "--:--:--");
}
