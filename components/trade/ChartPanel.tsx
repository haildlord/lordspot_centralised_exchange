import type { TerminalData } from "@/lib/types";
import { PriceChart } from "./PriceChart";

/**
 * The chart panel — just the chart, nothing else.
 *
 * TODO(tradingview): when you move to the TradingView widget, replace <PriceChart />
 * with it. The panel chrome (border, radius, sizing) and its grid slot stay as they are.
 */
export function ChartPanel({ data }: { data: TerminalData }) {
  return (
    <section aria-label="Chart" className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <PriceChart data={data} />
    </section>
  );
}
