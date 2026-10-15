import { Suspense } from "react";
import { TerminalSkeleton, TradeTerminal } from "@/components/trade/TradeTerminal";
import { getDepth } from "@/lib/api";
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
  
  const { market } = await params;
  const depth : Depth = await getDepth(market);

  return <TradeTerminal symbol={market} depth={depth}/>;
}
