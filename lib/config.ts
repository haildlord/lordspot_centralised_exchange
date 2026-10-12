export const BRAND = {
  name: "LordsPot",
  tagline: "Rule the order book.",
} as const;

/** Where `/trade` redirects to, and where the "Trade" nav items point. */
export const DEFAULT_MARKET = "SOL_USD";

export const tradeHref = (symbol: string) => `/trade/${symbol}`;
