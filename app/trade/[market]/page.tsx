import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TerminalSkeleton, TradeTerminal } from "@/components/trade/TradeTerminal";
import { isValidSymbol, trendOf } from "@/lib/format";
import { MARKETS, getMarket, getTerminalData } from "@/lib/mock";

type Params = PageProps<"/trade/[market]">["params"];

/** Pre-render the markets we know about; any other BASE_QUOTE url still works at request time. */
export function generateStaticParams() {
  return MARKETS.map((m) => ({ market: m.symbol }));
}

export async function generateMetadata({ params }: PageProps<"/trade/[market]">): Promise<Metadata> {
  const { market } = await params;
  if (!isValidSymbol(market)) return { title: "Market not found" };

  const m = getMarket(market);
  const trend = trendOf(m.changePct);
  const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : "•";
  const pair = m.kind === "perp" ? `${m.base}-PERP` : `${m.base}/${m.quote}`;
  return { title: `${arrow} ${m.lastPrice} | Trade ${pair}` };
}

export default function TradePage({ params }: PageProps<"/trade/[market]">) {
  return (
    <Suspense fallback={<TerminalSkeleton />}>
      <Terminal params={params} />
    </Suspense>
  );
}

async function Terminal({ params }: { params: Params }) {
  const { market } = await params;
  if (!isValidSymbol(market)) notFound();

  // TODO(api): replace getTerminalData() with your own fetches and build a TerminalData
  //            (see lib/types.ts). With Cache Components, fetch inside this async component
  //            (it is already under <Suspense>) or mark the fetcher with "use cache".
  const data = getTerminalData(market);

  return <TradeTerminal data={data} />;
}
