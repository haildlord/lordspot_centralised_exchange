"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { BookLevel, OrderBookData } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TREND_TEXT } from "@/components/ui/trend";

type BookView = "both" | "bids" | "asks";

interface OrderBookProps {
  /** Without it the ladder is empty and the mid row shows a dash. */
  book?: OrderBookData;
  base?: string;
  quote?: string;
  tickSize?: string;
}

const label = (name: string, unit?: string) => (unit ? `${name} (${unit})` : name);

/**
 * Bids / asks ladder with depth bars, mid-price row and a buy/sell pressure bar.
 * Rows are clipped to the panel height, so hand it as many levels as you have.
 */
export function OrderBook({ book, base, quote, tickSize }: OrderBookProps) {
  const [view, setView] = useState<BookView>("both");
  const showAsks = view !== "bids";
  const showBids = view !== "asks";
  const trend = book?.trend ?? "flat";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* view toggle + tick size */}
      <div className="flex shrink-0 items-center gap-0.5 px-3 pb-2 pt-3">
        {(["both", "asks", "bids"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            aria-label={v === "both" ? "Show bids and asks" : `Show ${v} only`}
            onClick={() => setView(v)}
            className="icon-btn size-7"
            data-active={view === v}
          >
            <ViewGlyph kind={v} />
          </button>
        ))}

        <span className="num ml-auto text-[12px] text-fg-2">
          <span className="text-fg-3">Tick </span>
          {tickSize ?? "—"}
        </span>
      </div>

      {/* column heads */}
      <div className="grid shrink-0 grid-cols-3 px-3 pb-1.5 text-[11px] font-medium text-fg-3">
        <span>{label("Price", quote)}</span>
        <span className="text-right">{label("Size", base)}</span>
        <span className="text-right">{label("Total", base)}</span>
      </div>

      {/* asks — lowest ask sits at the bottom, next to the mid row */}
      {showAsks && (
        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
          {book?.asks.map((level) => (
            <Row key={level.price} level={level} side="ask" />
          ))}
        </div>
      )}

      {/* mid price */}
      <div className="flex shrink-0 items-center gap-2 border-y border-line/70 bg-panel-2/70 px-3 py-2">
        <span className={cn("num text-[19px] font-semibold leading-none", TREND_TEXT[trend])}>
          {book?.lastPrice ?? "—"}
        </span>
        {trend === "up" && <ArrowUp size={15} className="text-up" />}
        {trend === "down" && <ArrowDown size={15} className="text-down" />}
      </div>

      {/* bids */}
      {showBids && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {book?.bids.map((level) => (
            <Row key={level.price} level={level} side="bid" />
          ))}
        </div>
      )}

      {/* buy / sell pressure */}
      {book && (
        <div className="flex h-7 shrink-0 overflow-hidden border-t border-line text-[11px] font-semibold">
          <div
            className="num flex items-center bg-up/20 px-3 text-up transition-[width] duration-700 ease-smooth"
            style={{ width: `${book.buyPct}%` }}
          >
            {book.buyPct}%
          </div>
          <div className="num flex flex-1 items-center justify-end bg-down/20 px-3 text-down">{100 - book.buyPct}%</div>
        </div>
      )}
    </div>
  );
}

function Row({ level, side }: { level: BookLevel; side: "ask" | "bid" }) {
  return (
    <div className="relative grid h-[22px] shrink-0 cursor-default grid-cols-3 items-center px-3 text-[12px] transition-colors duration-150 hover:bg-white/[0.045]">
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-px right-0 rounded-l-[3px] transition-[width] duration-500 ease-smooth",
          side === "ask" ? "bg-down/[0.14]" : "bg-up/[0.14]",
        )}
        style={{ width: `${Math.min(100, Math.max(0, level.depth * 100))}%` }}
      />
      <span className={cn("num relative", side === "ask" ? "text-down" : "text-up")}>{level.price}</span>
      <span className="num relative text-right text-fg">{level.size}</span>
      <span className="num relative text-right text-fg-2">{level.total}</span>
    </div>
  );
}

/** 16px glyphs for the three view buttons (asks red, bids green). */
function ViewGlyph({ kind }: { kind: BookView }) {
  const bars = (ys: number[], color: string) =>
    ys.map((y) => <rect key={y} x="2" y={y} width="12" height="2.2" rx="1" fill={color} />);
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      {kind === "both" && (
        <>
          {bars([2.5, 5.5], "var(--color-down)")}
          {bars([8.3, 11.3], "var(--color-up)")}
        </>
      )}
      {kind === "asks" && bars([2, 5, 8, 11], "var(--color-down)")}
      {kind === "bids" && bars([2, 5, 8, 11], "var(--color-up)")}
    </svg>
  );
}
