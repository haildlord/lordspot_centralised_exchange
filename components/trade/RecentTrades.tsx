import type { RecentTrade } from "@/lib/types";
import { cn } from "@/lib/cn";

/** "Trades" tab of the book panel: newest first, price coloured by taker side. */
export function RecentTrades({ trades, base, quote }: { trades: readonly RecentTrade[]; base: string; quote: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid shrink-0 grid-cols-3 px-3 pb-1.5 pt-3 text-[11px] font-medium text-fg-3">
        <span>Price ({quote})</span>
        <span className="text-right">Qty ({base})</span>
        <span className="text-right">Time</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {trades.map((t) => (
          <div
            key={t.id}
            className="grid h-[22px] grid-cols-3 items-center px-3 text-[12px] transition-colors duration-150 hover:bg-white/[0.045]"
          >
            <span className={cn("num", t.side === "buy" ? "text-up" : "text-down")}>{t.price}</span>
            <span className="num text-right text-fg">{t.qty}</span>
            <span className="num text-right text-fg-3">{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
