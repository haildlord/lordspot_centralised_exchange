import { Hero } from "@/components/landing/Hero";
import { LandingNav } from "@/components/landing/LandingNav";
import { MarketsTable } from "@/components/landing/MarketsTable";
import { getMarkets, getTickers } from "@/lib/api";
import { Ticker } from "@/lib/types";

export default async function Home() {
  const rawMarkets = (await getMarkets()).slice(0, 8);
  const tickers = await getTickers();
  
  const marketSymbols = new Set(rawMarkets.map((market) => market.symbol));
  
  const rawTickers = tickers.filter((ticker) =>
    marketSymbols.has(ticker.symbol)
  );

  let reducedTicker = rawTickers.reduce((obj : Record<string, Ticker>, item: Ticker) => {
    obj[item.symbol] = item;
    return obj;
  },{})

  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero trending={rawMarkets} />
        <MarketsTable markets={rawMarkets} tickers={reducedTicker}/>
      </main>
    </>
  );
}