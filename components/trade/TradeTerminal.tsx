import type { Market, OrderBookData, RecentTrade, Ticker } from "@/lib/types";
import { BookPanel } from "./BookPanel";
import { ChartPanel } from "./ChartPanel";
import { OrderForm } from "./OrderForm";
import { TickerBar } from "./TickerBar";

interface TradeTerminalProps {
  /** The `[market]` url param. Always known, even before any data has arrived. */
  symbol: string;
  market?: Market;
  ticker?: Ticker;
  book?: OrderBookData;
  trades?: RecentTrade[];
  /** Tick size shown in the book's stepper. Defaults to the market's own tick size. */
  tickSize?: string;
}

/**
 * The whole /trade/[market] screen. Placement (see `.terminal` in globals.css):
 *
 *   ticker ─────────────┐  order
 *   chart  │ book       │  form
 *   ───────┴────────────┘
 *
 * Every data prop is optional: with none passed, each panel renders its empty state.
 * `key={symbol}` on the stateful panels resets their local state (tabs, form inputs)
 * when the user switches market without a full page load.
 */
export function TradeTerminal({ symbol, market, ticker, book, trades, tickSize }: TradeTerminalProps) {
  return (
    <div className="terminal">
      <div className="t-ticker min-w-0">
        <TickerBar key={symbol} symbol={symbol} market={market} ticker={ticker} />
      </div>
      <div className="t-chart grid min-h-0 min-w-0">
        <ChartPanel />
      </div>
      <div className="t-book grid min-h-0 min-w-0">
        <BookPanel
          key={symbol}
          book={book}
          trades={trades}
          base={market?.baseSymbol}
          quote={market?.quoteSymbol}
          tickSize={tickSize ?? market?.filters.price.tickSize}
        />
      </div>
      <div className="t-form min-w-0">
        <OrderForm key={symbol} base={market?.baseSymbol} quote={market?.quoteSymbol} />
      </div>
    </div>
  );
}

/** Same grid, empty panels. Use as the Suspense fallback while a market's data is loading. */
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
