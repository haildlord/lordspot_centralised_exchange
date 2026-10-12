"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePalette } from "./PaletteProvider";

/**
 * A button that looks like a search box and opens the market palette.
 *  - "header": compact bar for the trade top bar
 *  - "hero":   the big search on the landing page
 */
export function SearchTrigger({
  variant = "header",
  className,
}: {
  variant?: "header" | "hero";
  className?: string;
}) {
  const { open } = usePalette();

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="/"
        className={cn(
          "group flex h-16 w-full items-center gap-4 rounded-2xl border border-line-2 bg-panel/80 px-5 text-left backdrop-blur transition duration-300",
          "hover:-translate-y-0.5 hover:border-gold-500/50 hover:shadow-[0_0_0_4px_rgb(243_177_58/0.07),0_24px_70px_-24px_rgb(243_177_58/0.4)]",
          "active:translate-y-0 active:scale-[0.995]",
          className,
        )}
      >
        <Search size={22} className="shrink-0 text-gold-400 transition-transform duration-300 group-hover:scale-110" />
        <span className="flex-1 truncate text-[17px] text-fg-3 transition-colors group-hover:text-fg-2">
          Search a ticker or name…
        </span>
        <span className="kbd">/</span>
        <span className="btn btn-primary btn-sm pointer-events-none">Search</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      aria-keyshortcuts="/"
      className={cn(
        "group flex h-10 w-full max-w-[520px] items-center gap-2.5 rounded-xl border border-line bg-panel px-3.5 text-[14px] text-fg-3 transition duration-300",
        "hover:border-line-2 hover:bg-panel-2 hover:text-fg-2 hover:shadow-[0_8px_24px_-14px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      <Search size={16} className="shrink-0 transition-colors group-hover:text-gold-400" />
      <span className="flex-1 truncate text-left">Search markets, stocks, and more</span>
      <span className="kbd">/</span>
    </button>
  );
}
