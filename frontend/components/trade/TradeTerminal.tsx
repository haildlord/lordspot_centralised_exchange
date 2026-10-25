import type { Depth, Market, OrderBookData, RecentTrade, Ticker } from "@/lib/types";
import { BookPanel } from "./BookPanel";
import { ChartPanel } from "./ChartPanel";
import { OrderForm } from "./OrderForm";
import { TickerBar } from "./TickerBar";

interface TradeTerminalProps {
  symbol: string;
  market?: Market;
  ticker?: Ticker;
  book?: OrderBookData;
  tickSize?: string;
  depth: Depth;
}

export function TradeTerminal({ symbol, market, ticker, book, tickSize, depth }: TradeTerminalProps) {
  return (
    <div className="terminal">
      <div className="t-ticker min-w-0">
        <TickerBar key={symbol} symbol={symbol} market={market} ticker={ticker} />
      </div>
      <div className="t-chart grid min-h-0 min-w-0">
        <ChartPanel symbol={symbol} />
      </div>
      <div className="t-book grid min-h-0 min-w-0">
        <BookPanel
          key={symbol}
          symbol={symbol}
          book={book}
          base={market?.baseSymbol}
          quote={market?.quoteSymbol}
          tickSize={tickSize ?? market?.filters.price.tickSize}
          depth={depth}
        />
      </div>
      <div className="t-form min-w-0">
        <OrderForm
          key={symbol}
          symbol={symbol}
          initialPrice={ticker?.lastPrice}
          base={market?.baseSymbol}
          quote={market?.quoteSymbol}
        />
      </div>
    </div>
  );
}

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
