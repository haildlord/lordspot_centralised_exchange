"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
}

interface TabsProps<T extends string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** "underline" sits on a bordered header row; "pill" is a filled chip. */
  variant?: "underline" | "pill";
  /** Accessible name for the tablist. */
  label: string;
  className?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = "underline",
  label,
  className,
}: TabsProps<T>) {
  
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);
  const itemClass = variant === "pill" ? "pill-tab" : "tab";
  const inset = variant === "underline" ? 10 : 0;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!active) return;
      const x = active.offsetLeft + inset;
      const w = active.offsetWidth - inset * 2;
      // Bail out when nothing moved so ResizeObserver can never loop.
      setBar((prev) => (prev && prev.x === x && prev.w === w ? prev : { x, w }));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  }, [value, items.length, inset]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const current = items.findIndex((t) => t.id === value);
    const delta = e.key === "ArrowRight" ? 1 : items.length - 1;
    const nextIndex = (current + delta) % items.length;
    onChange(items[nextIndex].id);
    (e.currentTarget.children[nextIndex] as HTMLElement | undefined)?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      data-ready={bar ? "true" : undefined}
      className={cn("tab-list flex items-center", className)}
      onKeyDown={onKeyDown}
    >
      {items.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            data-active={active}
            className={itemClass}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
      {/* Last child on purpose: keyboard navigation indexes into the tabs above. */}
      {bar && (
        <span
          aria-hidden
          className="tab-bar"
          data-variant={variant}
          style={{ transform: `translateX(${bar.x}px)`, width: bar.w, opacity: 1 }}
        />
      )}
    </div>
  );
}
