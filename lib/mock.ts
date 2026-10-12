/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MOCK DATA — placeholder only. Replace the two exported functions below with
 *  your real data source and the whole UI follows:
 *
 *    MARKETS                 -> list of Market   (search palette, landing table)
 *    getTerminalData(symbol) -> TerminalData     (everything on /trade/[market])
 *
 *  Everything here is deterministic (seeded PRNG, fixed clock) so server and
 *  client render identical markup. There is no Math.random() / Date.now().
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type {
  BookLevel,
  Candle,
  Market,
  MarketCategory,
  RecentTrade,
  TerminalData,
} from "./types";
import { formatCompact, formatThousands, parseSymbol, trendOf } from "./format";

/* ───────────────────────────── seeded randomness ───────────────────────────── */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — tiny, fast, good enough for fake market data. */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The "current time" of the mock world: 2026-10-12 12:00:00 UTC. */
const MOCK_NOW = Date.UTC(2026, 9, 12, 12, 6, 11);
const HOUR = 3_600_000;

/* ────────────────────────────────── markets ────────────────────────────────── */

interface MarketSeed {
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  changePct: number;
  /** 24h quote volume in USD. */
  volume: number;
  leverage?: string;
}

// Ordered by 24h volume (same order the search palette shows).
const SEEDS: MarketSeed[] = [
  { symbol: "USDT_USD", name: "Tether", category: "crypto", price: 0.999, changePct: -0.01, volume: 7_500_000 },
  { symbol: "BTC_USD", name: "Bitcoin", category: "crypto", price: 83697.2, changePct: 0.83, volume: 2_300_000, leverage: "10x" },
  { symbol: "SOL_USD", name: "Solana", category: "crypto", price: 112.07, changePct: 2.42, volume: 1_200_000, leverage: "10x" },
  { symbol: "ETH_USD", name: "Ethereum", category: "crypto", price: 2555.22, changePct: 2.11, volume: 937_400, leverage: "10x" },
  { symbol: "ZEC_USD", name: "Zcash", category: "crypto", price: 1324.61, changePct: 8.27, volume: 318_100, leverage: "5x" },
  { symbol: "HYPE_USD", name: "Hyperliquid", category: "crypto", price: 87.406, changePct: 2.85, volume: 161_200, leverage: "5x" },
  { symbol: "JUP_USD", name: "Jupiter", category: "crypto", price: 0.8421, changePct: -1.32, volume: 98_400, leverage: "3x" },
  { symbol: "BNB_USD", name: "BNB", category: "crypto", price: 612.45, changePct: 0.41, volume: 84_900, leverage: "5x" },
  { symbol: "XRP_USD", name: "XRP", category: "crypto", price: 2.1832, changePct: -0.74, volume: 77_300, leverage: "5x" },
  { symbol: "DOGE_USD", name: "Dogecoin", category: "crypto", price: 0.18214, changePct: 3.18, volume: 64_000, leverage: "5x" },
  { symbol: "LINK_USD", name: "Chainlink", category: "crypto", price: 14.286, changePct: 1.07, volume: 41_200, leverage: "5x" },
  { symbol: "AVAX_USD", name: "Avalanche", category: "crypto", price: 21.934, changePct: -2.11, volume: 33_800, leverage: "5x" },
  { symbol: "TSLA_USD", name: "Tesla", category: "stocks", price: 248.31, changePct: 1.12, volume: 212_600, leverage: "3x" },
  { symbol: "NVDA_USD", name: "Nvidia", category: "stocks", price: 118.74, changePct: -0.65, volume: 188_000, leverage: "3x" },
  { symbol: "AAPL_USD", name: "Apple", category: "stocks", price: 231.05, changePct: 0.22, volume: 140_700, leverage: "3x" },
  { symbol: "BTC_USD_PERP", name: "Bitcoin Perpetual", category: "perps", price: 83702.5, changePct: 0.85, volume: 48_200_000, leverage: "50x" },
  { symbol: "ETH_USD_PERP", name: "Ethereum Perpetual", category: "perps", price: 2556.1, changePct: 2.14, volume: 21_700_000, leverage: "50x" },
  { symbol: "SOL_USD_PERP", name: "Solana Perpetual", category: "perps", price: 112.12, changePct: 2.47, volume: 17_900_000, leverage: "25x" },
];

/** Decimals used to display a price of this magnitude. */
function decimalsFor(price: number): number {
  if (price >= 10_000) return 1;
  if (price >= 100) return 2;
  if (price >= 10) return 3;
  if (price >= 0.1) return 4;
  return 5;
}

function signedPct(pct: number): string {
  const sign = pct < 0 ? "-" : "+";
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
}

function makeSpark(symbol: string, pct: number): number[] {
  const rng = createRng(hashString(`spark:${symbol}`));
  const points = 28;
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < points; i++) {
    v += (rng() - 0.5) * 2.4;
    out.push(v + pct * 0.7 * (i / (points - 1)));
  }
  return out;
}

function buildMarket(seed: MarketSeed): Market {
  const { base, quote, kind } = parseSymbol(seed.symbol);
  return {
    symbol: seed.symbol,
    base,
    quote,
    kind,
    name: seed.name,
    category: seed.category,
    leverage: seed.leverage,
    lastPrice: formatThousands(seed.price, decimalsFor(seed.price)),
    changePct: signedPct(seed.changePct),
    volume: `$${formatCompact(seed.volume, 1, true)}`,
    spark: makeSpark(seed.symbol, seed.changePct),
  };
}

export const MARKETS: Market[] = SEEDS.map(buildMarket);

interface Resolved {
  market: Market;
  price: number;
  pct: number;
}

/** Known market, or a plausible stand-in so ANY /trade/FOO_BAR url renders. */
function resolve(symbol: string): Resolved {
  const seed = SEEDS.find((s) => s.symbol === symbol);
  if (seed) return { market: buildMarket(seed), price: seed.price, pct: seed.changePct };

  const h = hashString(symbol);
  const { base, kind } = parseSymbol(symbol);
  const price = 1 + (h % 49_900) / 100;
  const pct = ((h >>> 8) % 1400) / 100 - 7;
  return {
    market: buildMarket({
      symbol,
      name: base,
      category: kind === "perp" ? "perps" : "crypto",
      price,
      changePct: pct,
      volume: 50_000 + (h % 900_000),
      leverage: "5x",
    }),
    price,
    pct,
  };
}

export function getMarket(symbol: string): Market {
  return resolve(symbol.toUpperCase()).market;
}

/* ───────────────────────────── terminal (one market) ───────────────────────── */

const pad2 = (n: number) => String(n).padStart(2, "0");

function clockString(totalSeconds: number): string {
  const s = ((totalSeconds % 86_400) + 86_400) % 86_400;
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

function sizeString(n: number): string {
  if (n >= 1000) return formatCompact(n, 2);
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

function makeCandles(symbol: string, price: number): Candle[] {
  const rng = createRng(hashString(`candles:${symbol}`));
  const count = 96;
  const vol = price * 0.006;
  const lastOpen = MOCK_NOW - (MOCK_NOW % HOUR); // the current (still-forming) hour
  const start = lastOpen - (count - 1) * HOUR;
  const unitVolume = 150_000 / price;

  const raw: Array<{ o: number; h: number; l: number; c: number; v: number }> = [];
  let close = price;
  for (let i = 0; i < count; i++) {
    const open = close;
    close = Math.max(open + (rng() - 0.5) * 2 * vol, price * 0.25);
    const high = Math.max(open, close) + rng() * vol * 0.6;
    const low = Math.min(open, close) - rng() * vol * 0.6;
    raw.push({ o: open, h: high, l: low, c: close, v: (0.25 + rng() * 1.1) * unitVolume });
  }
  // Rescale so the final close lands exactly on the market's last price.
  const k = price / raw[count - 1].c;
  return raw.map((r, i) => ({
    time: start + i * HOUR,
    open: r.o * k,
    high: r.h * k,
    low: r.l * k,
    close: r.c * k,
    volume: r.v,
  }));
}

export function getTerminalData(rawSymbol: string): TerminalData {
  const symbol = rawSymbol.toUpperCase();
  const { market, price, pct } = resolve(symbol);
  const decimals = decimalsFor(price);
  const tick = 10 ** -decimals;
  const fmt = (n: number) => formatThousands(n, decimals);
  const rng = createRng(hashString(`book:${symbol}`));

  /* ── candles + ticker ── */
  const candles = makeCandles(symbol, price);
  const last24 = candles.slice(-24);
  const high = Math.max(...last24.map((c) => c.high));
  const low = Math.min(...last24.map((c) => c.low));
  const change = price - price / (1 + pct / 100);
  const quoteVolume = last24.reduce((sum, c) => sum + c.volume * c.close, 0);
  const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;

  /* ── order book (built outward from the spread) ── */
  const levels = 24;
  const unit = 1800 / price; // ≈ $1.8k of size per level
  const askRaw: Array<{ price: number; size: number }> = [];
  const bidRaw: Array<{ price: number; size: number }> = [];
  let ask = price + tick * (1 + Math.floor(rng() * 2));
  let bid = price - tick * (1 + Math.floor(rng() * 2));
  for (let i = 0; i < levels; i++) {
    askRaw.push({ price: ask, size: (0.1 + rng() ** 2 * 1.9) * unit });
    bidRaw.push({ price: bid, size: (0.1 + rng() ** 2 * 1.9) * unit });
    ask += tick * (1 + Math.floor(rng() * 4));
    bid -= tick * (1 + Math.floor(rng() * 4));
  }
  let askTotal = 0;
  let bidTotal = 0;
  const askCum = askRaw.map((l) => ({ ...l, total: (askTotal += l.size) }));
  const bidCum = bidRaw.map((l) => ({ ...l, total: (bidTotal += l.size) }));
  const maxTotal = Math.max(askTotal, bidTotal);
  const toLevel = (l: { price: number; size: number; total: number }): BookLevel => ({
    price: fmt(l.price),
    size: sizeString(l.size),
    total: sizeString(l.total),
    depth: l.total / maxTotal,
  });

  const trend = trendOf(market.changePct);
  const buyPct = Math.round((bidTotal / (bidTotal + askTotal)) * 100);

  /* ── recent trades ── */
  const trades: RecentTrade[] = [];
  const startSeconds = 12 * 3600 + 6 * 60 + 11;
  let tradePrice = price;
  for (let i = 0; i < 28; i++) {
    tradePrice += (rng() - 0.5) * tick * 6;
    trades.push({
      id: `${symbol}-${i}`,
      price: fmt(tradePrice),
      qty: sizeString((0.05 + rng() ** 2 * 2.5) * unit),
      time: clockString(startSeconds - Math.floor(i * 1.7)),
      side: rng() > 0.48 ? "buy" : "sell",
    });
  }

  return {
    market,
    decimals,
    tickSize: tick.toFixed(decimals),
    volumeLabel: `Volume SMA ${formatCompact(avgVolume, 3)}`,
    ticker: {
      symbol,
      lastPrice: market.lastPrice,
      change: `${change < 0 ? "-" : "+"}${Math.abs(change).toFixed(decimals + 1)}`,
      changePct: market.changePct,
      high: fmt(high),
      low: fmt(low),
      volume: formatThousands(quoteVolume, 2),
    },
    book: {
      asks: askCum.map(toLevel).reverse(),
      bids: bidCum.map(toLevel),
      lastPrice: market.lastPrice,
      trend,
      buyPct,
    },
    trades,
    candles,
  };
}
