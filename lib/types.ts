/**
 * Data contracts for the LordsPot UI.
 *
 * Every component in `components/` is purely presentational: it receives these
 * shapes as props and renders them. To go live, build objects of these shapes
 * from your API / websocket and pass them in — no component needs to change.
 *
 * Convention: anything that is *displayed* is a ready-to-render string
 * (e.g. "1.17600", "+5.67%", "$1.2M") so the components contain no number
 * formatting or maths. The only numeric fields are the ones a chart needs to
 * plot (candles, sparkline) or a bar needs to size (`depth`).
 *
 * Rough mapping from the orderbook API in week-2:
 *   Ticker   <- GET /tickers   (+ formatting)
 *   Depth    <- GET /depth     -> OrderBookData
 *   Trade    <- GET /trades    -> RecentTrade
 *   KLine    <- GET /klines    -> Candle (numbers instead of strings)
 */

export type MarketCategory = "crypto" | "stocks" | "perps" | "earn";
export type MarketKind = "spot" | "perp";
export type Trend = "up" | "down" | "flat";
export type Side = "buy" | "sell";

/** A tradable pair. Drives the search palette, the landing table and the ticker bar. */
export interface Market {
  /** URL param, e.g. "SOL_USD" -> /trade/SOL_USD. Perps look like "SOL_USD_PERP". */
  symbol: string;
  base: string;
  quote: string;
  kind: MarketKind;
  /** Human name of the base asset, e.g. "Solana". */
  name: string;
  category: MarketCategory;
  /** Optional leverage badge shown next to the pair in the ticker bar, e.g. "8x". */
  leverage?: string;
  lastPrice: string;
  /** Signed, e.g. "+2.42%" or "-0.01%". The sign decides the colour. */
  changePct: string;
  /** 24h quote volume, e.g. "$1.2M". */
  volume: string;
  /** Small series for the landing-page sparkline (any scale, left = oldest). */
  spark: number[];
}

/** Header strip above the chart. */
export interface Ticker {
  symbol: string;
  lastPrice: string;
  /** Signed absolute change, e.g. "+0.06315". */
  change: string;
  /** Signed percentage, e.g. "+5.67%". */
  changePct: string;
  high: string;
  low: string;
  /** 24h volume in quote currency, e.g. "1,013,603.81". */
  volume: string;
}

export interface BookLevel {
  price: string;
  size: string;
  /** Cumulative size from the best price outward. */
  total: string;
  /** 0–1 — width of the background depth bar (usually total / max total). */
  depth: number;
}

export interface OrderBookData {
  /**
   * Both sides are in on-screen, top-to-bottom order:
   *  - `asks`: highest price first … best (lowest) ask LAST, so it sits next to the mid row.
   *  - `bids`: best (highest) bid FIRST … lowest price last.
   */
  asks: BookLevel[];
  bids: BookLevel[];
  /** Mid row between asks and bids. */
  lastPrice: string;
  trend: Trend;
  /** 0–100 — share of buy-side volume for the 60% | 40% bar. */
  buyPct: number;
}

export interface RecentTrade {
  id: string | number;
  price: string;
  qty: string;
  /** Display time, e.g. "12:06:11". */
  time: string;
  /** Taker side — decides the price colour. */
  side: Side;
}

/** One OHLCV bar. `time` is the bar's open time in epoch milliseconds (UTC). */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Everything the trade terminal renders for one market. */
export interface TerminalData {
  market: Market;
  ticker: Ticker;
  book: OrderBookData;
  trades: RecentTrade[];
  candles: Candle[];
  /** Number of decimals used for prices on this market (axis labels, crosshair). */
  decimals: number;
  /** Footer-of-chart label, e.g. "Volume SMA 20.516K". */
  volumeLabel: string;
  /** Book tick size shown in the stepper, e.g. "0.0001". */
  tickSize: string;
}
