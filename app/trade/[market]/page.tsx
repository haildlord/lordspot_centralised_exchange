import type { Metadata } from "next";
import { Suspense } from "react";
import { TerminalSkeleton, TradeTerminal } from "@/components/trade/TradeTerminal";

type Params = PageProps<"/trade/[market]">["params"];

export async function generateMetadata({ params }: PageProps<"/trade/[market]">): Promise<Metadata> {
  const { market } = await params;
  return { title: `Trade ${market}` };
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

  // TODO(api): fetch this market's ticker, order book and trades here (axios) and pass
  //            them to <TradeTerminal />. It already sits under <Suspense>, so awaiting
  //            data in this async component is fine; call notFound() for unknown markets.
  return <TradeTerminal symbol={market} />;
}
