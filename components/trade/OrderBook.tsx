"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Lock, LockOpen, Minus, Plus } from "lucide-react";
import type { BookLevel, OrderBookData } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TREND_TEXT } from "@/lib/format";

type BookView = "both" | "bids" | "asks";

interface OrderBookProps {
  book: OrderBookData;
  base: string;
  quote: string;
  /** Shown between the − / + buttons, e.g. "0.0001". */
  tickSize: string;
  /** TODO(api): change the aggregation step and re-request the book. */
  onTickChange?: (direction: "up" | "down") => void;
}

/**
 * Bids / asks ladder with depth bars, mid-price row and a buy/sell pressure bar.
 * Rows are clipped to the panel height, so hand it as many levels as you have.
 */
export function OrderBook({ book, base, quote, tickSize, onTickChange }: OrderBookProps) {
  const [view, setView] = useState<BookView>("both");
  const [locked, setLocked] = useState(false);
  const showAsks = view !== "bids";
  const showBids = view !== "asks";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* controls */}
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
        <button
          type="button"
          aria-pressed={locked}
          aria-label={locked ? "Unlock order book" : "Lock order book"}
          onClick={() => setLocked((l) => !l)}
          className="icon-btn ml-0.5 size-7"
          data-active={locked}
        >
          {locked ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>

        <div className="num ml-auto flex items-center gap-1 text-[12px] text-fg-2">
          <button type="button" aria-label="Decrease tick size" onClick={() => onTickChange?.("down")} className="icon-btn size-6">
            <Minus size={13} />
          </button>
          <span className="min-w-[48px] text-center">{tickSize}</span>
          <button type="button" aria-label="Increase tick size" onClick={() => onTickChange?.("up")} className="icon-btn size-6">
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* column heads */}
      <div className="grid shrink-0 grid-cols-3 px-3 pb-1.5 text-[11px] font-medium text-fg-3">
        <span>Price ({quote})</span>
        <span className="text-right">Size ({base})</span>
        <span className="text-right">Total ({base})</span>
      </div>

      {/* asks — lowest ask sits at the bottom, next to the mid row */}
      {showAsks && (
        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
          {book.asks.map((level) => (
            <Row key={level.price} level={level} side="ask" />
          ))}
        </div>
      )}

      {/* mid price */}
      <div className="flex shrink-0 items-center gap-2 border-y border-line/70 bg-panel-2/70 px-3 py-2">
        <span className={cn("num text-[19px] font-semibold leading-none", TREND_TEXT[book.trend])}>{book.lastPrice}</span>
        {book.trend === "up" && <ArrowUp size={15} className="text-up" />}
        {book.trend === "down" && <ArrowDown size={15} className="text-down" />}
      </div>

      {/* bids */}
      {showBids && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {book.bids.map((level) => (
            <Row key={level.price} level={level} side="bid" />
          ))}
        </div>
      )}

      {/* buy / sell pressure */}
      <div className="flex h-7 shrink-0 overflow-hidden border-t border-line text-[11px] font-semibold">
        <div
          className="num flex items-center bg-up/20 px-3 text-up transition-[width] duration-700 ease-smooth"
          style={{ width: `${book.buyPct}%` }}
        >
          {book.buyPct}%
        </div>
        <div className="num flex flex-1 items-center justify-end bg-down/20 px-3 text-down">{100 - book.buyPct}%</div>
      </div>
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
