"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Market } from "@/lib/types";
import { MarketPalette } from "./MarketPalette";

interface PaletteContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used inside <PaletteProvider>");
  return ctx;
}

type PaletteState = "closed" | "open" | "closing";

/** Keep in step with the exit animations in globals.css (.palette-overlay[data-state="closed"]). */
const EXIT_MS = 180;

/**
 * Mounts the market search palette once for the whole app and wires the global
 * shortcuts: "/" and ⌘K / Ctrl+K open it, Esc closes it.
 *
 * Closing is two-step (open -> closing -> closed) so the exit animation can play
 * before the palette unmounts.
 *
 * `markets` is the list the palette searches — pass it from a server component
 * (see app/layout.tsx) or fetch it however you like.
 */
export function PaletteProvider({ markets, children }: { markets: Market[]; children: ReactNode }) {
  const [state, setState] = useState<PaletteState>("closed");

  const open = useCallback(() => setState("open"), []);
  const close = useCallback(() => setState((s) => (s === "open" ? "closing" : s)), []);

  useEffect(() => {
    if (state !== "closing") return;
    const timer = setTimeout(() => setState("closed"), EXIT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setState((s) => (s === "open" ? "closing" : "open"));
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setState("open");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open, close, isOpen: state === "open" }), [open, close, state]);

  return (
    <PaletteContext value={value}>
      {children}
      {state !== "closed" && <MarketPalette markets={markets} closing={state === "closing"} onClose={close} />}
    </PaletteContext>
  );
}
