import type { MarketKind, Trend } from "./types";

/**
 * Small display helpers. None of these touch the network or the clock, so they
 * are safe to call during server rendering and give identical output on the client.
 */

/** "+5.67%" -> "up", "-0.01%" -> "down", "0.00%" -> "flat". */
export function trendOf(value: string): Trend {
  const v = value.trim();
  const hasDigit = /[1-9]/.test(v);
  if (!hasDigit) return "flat";
  return v.startsWith("-") || v.startsWith("−") ? "down" : "up";
}

/** Tailwind text colour per trend. Written out in full so Tailwind can see the class names. */
export const TREND_TEXT: Record<Trend, string> = {
  up: "text-up",
  down: "text-down",
  flat: "text-fg-2",
};

/** 1234567.891, 2 -> "1,234,567.89". Locale-independent on purpose (no hydration drift). */
export function formatThousands(n: number, decimals: number): string {
  const [int, frac] = n.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

/** 1042 -> "1.04K", 7_500_000 -> "7.50M". `trim` drops trailing zeros ("7.5M", "1M"). */
export function formatCompact(n: number, digits = 2, trim = false): string {
  const abs = Math.abs(n);
  let value = n;
  let suffix = "";
  if (abs >= 1e9) [value, suffix] = [n / 1e9, "B"];
  else if (abs >= 1e6) [value, suffix] = [n / 1e6, "M"];
  else if (abs >= 1e3) [value, suffix] = [n / 1e3, "K"];
  let out = value.toFixed(digits);
  if (trim && out.includes(".")) out = out.replace(/\.?0+$/, "");
  return `${out}${suffix}`;
}

/** "SOL_USD" -> { base: "SOL", quote: "USD", kind: "spot" }; "SOL_USD_PERP" -> kind "perp". */
export function parseSymbol(symbol: string): { base: string; quote: string; kind: MarketKind } {
  const [base = "", quote = "", suffix] = symbol.toUpperCase().split("_");
  return { base, quote, kind: suffix === "PERP" ? "perp" : "spot" };
}

/** Accepts BASE_QUOTE and BASE_QUOTE_PERP style symbols (any case). Guards the /trade/[market] route. */
export function isValidSymbol(symbol: string): boolean {
  return /^[A-Za-z0-9]{1,12}(_[A-Za-z0-9]{1,12}){1,2}$/.test(symbol);
}
