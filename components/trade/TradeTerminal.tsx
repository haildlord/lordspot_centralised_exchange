import type { TerminalData } from "@/lib/types";
import { BookPanel } from "./BookPanel";
import { ChartPanel } from "./ChartPanel";
import { OrderForm } from "./OrderForm";
import { TickerBar } from "./TickerBar";

/**
 * The whole /trade/[market] screen. Placement (see `.terminal` in globals.css):
 *
 *   ticker ─────────────┐  order
 *   chart  │ book       │  form
 *   ───────┴────────────┘
 *
 * `key={symbol}` on the stateful panels resets their local state (tabs, form
 * inputs, hover) when the user switches market without a full page load.
 */
export function TradeTerminal({ data }: { data: TerminalData }) {
  const key = data.market.symbol;

  return (
    <div className="terminal">
      <div className="t-ticker min-w-0">
        <TickerBar key={key} market={data.market} ticker={data.ticker} />
      </div>
      <div className="t-chart grid min-h-0 min-w-0">
        <ChartPanel key={key} data={data} />
      </div>
      <div className="t-book grid min-h-0 min-w-0">
        <BookPanel key={key} data={data} />
      </div>
      <div className="t-form min-w-0">
        <OrderForm key={key} market={data.market} />
      </div>
    </div>
  );
}

/** Same grid, empty panels. Shown while a market's data is resolving. */
export function TerminalSkeleton() {
  const block = "panel skeleton";
  return (
    <div className="terminal" aria-busy="true" aria-label="Loading market">
      <div className={`t-ticker h-[62px] ${block}`} />
      <div className={`t-chart ${block}`} />
      <div className={`t-book ${block}`} />
      <div className={`t-form h-[460px] ${block}`} />
    </div>
  );
}
