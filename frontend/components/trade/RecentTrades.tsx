import type { TradeResponse, TradesPayload } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import { SignalingManager } from "@/lib/SignalingManager";
import { getTrades } from "@/lib/klines";

export function RecentTrades({
  base,
  quote,
  symbol
}: {
  base?: string;
  quote?: string;
  symbol: string;
}) {

  const [trades, setTrades] = useState<TradesPayload[]>([]);

  useEffect(() => {
    const id : number = SignalingManager.getInstance().subscribe("trade", symbol, updateTrades)!;

    getTrades(symbol).then((data) => {
      
      if(!Array.isArray(data)) return;

      setTrades((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems = data.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newItems].slice(0, 50);
      });
    });
    
    return () => {
      SignalingManager.getInstance().unSubscribe("trade", symbol, id)
    }

  },[symbol])

  function updateTrades(data: TradeResponse["data"]) {
    
    if (!data || !data.p) return;

    const newTrade : TradesPayload = {
      id            :  data.t,
      price         :  data.p,
      isBuyerMaker  :  data.m,
      quantity      :  data.q,
      quoteQuantity : (parseFloat(data.p) * parseFloat(data.q)).toString(),
      timestamp     : data.T
    }

    setTrades((prev) => [newTrade, ...prev.slice(0,49)])
  }

  return (    
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid shrink-0 grid-cols-3 px-3 pb-1.5 pt-3 text-[11px] font-medium text-fg-3">
        <span>{quote ? `Price (${quote})` : "Price"}</span>
        <span className="text-right">{base ? `Qty (${base})` : "Qty"}</span>
        <span className="text-right">Time</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {trades && trades.map((item) => (
          <div
            key={item.id}
            className="grid h-[22px] grid-cols-3 items-center px-3 text-[12px] transition-colors duration-150 hover:bg-white/[0.045]"
          >
            <span className={item.isBuyerMaker ? "text-down font-medium" : "text-up font-medium"}>
              {item.price}
            </span>
            <span className="num text-right text-fg">{item.quantity}</span>
            <span className="num text-right text-fg-3">
              {new Date(item.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}