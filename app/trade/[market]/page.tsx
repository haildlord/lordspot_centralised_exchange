import { Suspense } from "react";
import { TerminalSkeleton, TradeTerminal } from "@/components/trade/TradeTerminal";
import { getDepth, getMarkets, getTickers } from "@/lib/api";
import { Depth } from "@/lib/types";

type Params = PageProps<"/trade/[market]">["params"];

export default function TradePage({ params }: PageProps<"/trade/[market]">) {
  return (
    <Suspense fallback={<TerminalSkeleton />}>
      <Terminal params={params} />
    </Suspense>
  );
}

async function Terminal({ params }: { params: Params }) {
  const { market: symbol } = await params;

  const [depth, markets, tickers] = await Promise.all([
    getDepth(symbol),
    getMarkets(),
    getTickers(),
  ]);

  const marketInfo = markets.find((m) => m.symbol === symbol);
  const tickerInfo = tickers.find((t) => t.symbol === symbol);

  return (
    <TradeTerminal
      symbol={symbol}
      depth={depth}
      market={marketInfo}
      ticker={tickerInfo}
    />
  );
}
