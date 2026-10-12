import Link from "next/link";
import type { Market } from "@/lib/types";
import { tradeHref } from "@/lib/config";
import { TREND_TEXT, trendOf } from "@/lib/format";
import { SearchTrigger } from "@/components/search/SearchTrigger";

/** Headline + the big market search. `trending` is a short list of quick-jump chips. */
export function Hero({ trending }: { trending: Market[] }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* backdrop */}
      <div aria-hidden className="hero-grid absolute inset-x-0 top-0 -z-10 h-[640px]" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[-240px] -z-10 h-[640px] w-[1000px] -translate-x-1/2 animate-drift rounded-full bg-[radial-gradient(closest-side,rgb(243_177_58/0.2),transparent)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute right-[-140px] top-44 -z-10 h-[440px] w-[440px] animate-drift rounded-full [animation-direction:alternate-reverse] [animation-duration:20s] bg-[radial-gradient(closest-side,rgb(143_127_255/0.15),transparent)] blur-2xl"
      />

      <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 text-center">
        <p className="animate-fade-up mx-auto inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-panel/70 px-4 py-1.5 text-[13px] text-fg-2 backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/60" />
            <span className="relative size-2 rounded-full bg-gold-400" />
          </span>
          Order-book exchange · Spot &amp; Perps
        </p>

        <h1
          className="animate-fade-up mt-7 font-display text-[clamp(52px,9.5vw,108px)] leading-[0.94] tracking-[-0.02em] text-fg"
          style={{ animationDelay: "80ms" }}
        >
          Rule the <em className="gold-text pr-[0.08em]">order&nbsp;book.</em>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-xl text-[18px] leading-relaxed text-fg-2"
          style={{ animationDelay: "160ms" }}
        >
          Search any market, read the book, and place your order — all from one fast, focused trading terminal.
        </p>

        <div className="animate-fade-up mx-auto mt-10 max-w-2xl" style={{ animationDelay: "240ms" }}>
          <SearchTrigger variant="hero" />
        </div>

        <div
          className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-2 text-[13px]"
          style={{ animationDelay: "320ms" }}
        >
          <span className="mr-1 text-fg-3">Trending</span>
          {trending.map((m) => (
            <Link
              key={m.symbol}
              href={tradeHref(m.symbol)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-3.5 py-1.5 transition duration-300 hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-raise"
            >
              <span className="font-medium text-fg">
                {m.base}/{m.quote}
              </span>
              <span className={`num ${TREND_TEXT[trendOf(m.changePct)]}`}>{m.changePct}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
