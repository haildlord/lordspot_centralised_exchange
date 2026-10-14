"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Market, Ticker } from "@/lib/types";
import { cn } from "@/lib/cn";
import { usePalette } from "@/components/search/PaletteProvider";
import { PairLabel } from "@/components/ui/PairLabel";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { TREND_TEXT } from "@/components/ui/trend";

const EMPTY = "—";

/**
 * Strip above the chart: market selector (opens the search palette), last price
 * and 24h stats. Without `ticker` every value shows a dash; without `market` the
 * raw `symbol` from the url is shown as the title.
 */
export function TickerBar({
  symbol,
  market,
  ticker,
}: {
  symbol: string;
  market?: Market;
  ticker?: Ticker;
}) {
  const { open, isOpen } = usePalette();
  const tone = TREND_TEXT[ticker?.trend ?? "flat"];

  return (
    <section aria-label="Market summary" className="panel no-scrollbar @container flex items-center gap-x-5 overflow-x-auto px-4 py-2.5">
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Change market (current: ${symbol})`}
        className="group -ml-1 flex shrink-0 items-center gap-3 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/[0.04]"
      >
        <TokenAvatar baseSymbol={market?.baseSymbol ?? symbol} size={34} />
        <span className="flex items-center gap-2 text-[19px]">
          {market ? <PairLabel market={market} /> : <span className="font-semibold text-fg">{symbol}</span>}
        </span>
        <ChevronDown
          size={18}
          className={cn("text-fg-3 transition group-hover:text-fg", isOpen && "rotate-180")}
        />
      </button>

      <span className={cn("num shrink-0 text-[26px] font-semibold leading-none", tone)}>
        {ticker?.lastPrice ?? EMPTY}
      </span>

      <Stat label="24H Change">
        <span className={tone}>{ticker ? `${ticker.change} ${ticker.changePct}` : EMPTY}</span>
      </Stat>
      <Stat label="24H High" className="@max-[620px]:hidden">{ticker?.high ?? EMPTY}</Stat>
      <Stat label="24H Low" className="@max-[720px]:hidden">{ticker?.low ?? EMPTY}</Stat>
      <Stat label="24H Volume" className="@max-[860px]:hidden">{ticker?.volume ?? EMPTY}</Stat>
    </section>
  );
}

/** Stats drop off (right to left) as the bar gets narrower — see the @max-[…] classes above. */
function Stat({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("shrink-0", className)}>
      <div className="text-[11px] font-medium text-fg-3">{label}</div>
      <div className="num mt-0.5 text-[13px] text-fg">{children}</div>
    </div>
  );
}
