"use client";

import { cn } from "@/lib/cn";
import { Depth } from "@/lib/types";
import { formatOrderBook } from "../../lib/format";

interface OrderBookProps {
  symbol: string;
  base?: string;
  quote?: string;
  tickSize?: string;
  book?: any;
  depth: Depth
}

const depthHeaders = (
  <div className="grid shrink-0 grid-cols-3 gap-x-4 px-4 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-3 border-b border-line/40">
    <span>Price</span>
    <span className="text-right">Size</span>
    <span className="text-right">Total</span>
  </div>
);

const eachRow = (price: string, size: string, total: string, depth: number, side: "ask" | "bid") => {
  return (
    <div className="relative grid grid-cols-3 gap-x-4 items-center px-4 h-[28px] text-[13px] hover:bg-white/[0.04] transition-colors">
      <span
        className={cn("absolute inset-y-0.5 right-0 rounded-l", side === "ask" ? "bg-down/15" : "bg-up/15")}
        style={{ width: `${depth * 100}%` }}
      />
      <span className={cn("num relative font-medium", side === "ask" ? "text-down" : "text-up")}>
        {price}
      </span>
      <span className="num relative text-right text-fg">{size}</span>
      <span className="num relative text-right text-fg-2">{total}</span>
    </div>
  );
};

const midPriceSection = (midPrice : string, spread : string) => (
  <div className="flex shrink-0 items-center gap-2 border-y border-line/70 bg-panel-2/70 px-4 py-2.5 my-1">

    <span className="num text-[18px] font-semibold leading-none">
    {midPrice}
    </span>
    
    <span className="text-[11px] text-fg-3 ml-auto">
      Spread: {spread}
    </span>
  </div>
);

const pressureBar = (buyPct: number) => (
  <div className="flex h-7 shrink-0 overflow-hidden border-t border-line text-[11px] font-semibold">

    <div
      className="num flex items-center bg-up/20 px-3 text-up transition-[width] duration-500"
      style={{ width: `${buyPct}%` }}
    >
      {buyPct}%
    </div>

    <div className="num flex flex-1 items-center justify-end bg-down/20 px-3 text-down">
      {100 - buyPct}%
    </div>
    
  </div>
);


export function OrderBook({ symbol, book, base, quote, tickSize, depth }: OrderBookProps) {

  const {finalAsks, finalBids, midPrice, spread, buyPct} = formatOrderBook(depth);

  return (
    <div className="flex h-full min-h-0 flex-col">

      {depthHeaders}

      <div className="flex-1 min-h-0 overflow-y-auto">
        
        <div className="flex flex-col">
          {finalAsks.map((item) => eachRow(item.price, item.size, item.total, item.depth, "ask")).reverse()}
        </div>

        {midPriceSection(midPrice, spread)}

        <div className="flex flex-col">
          {finalBids.map((item) => eachRow(item.price, item.size, item.total, item.depth, "bid"))}
        </div>

      </div>

      {pressureBar(buyPct)}

    </div>
  );
}
