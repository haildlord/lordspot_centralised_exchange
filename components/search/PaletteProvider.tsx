"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Market, Ticker } from "@/lib/types";
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

const NO_MARKETS: Market[] = [];

/** Keep in step with the exit animations in globals.css (.palette-overlay[data-state="closed"]). */
const EXIT_MS = 180;

/**
 * Mounts the market search once for the whole app. Anything can open it with `usePalette().open()`.
 *
 * Closing is two-step (open -> closing -> closed) so the exit animation can play
 * before the palette unmounts.
 *
 * `markets` is the list the palette searches. Empty until you pass one (from a server
 * component in app/layout.tsx, or fetch it however you like). `tickers` (keyed by market
 * symbol) fills the price / change / volume columns.
 */
export function PaletteProvider({
  markets = NO_MARKETS,
  tickers,
  children,
}: {
  markets?: Market[];
  tickers?: Record<string, Ticker>;
  children: ReactNode;
}) {
  const [state, setState] = useState<PaletteState>("closed");

  const open = useCallback(() => setState("open"), []);
  const close = useCallback(() => setState((s) => (s === "open" ? "closing" : s)), []);

  useEffect(() => {
    if (state !== "closing") return;
    const timer = setTimeout(() => setState("closed"), EXIT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const value = useMemo(() => ({ open, close, isOpen: state === "open" }), [open, close, state]);

  return (
    <PaletteContext value={value}>
      {children}
      {state !== "closed" && <MarketPalette markets={markets} tickers={tickers} closing={state === "closing"} onClose={close} />}
    </PaletteContext>
  );
}
