"use client";

import { cn } from "@/lib/cn";
import { Depth, DepthResponse, OrderBookLevel } from "@/lib/types";
import { formatOrderBook} from "../../lib/format";
import { OrderBookProps,  Trade } from "../../lib/types";
import { useEffect, useState, useRef } from "react";
import { SignalingManager } from "../../lib/SignalingManager";

function mergeDepthLevels(
  currentLevels: OrderBookLevel[],
  deltaLevels: any[]
): OrderBookLevel[] {
  
  const map = new Map<string, string>(currentLevels);

  for (const item of deltaLevels) {
    const price = Array.isArray(item) ? item[0] : item?.price;
    const size = Array.isArray(item) ? item[1] : item?.size;
    if (price === undefined || size === undefined) continue;

    if (parseFloat(size) === 0) {
      map.delete(price);
    } else {
      map.set(price, size);
    }
  }

  return Array.from(map.entries()) as OrderBookLevel[];
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
    <div key={price} className="relative grid grid-cols-3 gap-x-4 items-center px-4 h-[28px] text-[13px] hover:bg-white/[0.04] transition-colors">
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

const midPriceSection = (midPrice: string, spread: string, trend: "up" | "down" = "up") => (
  <div className="flex shrink-0 items-center gap-2 border-y border-line/70 bg-panel-2/70 px-4 py-2.5 my-1">
    <span
      className={cn(
        "num text-[18px] font-semibold leading-none flex items-center gap-1.5",
        trend === "up" ? "text-up" : "text-down"
      )}
    >
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
  
  const [depthData, setDepthData] = useState<DepthResponse | null>();
  const [currentBook, setCurrentBook] = useState<Depth>(depth);
  const {finalAsks, finalBids, spread, buyPct} = formatOrderBook(currentBook);
  const [tickerInfo, setTickerInfo] = useState<Trade>();
  const [priceTrend, setPriceTrend] = useState<"up" | "down">("up");
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {

    const socket  : SignalingManager = SignalingManager.getInstance();
    const id      : number | null    = socket.subscribe("depth", symbol, setDepthData);
    const priceId : number | null   = socket.subscribe("ticker", symbol, setTickerInfo);

    return () => {
      if(id && priceId){
        socket.unSubscribe("depth", symbol, id);
        socket.unSubscribe("ticker", symbol, priceId);
      }
    }

  }, [symbol])

  useEffect(() => {
    setCurrentBook(depth);
  }, [depth]);

  useEffect(() => {
    if (!tickerInfo?.c) return;
    const current = Number(tickerInfo.c);
    if (prevPriceRef.current !== null) {
      if (current > prevPriceRef.current) setPriceTrend("up");
      else if (current < prevPriceRef.current) setPriceTrend("down");
    }
    prevPriceRef.current = current;
  }, [tickerInfo?.c]);



  function updateOrderBook(delta: any) {
    const payload = delta?.data ?? delta;
    const eventTime = payload?.T ?? payload?.E ?? payload?.timestamp;
    const eventUpdateId = payload?.u ?? payload?.lastUpdateId;

    setCurrentBook((prev) => {
      if (eventTime && prev.timestamp && Number(eventTime) <= Number(prev.timestamp)) {
        return prev;
      }
      
      if (eventUpdateId && prev.lastUpdateId && Number(eventUpdateId) <= Number(prev.lastUpdateId)) {
        return prev;
      }

      const rawAsks = payload?.asks ?? payload?.a ?? [];
      const rawBids = payload?.bids ?? payload?.b ?? [];

      return {
        ...prev,
        timestamp: eventTime ? Number(eventTime) : prev.timestamp,
        lastUpdateId: eventUpdateId ? String(eventUpdateId) : prev.lastUpdateId,
        asks: mergeDepthLevels(prev.asks, rawAsks),
        bids: mergeDepthLevels(prev.bids, rawBids),
      };
    });
  }

  useEffect(() => {
    if (!depthData) return;
    updateOrderBook(depthData);
  }, [depthData]);


  return (
    <div className="flex h-full min-h-0 flex-col">

      {depthHeaders}

      <div className="flex-1 min-h-0 overflow-y-auto">
        
        <div className="flex flex-col">
          {finalAsks.map((item) => eachRow(item.price, item.size, item.total, item.depth, "ask")).reverse()}
        </div>

        {midPriceSection(tickerInfo?.c ?? "—", spread, priceTrend)}

        <div className="flex flex-col">
          {finalBids.map((item) => eachRow(item.price, item.size, item.total, item.depth, "bid"))}
        </div>

      </div>

      {pressureBar(buyPct)}

    </div>
  );
}
