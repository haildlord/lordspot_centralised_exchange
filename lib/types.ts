/**
 * Shapes the UI components render — types only, there is no data in this project.
 *
 * Swap these for your own axios response types, or map your responses into
 * these before passing them down. Every displayed value is a plain string:
 * format prices, percentages and volumes before they reach a component.
 * Colours are driven by the explicit `trend` / `side` fields, never inferred.
 */

export type Trend = "up" | "down" | "flat";
export type Side = "buy" | "sell";

/** One row in the market search, the landing table, the hero chips and the ticker tape. */
export interface Market {
  /** URL param, e.g. /trade/<symbol>. */
  symbol: string;
  base: string;
  quote: string;
  kind: "spot" | "perp";
  /** Asset name shown under the pair in the search palette. */
  name: string;
  /** Which palette category the market belongs to. */
  category: "crypto" | "stocks" | "perps";
  leverage?: string;
  lastPrice: string;
  changePct: string;
  trend: Trend;
  volume: string;
  /** Optional series for the landing-page sparkline (left = oldest). */
  spark?: number[];
}

/** The strip above the chart. */
export interface Ticker {
  lastPrice: string;
  change: string;
  changePct: string;
  trend: Trend;
  high: string;
  low: string;
  volume: string;
}

export interface BookLevel {
  price: string;
  size: string;
  total: string;
  /** 0–1: width of the background depth bar. */
  depth: number;
}

export interface OrderBookData {
  /** Top-to-bottom as drawn: highest price first, best (lowest) ask last. */
  asks: BookLevel[];
  /** Top-to-bottom as drawn: best (highest) bid first. */
  bids: BookLevel[];
  lastPrice: string;
  trend: Trend;
  /** 0–100: share of buy-side volume for the pressure bar. */
  buyPct: number;
}

export interface RecentTrade {
  id: string | number;
  price: string;
  qty: string;
  time: string;
  /** Taker side; decides the price colour. */
  side: Side;
}
