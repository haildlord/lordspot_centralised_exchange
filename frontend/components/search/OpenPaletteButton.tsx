"use client";

import type { ReactNode } from "react";
import { usePalette } from "./PaletteProvider";

/** Any button that should open the market search — usable from Server Components. */
export function OpenPaletteButton({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = usePalette();
  return (
    <button type="button" onClick={open} aria-haspopup="dialog" className={className}>
      {children}
    </button>
  );
}
