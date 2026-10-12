import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { LandingNav } from "@/components/landing/LandingNav";
import { MarketsTable } from "@/components/landing/MarketsTable";
import { TickerTape } from "@/components/landing/TickerTape";
import { MARKETS } from "@/lib/mock";
import type { Market } from "@/lib/types";

const TRENDING = ["SOL_USD", "BTC_USD", "ETH_USD", "HYPE_USD", "ZEC_USD"];

/**
 * Landing page. Static today; every list below comes from MARKETS (lib/mock.ts)
 * so swapping in real data is a one-line change.
 */
export default function Home() {
  const trending = TRENDING.map((s) => MARKETS.find((m) => m.symbol === s)).filter((m): m is Market => !!m);
  const popular = MARKETS.filter((m) => m.category === "crypto" && m.base !== "USDT").slice(0, 8);

  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero trending={trending} />
        <TickerTape markets={MARKETS.filter((m) => m.category !== "perps")} />
        <MarketsTable markets={popular} />
      </main>
      <Footer />
    </>
  );
}
