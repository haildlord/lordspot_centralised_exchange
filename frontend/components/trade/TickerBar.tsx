"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Market, Ticker, Trend } from "@/lib/types";
import { cn } from "@/lib/cn";
import { usePalette } from "@/components/search/PaletteProvider";
import { PairLabel } from "@/components/ui/PairLabel";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { TREND_TEXT } from "@/components/ui/trend";
import { SignalingManager } from "@/lib/SignalingManager";

const EMPTY = "—";

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
  const [currentTicker, setCurrentTicker] = useState<Ticker | undefined>(ticker);

  // Sync state if initial ticker changes (e.g. user navigated to a new market)
  useEffect(() => {
    setCurrentTicker(ticker);
  }, [ticker]);

  // Subscribe to real-time WebSocket ticker & trade updates
  useEffect(() => {
    if (!symbol) return;
    const socket = SignalingManager.getInstance();

    // 1. Subscribe to 24h ticker updates
    const tickerSubId = socket.subscribe("ticker", symbol, (data: any) => {
      if (!data) return;
      setCurrentTicker((prev) => {
        const lastPrice = data.c ?? prev?.lastPrice ?? "0";
        const priceChange = data.p ?? prev?.priceChange ?? "0";
        const priceChangePercent = data.P ?? prev?.priceChangePercent ?? "0";
        const high = data.h ?? prev?.high ?? "0";
        const low = data.l ?? prev?.low ?? "0";
        const volume = data.v ?? prev?.volume ?? "0";

        return {
          symbol,
          firstPrice: data.o ?? prev?.firstPrice ?? "0",
          high,
          low,
          lastPrice,
          priceChange,
          priceChangePercent,
          volume,
          quoteVolume: data.V ?? prev?.quoteVolume ?? "0",
          trades: prev?.trades ?? "0",
        };
      });
    });

    // 2. Also subscribe to trade ticks for instant sub-second lastPrice updates
    const tradeSubId = socket.subscribe("trade", symbol, (data: any) => {
      if (!data?.p) return;
      setCurrentTicker((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lastPrice: data.p,
        };
      });
    });

    return () => {
      if (tickerSubId) socket.unSubscribe("ticker", symbol, tickerSubId);
      if (tradeSubId) socket.unSubscribe("trade", symbol, tradeSubId);
    };
  }, [symbol]);

  // Calculate percentage and trend
  const pctNum = Number(currentTicker?.priceChangePercent ?? 0);
  const changeNum = Number(currentTicker?.priceChange ?? 0);

  const trend: Trend = changeNum > 0 ? "up" : changeNum < 0 ? "down" : "flat";
  const tone = TREND_TEXT[trend];

  const changeFormatted = currentTicker?.priceChange
    ? `${changeNum > 0 ? "+" : ""}${changeNum.toFixed(2)}`
    : EMPTY;

  const changePctFormatted = currentTicker?.priceChangePercent
    ? `(${pctNum > 0 ? "+" : ""}${(pctNum * 100).toFixed(2)}%)`
    : EMPTY;

  const volumeFormatted = currentTicker?.volume
    ? Number(currentTicker.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : EMPTY;

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
        {currentTicker?.lastPrice ?? EMPTY}
      </span>

      <Stat label="24H Change">
        <span className={tone}>
          {currentTicker ? `${changeFormatted} ${changePctFormatted}` : EMPTY}
        </span>
      </Stat>
      <Stat label="24H High" className="@max-[620px]:hidden">{currentTicker?.high ?? EMPTY}</Stat>
      <Stat label="24H Low" className="@max-[720px]:hidden">{currentTicker?.low ?? EMPTY}</Stat>
      <Stat label="24H Volume" className="@max-[860px]:hidden">{volumeFormatted}</Stat>
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
