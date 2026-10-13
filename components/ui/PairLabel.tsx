import type { Market } from "@/lib/types";
import { cn } from "@/lib/cn";

/** "BASE/QUOTE" with a bold base and muted quote; perps render as "BASE-PERP". */
export function PairLabel({
  market,
  className,
}: {
  market: Pick<Market, "base" | "quote" | "kind">;
  className?: string;
}) {
  return (
    <span className={cn("whitespace-nowrap", className)}>
      <span className="font-semibold text-fg">{market.base}</span>
      <span className="text-fg-3">{market.kind === "perp" ? "-PERP" : `/${market.quote}`}</span>
    </span>
  );
}
