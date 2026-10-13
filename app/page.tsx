import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { LandingNav } from "@/components/landing/LandingNav";
import { MarketsTable } from "@/components/landing/MarketsTable";
import { TickerTape } from "@/components/landing/TickerTape";
import type { Market } from "@/lib/types";

/**
 * Landing page. No data yet — the sections below render their empty states.
 * TODO(api): fetch the market list (axios) and fill `markets`; the hero chips,
 * ticker tape and table all read from it.
 */
export default function Home() {
  const markets: Market[] = [];

  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero trending={markets.slice(0, 5)} />
        <TickerTape markets={markets} />
        <MarketsTable markets={markets.slice(0, 8)} />
      </main>
      <Footer />
    </>
  );
}
