import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { Market, Ticker } from "@/lib/types";
import { cn } from "@/lib/cn";
import { OpenPaletteButton } from "@/components/search/OpenPaletteButton";
import { PairLabel } from "@/components/ui/PairLabel";
import { TokenAvatar } from "@/components/ui/TokenAvatar";

const COLS = "grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_100px_minmax(0,1fr)_28px]";
const EMPTY = "—";

export function MarketsTable({ markets = [], tickers }: { markets?: Market[]; tickers?: Record<string, Ticker> }) {
  return (
    <section id="markets" className="reveal mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-gold-400">Markets</p>
          <h2 className="mt-2 font-display text-[clamp(34px,5vw,48px)] leading-none tracking-tight">Popular right now</h2>
        </div>
        <OpenPaletteButton className="btn btn-secondary">
          <Search size={16} />
          Browse all markets
        </OpenPaletteButton>
      </div>

      <div className="panel overflow-hidden">
        <div className={cn("grid items-center gap-x-4 px-5 py-3 text-[12px] font-medium text-fg-3", COLS)}>
          <span>Market</span>
          <span className="text-right">Last price</span>
          <span className="text-right">24h change</span>
          <span className="text-right">24h volume</span>
          <span />
        </div>

        {markets.length === 0 && (
          <p className="border-t border-line/70 px-5 py-14 text-center text-[14px] text-fg-3">No markets to show</p>
        )}

        {markets.map((m) => {
          const t = tickers?.[m.symbol];
          return (
            <Link
              key={m.symbol}
              href={`/trade/${m.symbol}`}
              className={cn(
                "group relative grid items-center gap-x-4 border-t border-line/70 px-5 py-3.5 transition-colors duration-300 hover:bg-white/[0.035]",
                "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:origin-center before:scale-y-0 before:rounded-full before:bg-gold-400 before:transition-transform before:duration-300 hover:before:scale-y-100",
                COLS,
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <TokenAvatar baseSymbol={m.baseSymbol} size={36} />
                <span className="min-w-0">
                  <span className="block text-[15px] leading-tight">
                    <PairLabel market={m} />
                  </span>
                  <span className="block truncate text-[12px] text-fg-3">{m.marketType === "PERP" ? "Perpetual" : "Spot"}</span>
                </span>
              </span>
              <span className="num text-right text-[15px] font-medium text-fg">{t?.lastPrice ?? EMPTY}</span>
              <span className={cn("num text-right text-[14px]",Number(t?.priceChangePercent) > 0 ? "text-up" : Number(t?.priceChangePercent) < 0 ? "text-down" : "text-fg-2")}>
                {t?.priceChangePercent ? `${(Number(t.priceChangePercent) * 100).toFixed(2)}%` : EMPTY}
              </span>
              <span className="num text-right text-[14px] text-fg-2">{t?.volume ?? EMPTY}</span>
              <ArrowUpRight
                size={18}
                className="text-fg-3 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-400"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
