"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface MenuItem {
  id: string;
  label: ReactNode;
}

interface MenuProps {
  items: readonly MenuItem[];
  value: string;
  onSelect: (id: string) => void;
  /** Render the button contents; `open` lets you flip a chevron. */
  trigger: (open: boolean) => ReactNode;
  /** Accessible name for the trigger. */
  label: string;
  align?: "left" | "right";
  className?: string;
  triggerClassName?: string;
}

/** Small dropdown: closes on outside click or Escape. */
export function Menu({
  items,
  value,
  onSelect,
  trigger,
  label,
  align = "left",
  className,
  triggerClassName,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={triggerClassName}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger(open)}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className={cn(
            "absolute z-40 mt-1.5 min-w-[130px] animate-pop-in rounded-xl border border-line-2 bg-panel-2 p-1 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)]",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          )}
        >
          {items.map((item) => {
            const selected = item.id === value;
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors duration-150 hover:bg-raise hover:text-fg",
                    selected ? "text-gold-400" : "text-fg-2",
                  )}
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  {selected && <Check size={14} strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
