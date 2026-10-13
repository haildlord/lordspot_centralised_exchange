import type { Market } from "@/lib/types";
import { TREND_TEXT } from "@/components/ui/trend";

/**
 * Endless price marquee. The list is rendered twice so the -50% loop is seamless.
 * Renders nothing until it has markets.
 */
export function TickerTape({ markets = [] }: { markets?: Market[] }) {
  if (markets.length === 0) return null;
  const items = [...markets, ...markets];
  return (
    <div
      aria-hidden
      className="group relative overflow-hidden border-y border-line/70 bg-panel/40 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
    >
      <div className="flex w-max animate-marquee py-3.5 group-hover:[animation-play-state:paused]">
        {items.map((m, i) => (
          <div key={`${m.symbol}-${i}`} className="flex items-center gap-2.5 pr-10 text-[13px]">
            <span className="font-medium text-fg">
              {m.base}/{m.quote}
            </span>
            <span className="num text-fg-2">{m.lastPrice}</span>
            <span className={`num ${TREND_TEXT[m.trend]}`}>{m.changePct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
