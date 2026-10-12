"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Market, Ticker } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TREND_TEXT, trendOf } from "@/lib/format";
import { usePalette } from "@/components/search/PaletteProvider";
import { PairLabel } from "@/components/ui/PairLabel";
import { TokenAvatar } from "@/components/ui/TokenAvatar";

/**
 * Strip above the chart: market selector (opens the search palette), last price
 * and 24h stats. Scrolls sideways on narrow screens.
 */
export function TickerBar({
  market,
  ticker,
  feeLabel = "0 Fees",
}: {
  market: Market;
  ticker: Ticker;
  /** Badge on the far right. */
  feeLabel?: string;
}) {
  const { open, isOpen } = usePalette();
  const tone = TREND_TEXT[trendOf(ticker.changePct)];

  return (
    <section aria-label="Market summary" className="panel no-scrollbar @container flex items-center gap-x-5 overflow-x-auto px-4 py-2.5">
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Change market (current: ${market.base}/${market.quote})`}
        className="group -ml-1 flex shrink-0 items-center gap-3 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/[0.04]"
      >
        <TokenAvatar symbol={market.base} size={34} />
        <span className="flex items-center gap-2 text-[19px]">
          <PairLabel market={market} />
          {market.leverage && (
            <span className="rounded-md bg-iris/15 px-1.5 py-1 text-[11px] font-semibold leading-none text-iris">
              {market.leverage}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={cn("text-fg-3 transition group-hover:text-fg", isOpen && "rotate-180")}
        />
      </button>

      <span className={cn("num shrink-0 text-[26px] font-semibold leading-none", tone)}>{ticker.lastPrice}</span>

      <Stat label="24H Change">
        <span className={tone}>
          {ticker.change} {ticker.changePct}
        </span>
      </Stat>
      <Stat label="24H High" className="@max-[620px]:hidden">{ticker.high}</Stat>
      <Stat label="24H Low" className="@max-[720px]:hidden">{ticker.low}</Stat>
      <Stat label="24H Volume (USD)" className="@max-[860px]:hidden">{ticker.volume}</Stat>

      <span className="ml-auto shrink-0 rounded-lg border border-gold-500/30 bg-gold-500/10 px-2.5 py-1.5 text-[12px] font-semibold text-gold-400 @max-[960px]:hidden">
        {feeLabel}
      </span>
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
